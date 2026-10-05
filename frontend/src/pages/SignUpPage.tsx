import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';

export interface SignUpPageProps {
  readonly onSignUpSuccess?: () => void;
}

export const SignUpPage: React.FC<SignUpPageProps> = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, signUp, signOut } = useAuth();

  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setErrorMessage('Please fill in all mandatory fields.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match. Please re-enter.');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage('');
    try {
      await signUp(fullName, email, password);
      navigate('/my-bookings');
    } catch {
      setErrorMessage('Registration failed. Please try again.');
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
              <span className="material-symbols-outlined text-[24px]">stars</span>
            </div>
            <h1 className="text-headline-md font-bold text-primary tracking-tight">
              Join SkyWing Club
            </h1>
            <p className="text-body-sm text-on-surface-variant mt-1">
              Earn miles on every journey and enjoy priority boarding, lounge access, and exclusive fares.
            </p>
          </div>

          {/* Already logged in notice */}
          {isAuthenticated && user ? (
            <div className="p-5 rounded-2xl bg-surface-container-low border border-outline-variant text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-primary text-on-primary font-bold text-lg flex items-center justify-center mx-auto">
                {user.name.charAt(0)}
              </div>
              <div>
                <span className="text-label-md font-bold text-primary block">
                  You are already enrolled as {user.name}
                </span>
                <span className="text-[12px] text-on-surface-variant block">
                  Member ID: {user.frequentFlyerNumber || 'SW-GOLD-88910'}
                </span>
              </div>
              <div className="flex items-center justify-center gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => navigate('/my-bookings')}
                  className="px-4 py-2 rounded-lg bg-primary text-on-primary text-label-md font-bold hover:bg-primary-container transition-colors"
                >
                  View My Account
                </button>
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
              {errorMessage && (
                <div className="mb-4 p-3 rounded-lg bg-error-container text-on-error-container text-body-sm flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form */}
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                    Full Name (As on Passport) *
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. Tran Thi Mai"
                    value={fullName}
                    onChange={e => setFullName(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                    Email Address *
                  </label>
                  <input
                    type="email"
                    placeholder="traveler@email.com"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                    Create Secure Password *
                  </label>
                  <input
                    type="password"
                    placeholder="At least 8 characters"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div>
                  <label className="block text-label-sm font-semibold text-outline uppercase tracking-wider mb-1">
                    Confirm Password *
                  </label>
                  <input
                    type="password"
                    placeholder="Re-enter your password"
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    required
                    className="w-full px-3.5 py-2.5 rounded-xl bg-surface-container-low border border-outline-variant text-body-md text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary"
                  />
                </div>

                <div className="space-y-2 pt-2 text-body-sm text-on-surface-variant">
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" defaultChecked className="mt-1 rounded accent-primary" />
                    <span>Enroll me in the SkyWing Frequent Flyer loyalty program automatically</span>
                  </label>
                  <label className="flex items-start gap-2 cursor-pointer">
                    <input type="checkbox" required defaultChecked className="mt-1 rounded accent-primary" />
                    <span>I agree to the SkyWing Terms of Carriage and Privacy Standards</span>
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
                      <span>Creating Account...</span>
                    </>
                  ) : (
                    <span>Create Account & Join Club</span>
                  )}
                </button>
              </form>

              {/* Footer link */}
              <p className="text-center text-body-sm text-on-surface-variant mt-6">
                Already have an account?{' '}
                <Link to="/sign-in" className="font-bold text-primary hover:text-secondary">
                  Sign In
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
