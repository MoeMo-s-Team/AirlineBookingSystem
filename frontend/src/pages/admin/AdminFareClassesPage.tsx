import React from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { useAdminPortal } from '../../hooks/useAdminPortal';
import { FareClass } from '../../types';

export interface AdminFareClassesPageProps {
  readonly onUpdateFareClass?: (fareClass: FareClass) => void;
}

export const AdminFareClassesPage: React.FC<AdminFareClassesPageProps> = () => {
  const { fareClasses, updateFareClassPrice } = useAdminPortal();

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="Fare Classes & Cabin Yield Configuration"
          subtitle="Configure tier multipliers, baggage allowances, and refund policies"
        />

        <main className="flex-1 p-8 space-y-8">
          {/* Header Explanation */}
          <div className="bg-surface-container-low border border-outline-variant rounded-2xl p-6">
            <h2 className="text-headline-sm font-bold text-primary mb-1">
              Active Cabin Fare Architecture
            </h2>
            <p className="text-body-sm text-on-surface-variant max-w-2xl">
              Changes made here dynamically calibrate the pricing and rules displayed to passengers on the search results screen.
            </p>
          </div>

          {/* Fare Classes Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {fareClasses.map(fc => (
              <div
                key={fc.id}
                className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-6 shadow-sm hover:shadow transition-shadow"
              >
                <div className="flex items-start justify-between pb-4 border-b border-outline-variant">
                  <div>
                    <span className="text-[11px] font-bold text-secondary uppercase tracking-widest block">
                      {fc.tier} Cabin
                    </span>
                    <h3 className="text-headline-sm font-bold text-primary mt-0.5">
                      {fc.name}
                    </h3>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-label-sm text-outline font-semibold">Base Price:</span>
                    <div className="flex items-center">
                      <span className="text-headline-sm font-bold text-primary mr-1">$</span>
                      <input
                        type="number"
                        value={fc.price}
                        onChange={e => updateFareClassPrice(fc.id, Number(e.target.value))}
                        className="w-20 px-2 py-1 rounded bg-surface-container-low border border-outline-variant text-headline-sm font-bold text-primary text-center"
                      />
                    </div>
                  </div>
                </div>

                {/* Specs List */}
                <div className="py-4 space-y-3 text-body-sm text-on-surface">
                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">luggage</span>
                      Baggage Allowance:
                    </span>
                    <span className="font-semibold text-primary">{fc.baggage}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">airline_seat_recline_normal</span>
                      Seat Ergonomics:
                    </span>
                    <span className="font-semibold text-primary">{fc.seatPitch}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">restaurant</span>
                      Catering:
                    </span>
                    <span className="font-semibold text-primary">{fc.meal}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">stars</span>
                      Miles Multiplier:
                    </span>
                    <span className="font-bold text-secondary">{fc.milesMultiplier}x Miles</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-on-surface-variant flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[18px] text-secondary">sync</span>
                      Rebooking & Cancellation:
                    </span>
                    <span className="font-semibold text-primary">{fc.changes} • {fc.cancellation}</span>
                  </div>
                </div>

                {/* Badges / Perks Flags */}
                <div className="pt-4 border-t border-outline-variant flex items-center gap-3">
                  <span className={`px-2.5 py-1 rounded text-label-sm font-semibold flex items-center gap-1 ${
                    fc.priorityBoarding ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-surface-container text-outline'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {fc.priorityBoarding ? 'check' : 'close'}
                    </span>
                    Priority Lane
                  </span>

                  <span className={`px-2.5 py-1 rounded text-label-sm font-semibold flex items-center gap-1 ${
                    fc.loungeAccess ? 'bg-secondary-fixed text-on-secondary-fixed-variant' : 'bg-surface-container text-outline'
                  }`}>
                    <span className="material-symbols-outlined text-[14px]">
                      {fc.loungeAccess ? 'check' : 'close'}
                    </span>
                    Lounge Pass
                  </span>
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
};
