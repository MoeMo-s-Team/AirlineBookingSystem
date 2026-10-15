import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { safeReturnTo } from '../utils/safeReturnTo';

export interface SignInPageProps {
  readonly onSignInSuccess?: () => void;
}

export const SignInPage: React.FC<SignInPageProps> = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, isAuthenticated, signIn, signOut, profileError, refreshProfile } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [awaitingProfile, setAwaitingProfile] = useState(false);

  useEffect(() => {
    if (!awaitingProfile || !user) return;
    if (user.role === 'ADMIN') {
      navigate('/admin/flights', { replace: true });
    } else {
      const returnTo = searchParams.get('returnTo');
      navigate(safeReturnTo(returnTo, '/my-bookings'), { replace: true });
    }
  }, [awaitingProfile, user, navigate, searchParams]);

  useEffect(() => {
    if (profileError) setErrorMessage(profileError.message);
  }, [profileError]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !password.trim()) {
      setErrorMessage('Please enter both your email/ID and password.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await signIn(email, password);
      setAwaitingProfile(true);
    } catch (err: any) {
      setErrorMessage(err?.message || 'Authentication failed. Please verify your credentials.');
    } finally {
      setIsSubmitting(false);
    }
  };



  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-24 pb-16 flex items-center justify-center px-6">
        <div className="max-w-md w-full bg-surface-container-lowest border border-outline-variant rounded-3xl p-8 shadow-xl">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-on-primary mx-auto mb-3 shadow-sm">
              <span className="material-symbols-outlined text-[24px]">flight_takeoff</span>
            </div>
            <h1 className="text-headline-md font-bold text-primary tracking-tight">
              Sign In to SkyWing
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Access your saved flights, miles balance, and rapid 1-click booking.
            </p>
          </div>

          {/* Already logged in notice */}
          {isAuthenticated && user ? (
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-bold text-lg flex items-center justify-center mx-auto">
                {(user.fullName || user.email).charAt(0).toUpperCase()}
              </div>
              <div>
                <span className="text-label-md font-bold text-primary block">
                  Signed in as {user.fullName}
                </span>
                <span className="text-[12px] text-on-surface-variant block">
                  {user.email}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                {user.role === 'ADMIN' ? (
                  <button
                    type="button"
                    onClick={() => navigate('/admin/flights')}
                    className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold transition-colors"
                  >
                    Go to Ops Console (/admin/flights)
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => navigate('/my-bookings')}
                    className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:bg-primary-container transition-colors"
                  >
                    Go to My Bookings
                  </button>
                )}
                <button
                  type="button"
                  onClick={signOut}
                  className="px-4 py-2 rounded-lg border border-error/40 text-error text-label-md font-semibold hover:bg-error-container/20 transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Error Message */}
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMessage}</span>
                  {profileError?.status && profileError.status >= 500 && (
                    <button type="button" onClick={() => void refreshProfile()} className="ml-auto underline">
                      Retry
                    </button>
                  )}
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label htmlFor="email" className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    type="email"
                    placeholder="e.g. name@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <div className="flex justify-between items-center mb-1">
                    <label htmlFor="password" className="text-label-sm font-semibold text-outline uppercase tracking-wider">
                      Password *
                    </label>
                    <a href="#forgot" onClick={(e) => { e.preventDefault(); alert('Password reset link simulated.'); }} className="text-label-sm text-secondary hover:underline">
                      Forgot password?
                    </a>
                  </div>
                  <input
                    id="password"
                    type="password"
                    placeholder="Enter your password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="flex items-center gap-2 pt-1">
                  <input type="checkbox" id="remember" defaultChecked className="rounded accent-primary" />
                  <label htmlFor="remember" className="text-body-sm text-on-surface-variant cursor-pointer">
                    Remember me on this trusted terminal
                  </label>
                </div>

                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full py-3 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md hover:shadow-lg transition-all mt-4 flex items-center justify-center gap-2"
                >
                  {isSubmitting ? (
                    <>
                      <span className="material-symbols-outlined text-[18px] animate-spin">progress_activity</span>
                      <span>Verifying Credentials...</span>
                    </>
                  ) : (
                    <span>Sign In to Account</span>
                  )}
                </button>
              </form>

              {/* Footer link */}
              <p className="text-center text-body-sm text-on-surface-variant mt-6">
                Not a member yet?{' '}
                <Link
                  to={searchParams.get('returnTo') ? `/sign-up?returnTo=${encodeURIComponent(searchParams.get('returnTo')!)}` : '/sign-up'}
                  className="font-bold text-primary hover:text-secondary"
                >
                  Join SkyWing Club
                </Link>
              </p>
            </>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
};
