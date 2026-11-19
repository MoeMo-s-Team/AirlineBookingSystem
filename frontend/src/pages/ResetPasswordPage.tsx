import { useState, type FormEvent } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { localize, useLanguage } from '../i18n';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';

export function ResetPasswordPage() {
  useLanguage();
  const { isAuthenticated, isPasswordRecovery, completePasswordRecovery, isLoading, user } = useAuth();
  const location = useLocation();
  const linkParams = new URLSearchParams(`${location.search.slice(1)}&${location.hash.slice(1)}`);
  const hasLinkError = ['error', 'error_code', 'error_description'].some(key => linkParams.has(key));
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');
  const validRecovery = isAuthenticated && isPasswordRecovery && !hasLinkError;
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (!validRecovery || saving) return;
    setError('');
    if (password.length < 6) { setError('Password must contain at least 6 characters.'); return; }
    if (password !== confirmation) { setError('Passwords do not match.'); return; }
    setSaving(true);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      setSaved(true); setPassword(''); setConfirmation('');
      completePasswordRecovery();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to update your password. Please request a new link.');
    } finally { setSaving(false); }
  };
  return <div className="min-h-screen flex flex-col bg-background"><TopNavBar />
    <main className="flex-1 w-full max-w-md mx-auto px-6 pt-24 pb-12">
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h1 className="text-headline-md font-bold text-primary">{localize('Set a new password')}</h1>
        {saved ? <div className="mt-5 space-y-4"><p role="status">{localize('Your password has been updated.')}</p>
          <Link className="text-secondary underline" to={user?.role === 'ADMIN' ? '/admin/flights' : '/my-bookings'}>{localize('Continue')}</Link></div>
          : validRecovery ? <form onSubmit={submit} className="mt-6 space-y-4">
            <fieldset disabled={saving} className="space-y-4">
              <label className="block">{localize('New password')}<input required type="password" autoComplete="new-password" minLength={6}
                value={password} onChange={e => setPassword(e.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low p-3" /></label>
              <label className="block">{localize('Confirm new password')}<input required type="password" autoComplete="new-password" minLength={6}
                value={confirmation} onChange={e => setConfirmation(e.target.value)} className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low p-3" /></label>
              {error && <p role="alert" className="text-error">{localize(error)}</p>}
              <button className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-50">{localize(saving ? 'Saving...' : 'Update password')}</button>
            </fieldset>
            <Link to="/forgot-password" onClick={completePasswordRecovery} className="inline-block text-secondary underline">{localize('Request a new link')}</Link>
          </form> : isLoading && !hasLinkError ? <p role="status" className="mt-5">{localize('Verifying recovery link...')}</p>
            : <div className="mt-5 space-y-4"><p role="alert" className="text-error">{localize('This recovery link is invalid or expired. Please request a new link.')}</p>
              <Link className="text-secondary underline" to="/forgot-password" onClick={completePasswordRecovery}>{localize('Request a new link')}</Link></div>}
      </div>
    </main><Footer /></div>;
}
