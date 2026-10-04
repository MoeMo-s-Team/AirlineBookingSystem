import type { ReactNode } from 'react';
import { Link, Outlet } from 'react-router-dom';

export interface AuthLayoutProps {
  children?: ReactNode;
}

export function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center gap-2">
            <img
              alt="SkyWing Airlines Logo"
              className="h-10 w-auto"
              src="https://lh3.googleusercontent.com/aida/AEtjO1WKXmyLxsjYeUagEpINwoQY5yURNIbgoeTktKUVR0C6q5Om0a0Wz77anAgM8RFUdnLmZI-oU2n0nPaj1YOT-9uh4TEApLyrhX9Oon8nB8c60CwONqGLaFQkezF8stU4h-mKlTo8jXBW--1cYxKiQOlUzNWSG8pf7phg0ZDOks-t2EaXpqcPKTGa3LOp-n-Jm7voubEn0Q2k3ghQDOUQ9chb5AtwEenP5j1IoUpFnWvf4-Uk8zFgFoIdEA"
            />
          </Link>
        </div>

        {/* Content */}
        {children || <Outlet />}

        {/* Footer Links */}
        <div className="mt-6 text-center text-body-sm text-on-surface-variant">
          <Link to="/" className="hover:text-primary transition-colors">
            Back to Home
          </Link>
          <span className="mx-2">·</span>
          <span>© 2026 SkyWing Airlines</span>
        </div>
      </div>
    </div>
  );
}
