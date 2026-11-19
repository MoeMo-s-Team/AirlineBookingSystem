import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../../lib/supabase';
import { safeReturnTo } from '../../utils/safeReturnTo';
import { localize } from '../../i18n';

export function GoogleSignInButton() {
  const [params] = useSearchParams();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const signIn = async () => {
    if (busy) return;
    setBusy(true); setError('');
    try {
      const callback = new URL('/auth/callback', window.location.origin);
      const returnTo = safeReturnTo(params.get('returnTo'), '');
      if (returnTo) callback.searchParams.set('returnTo', returnTo);
      const { error } = await supabase.auth.signInWithOAuth({ provider: 'google', options: { redirectTo: callback.toString() } });
      if (error) throw error;
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Unable to sign in with Google. Please try again.');
    } finally { setBusy(false); }
  };
  return <div className="mt-5 space-y-2">
    <button type="button" disabled={busy} onClick={() => void signIn()}
      className="w-full rounded-xl border border-outline-variant bg-surface-container-lowest px-4 py-3 font-semibold text-primary disabled:opacity-50">
      {localize(busy ? 'Opening Google...' : 'Continue with Google')}
    </button>
    {error && <p role="alert" className="text-body-sm text-error">{localize(error)}</p>}
  </div>;
}
