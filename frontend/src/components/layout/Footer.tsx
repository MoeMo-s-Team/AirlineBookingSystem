import React from 'react';
import { Link } from 'react-router-dom';

export interface FooterProps {
  readonly brandName?: string;
}

export const Footer: React.FC<FooterProps> = ({ brandName = 'SkyWing Airlines' }) => {
  return (
    <footer className="w-full bg-surface-container-low border-t border-outline-variant mt-20 pt-16 pb-12 text-on-surface">
      <div className="max-w-7xl mx-auto px-6 lg:px-12 grid grid-cols-1 md:grid-cols-4 gap-space-lg">
        {/* Brand Column */}
        <div className="flex flex-col gap-space-sm md:col-span-1">
          <div className="flex items-center gap-space-sm">
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center text-on-primary">
              <span className="material-symbols-outlined text-[18px]">flight_takeoff</span>
            </div>
            <span className="font-headline-sm text-headline-sm text-primary tracking-tight font-bold">
              {brandName}
            </span>
          </div>
          <p className="text-body-sm text-on-surface-variant max-w-xs mt-2">
            Precision aerospace commercial carrier operating modern Airbus A350 and Boeing 787 fleets with 99.4% on-time departure index.
          </p>
          <div className="flex items-center gap-space-sm mt-4 text-primary">
            <span className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">public</span>
            </span>
            <span className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">send</span>
            </span>
            <span className="p-2 rounded-full bg-surface-container hover:bg-surface-container-high transition-colors cursor-pointer">
              <span className="material-symbols-outlined text-[18px]">share</span>
            </span>
          </div>
        </div>

        {/* Column 2: Booking & Services */}
        <div className="flex flex-col gap-2">
          <h4 className="font-label-lg text-label-lg text-primary uppercase tracking-wider mb-2">
            Book & Fly
          </h4>
          <Link to="/" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Search Flights
          </Link>
          <Link to="/flights" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Flight Schedules
          </Link>
          <Link to="/my-bookings" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Online Check-in
          </Link>
          <Link to="/my-bookings" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Baggage Allowance
          </Link>
        </div>

        {/* Column 3: SkyWing Club */}
        <div className="flex flex-col gap-2">
          <h4 className="font-label-lg text-label-lg text-primary uppercase tracking-wider mb-2">
            SkyWing Club
          </h4>
          <Link to="/sign-in" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Member Sign In
          </Link>
          <Link to="/sign-up" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Join SkyWing Club
          </Link>
          <Link to="/my-bookings" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Manage Trips & Miles
          </Link>
          <Link to="/services" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            VIP Lounge Passes
          </Link>
        </div>

        {/* Column 4: Travel Info & Assistance */}
        <div className="flex flex-col gap-2">
          <h4 className="font-label-lg text-label-lg text-primary uppercase tracking-wider mb-2">
            Support & Assistance
          </h4>
          <Link to="/flights" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Flight Schedules & Status
          </Link>
          <Link to="/services" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Baggage & Special Care
          </Link>
          <Link to="/my-bookings" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Customer Helpdesk
          </Link>
          <Link to="/services" className="text-body-sm text-on-surface-variant hover:text-primary transition-colors">
            Travel Insurance Policies
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 lg:px-12 mt-12 pt-6 border-t border-outline-variant flex flex-col sm:flex-row items-center justify-between text-body-sm text-on-surface-variant gap-4">
        <span>© 2026 {brandName}. All rights reserved. Precision Airway Standards.</span>
        <div className="flex items-center gap-space-lg">
          <Link to="/" className="hover:text-primary transition-colors">Privacy Policy</Link>
          <Link to="/" className="hover:text-primary transition-colors">Terms of Carriage</Link>
          <Link to="/" className="hover:text-primary transition-colors">Cookie Preferences</Link>
        </div>
      </div>
    </footer>
  );
};
