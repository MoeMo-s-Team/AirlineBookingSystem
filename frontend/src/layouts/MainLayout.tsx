import type { ReactNode } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from '@/components/features/Header/Header';
import { useAuth } from '@/context/AuthContext';

export interface MainLayoutProps {
  children?: ReactNode;
  showFooter?: boolean;
}

export function MainLayout({ children, showFooter = true }: MainLayoutProps) {
  const { user } = useAuth();

  return (
    <div className="min-h-screen bg-surface flex flex-col">
      <Header 
        user={user ? { name: user.name, tier: user.tier } : undefined}
      />
      
      <main className="flex-1 pt-16">
        {children || <Outlet />}
      </main>

      {showFooter && (
        <footer className="bg-surface-container-low py-8 mt-12">
          <div className="max-w-7xl mx-auto px-6 lg:px-12">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-2">
                <img
                  alt="SkyWing Logo"
                  className="h-6 w-auto"
                  src="https://lh3.googleusercontent.com/aida/AEtjO1WKXmyLxsjYeUagEpINwoQY5yURNIbgoeTktKUVR0C6q5Om0a0Wz77anAgM8RFUdnLmZI-oU2n0nPaj1YOT-9uh4TEApLyrhX9Oon8nB8c60CwONqGLaFQkezF8stU4h-mKlTo8jXBW--1cYxKiQOlUzNWSG8pf7phg0ZDOks-t2EaXpqcPKTGa3LOp-n-Jm7voubEn0Q2k3ghQDOUQ9chb5AtwEenP5j1IoUpFnWvf4-Uk8zFgFoIdEA"
                />
                <span className="font-label-md text-on-surface-variant">
                  © 2026 SkyWing Airlines. All rights reserved.
                </span>
              </div>
              <div className="flex gap-6 text-body-sm text-on-surface-variant">
                <a href="#" className="hover:text-primary">Privacy Policy</a>
                <a href="#" className="hover:text-primary">Terms of Service</a>
                <a href="#" className="hover:text-primary">Contact Us</a>
              </div>
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
