import { useEffect, useState, type FormEvent } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { localize, useLanguage } from '../i18n';
import { useAuth } from '../context/AuthContext';
import { profileApi, type ProfileUpdate } from '../api/profileApi';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { localToday } from '../utils/flightSearch';

export function ProfilePage() {
  useLanguage();
  const { isAuthenticated, isLoading, user, refreshProfile, sessionExpired } = useAuth();
  const [form, setForm] = useState({ fullName: '', phone: '', dateOfBirth: '', passportNo: '' });
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState('');
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [retry, setRetry] = useState(0);
  useEffect(() => {
    if (!isAuthenticated) return;
    let cancelled = false;
    setLoading(true); setLoadError('');
    profileApi.get().then(profile => {
      if (!cancelled) setForm({ fullName: profile.fullName, phone: profile.phone ?? '',
        dateOfBirth: profile.dateOfBirth ?? '', passportNo: profile.passportNo ?? '' });
    }).catch(() => { if (!cancelled) setLoadError('Unable to load your profile.'); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [isAuthenticated, user?.id, retry]);

  const submit = async (event: FormEvent) => {
    event.preventDefault(); setError(''); setSaved(false);
    const fullName = form.fullName.trim();
    const phone = form.phone.trim();
    const passportNo = form.passportNo.trim();
    if (fullName.length < 2) { setError('Full name must contain 2 to 255 characters.'); return; }
    if (phone && (!/^[0-9+()\s-]{7,20}$/.test(phone) || phone.replace(/\D/g, '').length < 7)) { setError('Invalid phone number format.'); return; }
    if (passportNo && !/^[A-Za-z0-9]{5,50}$/.test(passportNo)) {
      setError('Passport or national ID must contain 5 to 50 letters or digits.'); return;
    }
    if (form.dateOfBirth && form.dateOfBirth > localToday()) { setError('Date of birth cannot be in the future.'); return; }
    const payload: ProfileUpdate = { fullName, phone: phone || null, dateOfBirth: form.dateOfBirth || null, passportNo: passportNo || null };
    setSaving(true);
    try {
      const profile = await profileApi.update(payload);
      setForm({ fullName: profile.fullName, phone: profile.phone ?? '', dateOfBirth: profile.dateOfBirth ?? '', passportNo: profile.passportNo ?? '' });
      setSaved(true);
      await refreshProfile();
    } catch (cause) { setError(cause instanceof Error ? cause.message : 'Unable to save your profile.'); }
    finally { setSaving(false); }
  };

  if (isLoading) return <p role="status" className="p-8">{localize('Loading profile...')}</p>;
  if (!isAuthenticated && !sessionExpired) return <Navigate to="/sign-in?returnTo=%2Fprofile" replace />;
  const inputClass = 'mt-1 w-full rounded-lg border border-outline-variant bg-surface-container-low p-3 text-on-surface';
  return <div className="min-h-screen bg-background flex flex-col"><TopNavBar />
    <main className="flex-1 mx-auto w-full max-w-2xl px-6 pt-24 pb-12">
      <h1 className="text-headline-lg font-bold text-primary">{localize('My profile')}</h1>
      <p className="mt-2 text-on-surface-variant">{localize('Save your details to fill passenger information faster.')}</p>
      {loading ? <p role="status" className="mt-6">{localize('Loading profile...')}</p> : loadError ?
        <div role="alert" className="mt-6"><p>{localize(loadError)}</p><button onClick={() => setRetry(value => value + 1)}>{localize('Try again')}</button></div> :
        <form onSubmit={submit} className="mt-6 space-y-5 rounded-2xl border border-outline-variant bg-surface-container-lowest p-6">
          <label className="block">{localize('Email')}<input type="email" value={user?.email ?? ''} readOnly className={`${inputClass} opacity-70`} /></label>
          <fieldset disabled={saving} className="space-y-5">
            <label className="block">{localize('Full name')}<input required minLength={2} maxLength={255} autoComplete="name" value={form.fullName} onChange={e => { setSaved(false); setForm({ ...form, fullName: e.target.value }); }} className={inputClass} /></label>
            <label className="block">{localize('Phone number')}<input type="tel" autoComplete="tel" maxLength={20} value={form.phone} onChange={e => { setSaved(false); setForm({ ...form, phone: e.target.value }); }} className={inputClass} /></label>
            <label className="block">{localize('Date of birth')}<input type="date" autoComplete="bday" max={localToday()} value={form.dateOfBirth} onChange={e => { setSaved(false); setForm({ ...form, dateOfBirth: e.target.value }); }} className={inputClass} /></label>
            <label className="block">{localize('Passport / National ID')}<input maxLength={50} value={form.passportNo} onChange={e => { setSaved(false); setForm({ ...form, passportNo: e.target.value }); }} className={inputClass} /></label>
            <p className="text-body-sm text-on-surface-variant">{localize('Phone, date of birth and travel ID are optional. Complete them before using autofill.')}</p>
            {error && <p role="alert" className="text-error">{localize(error)}</p>}
            {saved && <p role="status" className="text-secondary">{localize('Profile saved.')}</p>}
            <button className="rounded-xl bg-primary px-6 py-3 font-semibold text-on-primary disabled:opacity-50" type="submit">{localize(saving ? 'Saving...' : 'Save profile')}</button>
          </fieldset>
        </form>}
      <Link to={user?.role === 'ADMIN' ? '/admin/flights' : '/'} className="mt-6 inline-block text-secondary underline">{localize('Back to home')}</Link>
    </main><Footer /></div>;
}
