
import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { UserPlus } from 'lucide-react';
import PasswordStrengthIndicator from '@/components/PasswordStrengthIndicator';
import ReCAPTCHA from 'react-google-recaptcha';
import { RECAPTCHA_SITE_KEY } from '@/config/recaptcha';

interface SignUpFormProps {
  onSuccess?: () => void;
}

const SignUpForm = ({ onSuccess }: SignUpFormProps) => {
  const { signUp } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [signupPassword, setSignupPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [recaptchaToken, setRecaptchaToken] = useState<string | null>(null);
  const [recaptchaLoaded, setRecaptchaLoaded] = useState(false);
  const [recaptchaError, setRecaptchaError] = useState(false);
  const [debugInfo, setDebugInfo] = useState<string[]>([]);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

  // Add debug logging
  const addDebugInfo = (message: string) => {
    console.log(`reCAPTCHA Debug: ${message}`);
    setDebugInfo(prev => [...prev, `${new Date().toLocaleTimeString()}: ${message}`]);
  };

  useEffect(() => {
    addDebugInfo('Component mounted, checking reCAPTCHA environment');
    
    // Check if reCAPTCHA script is available
    if (typeof window !== 'undefined') {
      addDebugInfo(`Window available: ${!!window}`);
      addDebugInfo(`grecaptcha available: ${!!(window as any).grecaptcha}`);
      addDebugInfo(`Site key: ${RECAPTCHA_SITE_KEY}`);
    }

    // Set a timeout to check if reCAPTCHA loads within 10 seconds
    const timeout = setTimeout(() => {
      if (!recaptchaLoaded && !recaptchaError) {
        addDebugInfo('reCAPTCHA failed to load within 10 seconds');
        setRecaptchaError(true);
      }
    }, 10000);

    return () => clearTimeout(timeout);
  }, [recaptchaLoaded, recaptchaError]);

  const validatePasswordMatch = () => {
    return signupPassword === confirmPassword;
  };

  const validatePasswordStrength = () => {
    const checks = {
      length: signupPassword.length >= 8,
      lowercase: /[a-z]/.test(signupPassword),
      uppercase: /[A-Z]/.test(signupPassword),
      number: /\d/.test(signupPassword),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(signupPassword),
    };
    
    const score = Object.values(checks).filter(Boolean).length;
    return score >= 3;
  };

  const handleRecaptchaChange = (token: string | null) => {
    addDebugInfo(`Token received: ${token ? 'valid token' : 'null'}`);
    setRecaptchaToken(token);
    if (token) {
      setRecaptchaError(false);
    }
  };

  const handleRecaptchaLoad = () => {
    addDebugInfo('reCAPTCHA loaded successfully');
    setRecaptchaLoaded(true);
    setRecaptchaError(false);
  };

  const handleRecaptchaError = () => {
    addDebugInfo('reCAPTCHA error occurred');
    setRecaptchaError(true);
    setRecaptchaLoaded(false);
    setRecaptchaToken(null);
  };

  const handleRecaptchaExpired = () => {
    addDebugInfo('reCAPTCHA expired');
    setRecaptchaToken(null);
  };

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Allow form submission even if reCAPTCHA fails to load (for development/testing)
    if (!recaptchaLoaded && !recaptchaError) {
      setError('reCAPTCHA is still loading. Please wait a moment and try again.');
      setIsLoading(false);
      return;
    }

    // Skip reCAPTCHA validation if it failed to load (show warning but allow registration)
    if (recaptchaLoaded && !recaptchaToken) {
      setError('Please complete the reCAPTCHA verification');
      toast({
        title: "Error",
        description: "Please complete the reCAPTCHA verification",
        variant: "destructive",
      });
      setIsLoading(false);
      return;
    }

    const formData = new FormData(e.currentTarget);
    const email = formData.get('email') as string;
    const password = formData.get('password') as string;
    const fullName = formData.get('fullName') as string;
    const phoneNumber = formData.get('phoneNumber') as string;

    // Validate password strength
    if (!validatePasswordStrength()) {
      setError('Password must be at least medium strength');
      toast({
        title: "Error",
        description: "Password must be at least medium strength",
        variant: "destructive",
      });
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
      setIsLoading(false);
      return;
    }

    // Validate password match
    if (!validatePasswordMatch()) {
      setError('Passwords do not match');
      toast({
        title: "Error",
        description: "Passwords do not match",
        variant: "destructive",
      });
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
      setIsLoading(false);
      return;
    }

    const { error } = await signUp(email, password, fullName, phoneNumber);
    
    if (error) {
      setError(error.message);
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      });
      if (recaptchaRef.current) {
        recaptchaRef.current.reset();
        setRecaptchaToken(null);
      }
    } else {
      toast({
        title: "Success",
        description: "Please check your email to confirm your account!",
      });
      onSuccess?.();
    }
    
    setIsLoading(false);
  };

  return (
    <form onSubmit={handleSignUp} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="signup-fullname">Full Name</Label>
        <Input
          id="signup-fullname"
          name="fullName"
          type="text"
          placeholder="John Doe"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-email">Email</Label>
        <Input
          id="signup-email"
          name="email"
          type="email"
          placeholder="your@email.com"
          required
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-phone">Phone Number</Label>
        <Input
          id="signup-phone"
          name="phoneNumber"
          type="tel"
          placeholder="+12 (345) 678-4567"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="signup-password">Password</Label>
        <Input
          id="signup-password"
          name="password"
          type="password"
          placeholder="••••••••"
          value={signupPassword}
          onChange={(e) => setSignupPassword(e.target.value)}
          required
          minLength={6}
        />
        <PasswordStrengthIndicator password={signupPassword} />
      </div>
      <div className="space-y-2">
        <Label htmlFor="confirm-password">Confirm Password</Label>
        <Input
          id="confirm-password"
          type="password"
          placeholder="••••••••"
          value={confirmPassword}
          onChange={(e) => setConfirmPassword(e.target.value)}
          required
          minLength={6}
        />
        {confirmPassword && !validatePasswordMatch() && (
          <p className="text-sm text-red-600">Passwords do not match</p>
        )}
        {confirmPassword && validatePasswordMatch() && (
          <p className="text-sm text-green-600">Passwords match</p>
        )}
      </div>

      {/* reCAPTCHA with comprehensive error handling */}
      <div className="flex justify-center">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={handleRecaptchaChange}
          onLoad={handleRecaptchaLoad}
          onErrored={handleRecaptchaError}
          onExpired={handleRecaptchaExpired}
          theme="light"
        />
      </div>

      {/* Debug information (only shown in development) */}
      {process.env.NODE_ENV === 'development' && debugInfo.length > 0 && (
        <Alert>
          <AlertDescription>
            <details>
              <summary className="cursor-pointer">Debug Info ({debugInfo.length} entries)</summary>
              <div className="mt-2 text-xs">
                {debugInfo.slice(-5).map((info, index) => (
                  <div key={index}>{info}</div>
                ))}
              </div>
            </details>
          </AlertDescription>
        </Alert>
      )}

      {recaptchaError && (
        <Alert variant="destructive">
          <AlertDescription>
            reCAPTCHA failed to load. This might be due to network issues, browser extensions (ad blockers), 
            or connectivity problems. You can still proceed with registration for testing purposes.
            <br />
            <strong>Troubleshooting tips:</strong>
            <ul className="mt-2 text-sm list-disc list-inside">
              <li>Disable ad blockers or privacy extensions</li>
              <li>Check your internet connection</li>
              <li>Try refreshing the page</li>
              <li>Try a different browser</li>
            </ul>
          </AlertDescription>
        </Alert>
      )}

      {!recaptchaLoaded && !recaptchaError && (
        <Alert>
          <AlertDescription>
            Loading reCAPTCHA... If this takes too long, there might be a connectivity issue.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Button 
        type="submit" 
        className="w-full" 
        disabled={isLoading}
      >
        {isLoading ? (
          <div className="w-4 h-4 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin mr-2" />
        ) : (
          <UserPlus className="w-4 h-4 mr-2" />
        )}
        Create Account
      </Button>
    </form>
  );
};

export default SignUpForm;
