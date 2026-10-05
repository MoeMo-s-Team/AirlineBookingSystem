import React, { useState } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { StatusBadge } from '../../components/common/StatusBadge';
import { BookingDossierModal } from '../../components/booking/BookingDossierModal';
import { useAdminPortal } from '../../hooks/useAdminPortal';
import { Booking } from '../../types';

export interface AdminBookingsPageProps {
  readonly onBookingSelected?: (booking: Booking) => void;
}

export const AdminBookingsPage: React.FC<AdminBookingsPageProps> = () => {
  const { bookings, cancelBooking } = useAdminPortal();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const filteredBookings = bookings.filter(b => {
    if (statusFilter !== 'ALL' && b.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      const pnrMatch = b.pnr.toLowerCase().includes(q);
      const paxMatch = b.passengers.some(p =>
        `${p.firstName} ${p.lastName}`.toLowerCase().includes(q) || p.email.toLowerCase().includes(q)
      );
      const flightMatch = b.flight.flightNumber.toLowerCase().includes(q);
      return pnrMatch || paxMatch || flightMatch;
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="Global Bookings & PNR Registry"
          subtitle="Customer reservations, ticket issuance audit, passenger manifest, and refund management"
          searchValue={search}
          onSearch={setSearch}
        />

        <main className="flex-1 p-8 space-y-8">
          {/* Table Container */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-label-md font-bold text-primary uppercase tracking-wider">
                  Reservations Table
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-label-sm font-semibold">
                  {filteredBookings.length} PNRs Found
                </span>
              </div>

              {/* Status Filter */}
              <div className="flex items-center gap-2">
                <span className="text-label-sm text-outline font-semibold">Status:</span>
                <select
                  value={statusFilter}
                  onChange={e => setStatusFilter(e.target.value)}
                  className="px-3 py-1.5 rounded-lg bg-surface-container-low border border-outline-variant text-label-sm text-on-surface focus:outline-none"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="PENDING">Pending</option>
                  <option value="COMPLETED">Completed</option>
                  <option value="CANCELLED">Cancelled</option>
                </select>
              </div>
            </div>

            {/* Bookings Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-outline uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">PNR Code</th>
                    <th className="py-3.5 px-6">Primary Passenger</th>
                    <th className="py-3.5 px-6">Flight & Route</th>
                    <th className="py-3.5 px-6">Date</th>
                    <th className="py-3.5 px-6">Total Amount</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                  {filteredBookings.map(b => (
                    <tr key={b.pnr} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6">
                        <span className="font-mono font-bold text-headline-sm text-primary">
                          {b.pnr}
                        </span>
                        <span className="text-[11px] text-on-surface-variant block">
                          {b.bookingDate}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-bold text-primary block">
                          {b.passengers[0]?.lastName} {b.passengers[0]?.firstName}
                        </span>
                        <span className="text-[12px] text-on-surface-variant block">
                          {b.passengers[0]?.email}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-primary block">
                          {b.flight.flightNumber} ({b.flight.departureCode} → {b.flight.arrivalCode})
                        </span>
                        <span className="text-[12px] text-on-surface-variant block">
                          {b.fareClass.tier}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-medium">
                        {b.departureDate}
                      </td>

                      <td className="py-4 px-6 font-bold text-primary">
                        ${b.grandTotal}
                        <span className="text-[11px] font-normal text-secondary block">
                          {b.paymentStatus}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <StatusBadge status={b.status} />
                      </td>

                      <td className="py-4 px-6 text-right space-x-2">
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedBooking(b);
                            setIsDossierOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-label-sm font-semibold text-primary transition-colors"
                        >
                          Dossier
                        </button>
                        {b.status === 'CONFIRMED' && (
                          <button
                            type="button"
                            onClick={() => {
                              if (window.confirm(`Issue refund and cancel PNR ${b.pnr}?`)) {
                                cancelBooking(b.pnr);
                              }
                            }}
                            className="px-3 py-1.5 rounded-lg text-label-sm font-semibold text-error hover:bg-error-container/20 transition-colors"
                          >
                            Refund
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      {/* Dossier Modal */}
      <BookingDossierModal
        booking={selectedBooking}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onCancelBooking={cancelBooking}
      />
    </div>
  );
};
