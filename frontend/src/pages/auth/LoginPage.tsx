import { useState, type FormEvent } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AuthLayout } from '@/layouts/AuthLayout';
import { Input } from '@/components/ui/Input/Input';
import { Button } from '@/components/ui/Button/Button';
import { Checkbox } from '@/components/ui/Checkbox/Checkbox';
import { Card } from '@/components/ui/Card/Card';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    const result = await login(email, password);

    if (result.success) {
      navigate('/');
    } else {
      setError(result.error || 'Login failed');
    }

    setIsLoading(false);
  };

  return (
    <AuthLayout>
      <Card variant="elevated" padding="lg">
        <h1 className="text-headline-lg text-primary text-center mb-2">
          Welcome Back
        </h1>
        <p className="font-body-md text-on-surface-variant text-center mb-6">
          Sign in to continue to SkyWing Airlines
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="bg-error-container text-on-error-container px-4 py-3 rounded-lg font-body-sm" role="alert">
              {error}
            </div>
          )}

          <Input
            label="Email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@example.com"
            required
          />

          <Input
            label="Password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />

          <div className="flex items-center justify-between">
            <Checkbox
              label="Remember me"
              checked={rememberMe}
              onChange={setRememberMe}
            />
            <Link
              to="/forgot-password"
              className="font-body-sm text-secondary hover:text-primary transition-colors"
            >
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            variant="primary"
            className="w-full"
            loading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <p className="mt-6 text-center font-body-md text-on-surface-variant">
          Don't have an account?{' '}
          <Link to="/register" className="text-secondary hover:text-primary font-semibold">
            Sign up
          </Link>
        </p>
      </Card>
    </AuthLayout>
  );
}
