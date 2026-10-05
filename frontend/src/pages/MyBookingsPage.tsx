import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { BookingCard } from '../components/booking/BookingCard';
import { BookingDossierModal } from '../components/booking/BookingDossierModal';
import { useAuth } from '../context/AuthContext';
import { MOCK_BOOKINGS } from '../data/mockData';
import { Booking } from '../types';

export interface MyBookingsPageProps {
  readonly initialBookings?: readonly Booking[];
}

export const MyBookingsPage: React.FC<MyBookingsPageProps> = () => {
  const { user, isAuthenticated } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([...MOCK_BOOKINGS]);
  const [activeTab, setActiveTab] = useState<'UPCOMING' | 'COMPLETED' | 'CANCELLED'>('UPCOMING');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [isDossierOpen, setIsDossierOpen] = useState(false);

  const handleCancelBooking = (pnr: string) => {
    if (window.confirm(`Are you sure you want to cancel booking ${pnr}? A refund will be initiated.`)) {
      setBookings(prev =>
        prev.map(b => (b.pnr === pnr ? { ...b, status: 'CANCELLED', paymentStatus: 'REFUNDED' } : b))
      );
    }
  };

  const filteredBookings = bookings.filter(b => {
    // Tab filter
    if (activeTab === 'UPCOMING' && (b.status === 'CANCELLED' || b.status === 'COMPLETED')) return false;
    if (activeTab === 'COMPLETED' && b.status !== 'COMPLETED') return false;
    if (activeTab === 'CANCELLED' && b.status !== 'CANCELLED') return false;

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchesPnr = b.pnr.toLowerCase().includes(q);
      const matchesFlight = b.flight.flightNumber.toLowerCase().includes(q);
      const matchesCity = b.flight.arrivalCity.toLowerCase().includes(q) || b.flight.departureCity.toLowerCase().includes(q);
      return matchesPnr || matchesFlight || matchesCity;
    }

    return true;
  });

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <TopNavBar />

      <main className="flex-1 pt-16">
        {/* Page Header */}
        <section className="bg-surface-container-low border-b border-outline-variant py-8 px-6 lg:px-12">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-[11px] font-bold text-secondary uppercase tracking-widest">
                  Passenger Self-Service
                </span>
                {isAuthenticated && user && (
                  <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-surface-container text-primary">
                    Hội Viên {user.name}
                  </span>
                )}
              </div>
              <h1 className="text-headline-lg font-bold text-primary tracking-tight">
                My Bookings & Journeys
              </h1>
              <p className="text-body-md text-on-surface-variant mt-1">
                Retrieve your reservation, download digital boarding passes, or modify seat assignments.
              </p>
            </div>

            <Link
              to="/"
              className="px-6 py-2.5 rounded-xl bg-primary hover:bg-primary-container text-on-primary font-label-lg font-bold shadow-md transition-all self-start sm:self-center"
            >
              Book New Flight
            </Link>
          </div>
        </section>

        {/* Guest Banner if unauthenticated */}
        {!isAuthenticated && (
          <section className="max-w-7xl mx-auto px-6 lg:px-12 pt-6">
            <div className="p-4 rounded-2xl bg-surface-container-low border border-outline-variant flex flex-col sm:flex-row items-center justify-between gap-4 shadow-sm">
              <div className="flex items-center gap-3">
                <span className="material-symbols-outlined text-[24px] text-secondary">info</span>
                <div>
                  <span className="text-label-md font-bold text-primary block">
                    You are exploring as a Guest
                  </span>
                  <span className="text-body-sm text-on-surface-variant">
                    Sign in to your SkyWing Club account to sync your reservations and frequent flyer miles.
                  </span>
                </div>
              </div>
              <Link
                to="/sign-in"
                className="px-4 py-2 rounded-lg bg-primary hover:bg-primary-container text-on-primary text-label-md font-bold transition-colors whitespace-nowrap self-stretch sm:self-auto text-center"
              >
                Sign In Now
              </Link>
            </div>
          </section>
        )}

        {/* Search & Tabs */}
        <section className="max-w-7xl mx-auto px-6 lg:px-12 py-8">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            {/* Tabs */}
            <div className="inline-flex p-1 rounded-xl bg-surface-container-low border border-outline-variant">
              {(['UPCOMING', 'COMPLETED', 'CANCELLED'] as const).map(tab => (
                <button
                  key={tab}
                  type="button"
                  onClick={() => setActiveTab(tab)}
                  className={`px-4 py-2 rounded-lg text-label-md font-semibold transition-all ${
                    activeTab === tab
                      ? 'bg-primary text-on-primary shadow-sm'
                      : 'text-on-surface-variant hover:text-primary'
                  }`}
                >
                  {tab.charAt(0) + tab.slice(1).toLowerCase()}
                </button>
              ))}
            </div>

            {/* PNR Search Box */}
            <div className="relative w-full sm:w-80">
              <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-outline">
                search
              </span>
              <input
                type="text"
                placeholder="Search by PNR or city..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 rounded-xl bg-surface-container-lowest border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary shadow-sm"
              />
            </div>
          </div>

          {/* Bookings List */}
          {filteredBookings.length > 0 ? (
            <div className="space-y-4">
              {filteredBookings.map(booking => (
                <BookingCard
                  key={booking.pnr}
                  booking={booking}
                  onManage={b => {
                    setSelectedBooking(b);
                    setIsDossierOpen(true);
                  }}
                  onCancel={handleCancelBooking}
                />
              ))}
            </div>
          ) : (
            <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl p-12 text-center">
              <div className="w-14 h-14 rounded-full bg-surface-container flex items-center justify-center mx-auto mb-3 text-outline">
                <span className="material-symbols-outlined text-[28px]">flight_takeoff</span>
              </div>
              <h3 className="text-headline-sm font-bold text-primary mb-1">
                No Bookings Found in {activeTab.toLowerCase()}
              </h3>
              <p className="text-body-sm text-on-surface-variant max-w-sm mx-auto mb-6">
                You do not have any flights listed in this section matching your search criteria.
              </p>
              <Link
                to="/"
                className="inline-flex items-center gap-1.5 px-6 py-2.5 rounded-xl bg-primary text-on-primary font-label-md font-bold"
              >
                Search Flights Now
              </Link>
            </div>
          )}
        </section>
      </main>

      <Footer />

      {/* Booking Dossier Modal */}
      <BookingDossierModal
        booking={selectedBooking}
        isOpen={isDossierOpen}
        onClose={() => setIsDossierOpen(false)}
        onCancelBooking={handleCancelBooking}
      />
    </div>
  );
};
