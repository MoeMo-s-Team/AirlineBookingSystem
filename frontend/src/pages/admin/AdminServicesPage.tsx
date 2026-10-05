import React from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { useAdminPortal } from '../../hooks/useAdminPortal';
import { AncillaryService } from '../../types';

export interface AdminServicesPageProps {
  readonly onServiceClick?: (service: AncillaryService) => void;
}

export const AdminServicesPage: React.FC<AdminServicesPageProps> = () => {
  const { services, toggleServiceActive } = useAdminPortal();

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="Ancillary Services & Baggage Catalog"
          subtitle="Manage add-ons, pricing rules, inventory limits, and availability flags"
        />

        <main className="flex-1 p-8 space-y-8">
          {/* Header Action Row */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-headline-sm font-bold text-primary">
                Active Catalog ({services.length} Ancillaries)
              </h2>
              <p className="text-body-sm text-on-surface-variant">
                Live ancillary upgrades offered to passengers during booking flow.
              </p>
            </div>

            <button
              type="button"
              onClick={() => alert('New ancillary product creation modal')}
              className="px-4 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-md font-bold shadow-sm transition-all flex items-center gap-1.5 self-start sm:self-center"
            >
              <span className="material-symbols-outlined text-[18px]">add</span>
              <span>Create New Service</span>
            </button>
          </div>

          {/* Table */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-outline uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Service Item</th>
                    <th className="py-3.5 px-6">Category</th>
                    <th className="py-3.5 px-6">Description</th>
                    <th className="py-3.5 px-6">Price</th>
                    <th className="py-3.5 px-6">Booking Limit</th>
                    <th className="py-3.5 px-6 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                  {services.map(svc => (
                    <tr key={svc.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-surface-container flex items-center justify-center text-primary">
                            <span className="material-symbols-outlined text-[22px]">{svc.icon}</span>
                          </div>
                          <div>
                            <span className="font-bold text-primary text-label-md block">
                              {svc.name}
                            </span>
                            {svc.badge && (
                              <span className="text-[10px] font-semibold uppercase px-2 py-0.5 rounded bg-secondary-fixed text-on-secondary-fixed-variant">
                                {svc.badge}
                              </span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="capitalize font-semibold text-secondary">
                          {svc.category}
                        </span>
                      </td>

                      <td className="py-4 px-6 max-w-xs truncate text-on-surface-variant text-[13px]">
                        {svc.description}
                      </td>

                      <td className="py-4 px-6 font-bold text-primary text-headline-sm">
                        ${svc.price}
                      </td>

                      <td className="py-4 px-6 text-on-surface-variant font-medium">
                        Max {svc.limitPerBooking || 1} per booking
                      </td>

                      <td className="py-4 px-6 text-center">
                        <button
                          type="button"
                          onClick={() => toggleServiceActive(svc.id)}
                          className={`px-3 py-1 rounded-full text-label-sm font-semibold transition-all ${
                            svc.active
                              ? 'bg-secondary-fixed text-on-secondary-fixed-variant'
                              : 'bg-surface-container text-outline'
                          }`}
                        >
                          {svc.active ? 'ACTIVE' : 'INACTIVE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};
