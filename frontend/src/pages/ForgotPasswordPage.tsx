import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { localize, useLanguage } from '../i18n';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';

export function ForgotPasswordPage() {
  useLanguage();
  const [email, setEmail] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const submit = async (event: FormEvent) => {
    event.preventDefault();
    if (sending) return;
    setSending(true); setError(''); setSent(false);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email.trim(), {
        redirectTo: `${window.location.origin}/reset-password`,
      });
      if (error) throw error;
      setSent(true);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to send the recovery email. Please try again.');
    } finally { setSending(false); }
  };
  return <div className="min-h-screen flex flex-col bg-background"><TopNavBar />
    <main className="flex-1 w-full max-w-md mx-auto px-6 pt-24 pb-12">
      <div className="rounded-2xl border border-outline-variant bg-surface-container-lowest p-6 shadow-sm">
        <h1 className="text-headline-md font-bold text-primary">{localize('Forgot password?')}</h1>
        <p className="mt-2 text-body-sm text-on-surface-variant">{localize('Enter your account email to receive a password reset link.')}</p>
        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block">{localize('Email')}<input required type="email" autoComplete="email" maxLength={255}
            value={email} onChange={e => setEmail(e.target.value)} disabled={sending}
            className="mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low p-3" /></label>
          {error && <p role="alert" className="text-error">{localize(error)}</p>}
          {sent && <p role="status" className="text-secondary">{localize('If an account exists for this email, a recovery link will arrive shortly. Check your inbox and spam folder.')}</p>}
          <button disabled={sending} className="w-full rounded-xl bg-primary px-5 py-3 font-semibold text-on-primary disabled:opacity-50">{localize(sending ? 'Sending...' : 'Send reset link')}</button>
        </form>
        <Link to="/sign-in" className="mt-5 inline-block text-secondary underline">{localize('Back to sign in')}</Link>
      </div>
    </main><Footer /></div>;
}
