import { createContext, useContext, useEffect, useState } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';

interface Profile {
  id: string;
  user_id: string;
  email: string;
  full_name: string | null;
  phone_number: string | null;
  role: string;
  allocated_subscription_products: string[] | null;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  profile: Profile | null;
  isAdmin: boolean;
  loading: boolean;
  signUp: (email: string, password: string, fullName?: string, phoneNumber?: string) => Promise<{ error: any }>;
  signIn: (emailOrPhone: string, password: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isSigningOut, setIsSigningOut] = useState(false);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state change:', event, session?.user?.email);
        
        // If we're in the middle of signing out, don't restore the session
        if (isSigningOut && event === 'SIGNED_OUT') {
          setSession(null);
          setUser(null);
          setProfile(null);
          setLoading(false);
          setIsSigningOut(false);
          return;
        }
        
        // Don't process session changes during sign out
        if (isSigningOut) {
          return;
        }
        
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          // Fetch user profile
          setTimeout(async () => {
            const { data: profileData, error } = await supabase
              .from('profiles')
              .select('*')
              .eq('user_id', session.user.id)
              .single();
            
            if (error) {
              console.error('Error fetching profile:', error);
            }
            
            setProfile(profileData);
            setLoading(false);
          }, 0);
        } else {
          setProfile(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session only if not signing out
    if (!isSigningOut) {
      supabase.auth.getSession().then(({ data: { session } }) => {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          supabase
            .from('profiles')
            .select('*')
            .eq('user_id', session.user.id)
            .single()
            .then(({ data: profileData }) => {
              setProfile(profileData);
              setLoading(false);
            });
        } else {
          setLoading(false);
        }
      });
    }

    return () => subscription.unsubscribe();
  }, [isSigningOut]);

  const signUp = async (email: string, password: string, fullName?: string, phoneNumber?: string) => {
    const redirectUrl = `${window.location.origin}/`;
    
    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: redirectUrl,
        data: { 
          full_name: fullName || undefined,
          phone_number: phoneNumber || undefined
        }
      }
    });
    
    return { error };
  };

  const signIn = async (emailOrPhone: string, password: string) => {
    // Check if input is email or phone number
    const isEmail = emailOrPhone.includes('@');
    
    if (isEmail) {
      // Sign in with email
      const { error } = await supabase.auth.signInWithPassword({
        email: emailOrPhone,
        password,
      });
      return { error };
    } else {
      // Sign in with phone number - first normalize the phone number and find the email
      const normalizedPhone = emailOrPhone.replace(/\D/g, ''); // Remove all non-digits
      
      console.log('Searching for phone number:', normalizedPhone);
      
      // Try to find profile with exact match first
      let { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('email, phone_number')
        .eq('phone_number', emailOrPhone)
        .maybeSingle();
      
      // If no exact match, try with normalized phone number
      if (!profile && !profileError) {
        console.log('No exact match, trying normalized search');
        const { data: profiles } = await supabase
          .from('profiles')
          .select('email, phone_number')
          .not('phone_number', 'is', null);
        
        // Find profile where normalized phone matches
        profile = profiles?.find(p => {
          if (!p.phone_number) return false;
          const storedNormalized = p.phone_number.replace(/\D/g, '');
          return storedNormalized === normalizedPhone;
        }) || null;
      }
      
      console.log('Found profile:', profile);
      
      if (!profile) {
        return { error: { message: 'No account found with this phone number. Please check the number or sign up first.' } };
      }
      
      // Now sign in with the found email
      const { error } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password,
      });
      
      if (error) {
        // Provide more specific error messages
        if (error.message.includes('Invalid login credentials')) {
          return { error: { message: 'Incorrect password. Please try again.' } };
        }
        return { error };
      }
      
      return { error: null };
    }
  };

  const signOut = async () => {
    try {
      console.log('Starting sign out process...');
      
      // Set signing out flag to prevent session restoration
      setIsSigningOut(true);
      
      // Clear local state immediately
      setUser(null);
      setSession(null);
      setProfile(null);
      
      // Sign out from Supabase
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('Sign out error:', error);
        setIsSigningOut(false); // Reset flag on error
        throw error;
      }
      
      console.log('Successfully signed out');
      
      // Force redirect to home page after a brief delay
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
      
    } catch (error) {
      console.error('Error during sign out:', error);
      // Reset signing out flag on error
      setIsSigningOut(false);
      // Even if there's an error, clear the local state and redirect
      setUser(null);
      setSession(null);
      setProfile(null);
      setTimeout(() => {
        window.location.href = '/';
      }, 100);
    }
  };

  const isAdmin = profile?.role === 'admin';

  return (
    <AuthContext.Provider value={{
      user,
      session,
      profile,
      isAdmin,
      loading,
      signUp,
      signIn,
      signOut,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
