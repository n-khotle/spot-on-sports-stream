
import { useState, useRef } from 'react';
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
  const [captchaValue, setCaptchaValue] = useState<string | null>(null);
  const recaptchaRef = useRef<ReCAPTCHA>(null);

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

  const handleSignUp = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Validate reCAPTCHA
    if (!captchaValue) {
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
      // Reset reCAPTCHA on error
      recaptchaRef.current?.reset();
      setCaptchaValue(null);
    } else {
      toast({
        title: "Success",
        description: "Please check your email to confirm your account!",
      });
      onSuccess?.();
    }
    
    setIsLoading(false);
  };

  const onCaptchaChange = (value: string | null) => {
    setCaptchaValue(value);
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

      <div className="space-y-2">
        <ReCAPTCHA
          ref={recaptchaRef}
          sitekey={RECAPTCHA_SITE_KEY}
          onChange={onCaptchaChange}
          theme="light"
        />
      </div>

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
