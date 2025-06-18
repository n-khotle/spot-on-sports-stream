
import React from 'react';

interface PasswordStrengthIndicatorProps {
  password: string;
}

const PasswordStrengthIndicator: React.FC<PasswordStrengthIndicatorProps> = ({ password }) => {
  const getPasswordStrength = (password: string) => {
    let score = 0;
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      number: /\d/.test(password),
      special: /[!@#$%^&*(),.?":{}|<>]/.test(password),
    };

    score = Object.values(checks).filter(Boolean).length;
    
    return { score, checks };
  };

  const { score, checks } = getPasswordStrength(password);

  const getStrengthColor = () => {
    if (score < 2) return 'bg-red-500';
    if (score < 4) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const getStrengthText = () => {
    if (score < 2) return 'Weak';
    if (score < 4) return 'Medium';
    return 'Strong';
  };

  if (!password) return null;

  return (
    <div className="mt-2 space-y-2">
      <div className="flex items-center space-x-2">
        <div className="flex-1 bg-gray-200 rounded-full h-2">
          <div
            className={`h-2 rounded-full transition-all duration-300 ${getStrengthColor()}`}
            style={{ width: `${(score / 5) * 100}%` }}
          />
        </div>
        <span className={`text-sm font-medium ${
          score < 2 ? 'text-red-600' : score < 4 ? 'text-yellow-600' : 'text-green-600'
        }`}>
          {getStrengthText()}
        </span>
      </div>
      <ul className="text-xs space-y-1">
        <li className={checks.length ? 'text-green-600' : 'text-gray-400'}>
          ✓ At least 8 characters
        </li>
        <li className={checks.lowercase ? 'text-green-600' : 'text-gray-400'}>
          ✓ Lowercase letter
        </li>
        <li className={checks.uppercase ? 'text-green-600' : 'text-gray-400'}>
          ✓ Uppercase letter
        </li>
        <li className={checks.number ? 'text-green-600' : 'text-gray-400'}>
          ✓ Number
        </li>
        <li className={checks.special ? 'text-green-600' : 'text-gray-400'}>
          ✓ Special character
        </li>
      </ul>
    </div>
  );
};

export default PasswordStrengthIndicator;
