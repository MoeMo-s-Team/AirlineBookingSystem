import { useState } from 'react';
import { useAuth } from '../../context/AuthContext';

export function SessionTimeoutModal() {
  const { sessionExpired, user, signIn } = useAuth();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (!sessionExpired) return null;
  return <div className="fixed inset-0 z-[100] bg-black/60 flex items-center justify-center p-4">
    <form role="dialog" aria-modal="true" aria-labelledby="session-title"
      className="bg-white text-black rounded-2xl p-6 max-w-md w-full space-y-4"
      onSubmit={async e => {
        e.preventDefault(); setBusy(true); setError('');
        try { await signIn(user?.email ?? '', password); setPassword(''); }
        catch { setError('Đăng nhập thất bại. Vui lòng thử lại.'); }
        finally { setBusy(false); }
      }}>
      <h2 id="session-title" className="font-bold text-xl">Phiên đăng nhập đã hết hạn</h2>
      <p>Đăng nhập lại để tiếp tục. Dữ liệu bạn đang nhập vẫn được giữ trên trang.</p>
      <p>{user?.email}</p>
      <label className="block">Mật khẩu<input autoFocus required type="password" autoComplete="current-password"
        className="block border p-2 w-full" value={password} onChange={e => setPassword(e.target.value)} /></label>
      {error && <p role="alert">{error}</p>}
      <button disabled={busy} className="bg-primary text-on-primary rounded px-4 py-2">{busy ? 'Đang đăng nhập…' : 'Đăng nhập lại'}</button>
    </form>
  </div>;
}
