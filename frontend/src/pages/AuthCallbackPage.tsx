import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

export const AuthCallbackPage: React.FC = () => {
  const navigate = useNavigate();
  const { user, isAuthenticated, isLoading, profileError, refreshProfile } = useAuth();

  useEffect(() => {
    if (isLoading) return;

    if (profileError) return;

    if (isAuthenticated && !user) return;

    if (isAuthenticated && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin/flights', { replace: true });
      } else {
        navigate('/my-bookings', { replace: true });
      }
    } else {
      navigate('/sign-in', { replace: true });
    }
  }, [isLoading, isAuthenticated, user, profileError, navigate]);

  if (isLoading || (isAuthenticated && !user && !profileError)) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <span className="material-symbols-outlined text-[36px] text-primary animate-spin">
            progress_activity
          </span>
          <span className="text-label-md font-semibold text-primary">
            Đang xác thực tài khoản và tải hồ sơ...
          </span>
        </div>
      </div>
    );
  }

  if (profileError) {
    return (
      <div className="min-h-screen bg-surface-container-low flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-surface-container-lowest border border-error/30 rounded-3xl p-8 text-center shadow-xl">
          <div className="w-16 h-16 rounded-full bg-error-container text-on-error-container flex items-center justify-center mx-auto mb-4">
            <span className="material-symbols-outlined text-[32px]">error</span>
          </div>
          <h1 className="text-headline-md font-bold text-error tracking-tight">
            Xác thực thất bại
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-2 mb-6">
            {profileError.message || 'Không thể tải thông tin hồ sơ của bạn.'}
          </p>
          {profileError.status >= 500 ? (
            <button
              type="button"
              onClick={() => void refreshProfile()}
              className="w-full py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-bold hover:bg-primary-container transition-colors"
            >
              Thử lại
            </button>
          ) : (
            <a
              href="/sign-in"
              className="inline-block w-full py-2.5 rounded-xl bg-primary text-on-primary text-label-md font-bold hover:bg-primary-container transition-colors"
            >
              Quay lại Đăng nhập
            </a>
          )}
        </div>
      </div>
    );
  }

  return null;
};
