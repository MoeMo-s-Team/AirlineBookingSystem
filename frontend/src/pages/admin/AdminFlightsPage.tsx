import React, { useState } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { AdminHeader } from '../../components/layout/AdminHeader';
import { MetricCard } from '../../components/common/MetricCard';
import { useAdminPortal } from '../../hooks/useAdminPortal';
import { Flight } from '../../types';

export interface AdminFlightsPageProps {
  readonly onFlightSelect?: (flight: Flight) => void;
}

export const AdminFlightsPage: React.FC<AdminFlightsPageProps> = () => {
  const { flights, metrics, updateFlightStatus } = useAdminPortal();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  const filteredFlights = flights.filter(f => {
    if (statusFilter !== 'ALL' && f.status !== statusFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        f.flightNumber.toLowerCase().includes(q) ||
        f.departureCode.toLowerCase().includes(q) ||
        f.arrivalCode.toLowerCase().includes(q) ||
        f.aircraft.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="min-h-screen bg-background flex">
      <AdminSidebar />

      <div className="flex-1 ml-64 flex flex-col min-h-screen">
        <AdminHeader
          title="Flight Operations & Schedules"
          subtitle="Real-time aircraft dispatch, turnaround tracking, and status controls"
          searchValue={search}
          onSearch={setSearch}
        />

        <main className="flex-1 p-8 space-y-8">
          {/* KPI Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            <MetricCard
              title="Active Flights"
              value={metrics.activeFlights}
              changeText={metrics.flightsChange}
              icon="flight_takeoff"
              trend="positive"
            />
            <MetricCard
              title="Bookings Today"
              value={metrics.totalBookingsToday.toLocaleString()}
              changeText={metrics.bookingsChange}
              icon="confirmation_number"
              trend="positive"
            />
            <MetricCard
              title="Daily Revenue"
              value={`$${metrics.revenueToday.toLocaleString()}`}
              changeText={metrics.revenueChange}
              icon="payments"
              trend="positive"
            />
            <MetricCard
              title="On-Time Index"
              value={`${metrics.onTimePercentage}%`}
              changeText="Target: ≥99.0%"
              icon="verified"
              trend="positive"
            />
          </div>

          {/* Table Container */}
          <div className="bg-surface-container-lowest border border-outline-variant rounded-2xl shadow-sm overflow-hidden">
            {/* Table Toolbar */}
            <div className="p-6 border-b border-outline-variant flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <span className="text-label-md font-bold text-primary uppercase tracking-wider">
                  Flights Table
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-surface-container text-primary text-label-sm font-semibold">
                  {filteredFlights.length} Flights
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
                  <option value="SCHEDULED">Scheduled</option>
                  <option value="BOARDING">Boarding</option>
                  <option value="DEPARTED">Departed</option>
                  <option value="DELAYED">Delayed</option>
                </select>
              </div>
            </div>

            {/* Flights Data Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-surface-container-low border-b border-outline-variant text-label-sm text-outline uppercase tracking-wider font-semibold">
                    <th className="py-3.5 px-6">Flight & Aircraft</th>
                    <th className="py-3.5 px-6">Route</th>
                    <th className="py-3.5 px-6">Departure / Arrival</th>
                    <th className="py-3.5 px-6">Base Fare</th>
                    <th className="py-3.5 px-6">Seats Left</th>
                    <th className="py-3.5 px-6">Status</th>
                    <th className="py-3.5 px-6 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-outline-variant text-body-sm text-on-surface">
                  {filteredFlights.map(flight => (
                    <tr key={flight.id} className="hover:bg-surface-container-low/50 transition-colors">
                      <td className="py-4 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-lg bg-surface-container flex items-center justify-center text-primary font-bold">
                            <span className="material-symbols-outlined text-[20px]">flight</span>
                          </div>
                          <div>
                            <span className="font-bold text-primary text-label-md block">
                              {flight.flightNumber}
                            </span>
                            <span className="text-[12px] text-on-surface-variant block">
                              {flight.aircraft}
                            </span>
                          </div>
                        </div>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-semibold text-primary block">
                          {flight.departureCode} → {flight.arrivalCode}
                        </span>
                        <span className="text-[12px] text-on-surface-variant block">
                          {flight.duration} • {flight.stops === 0 ? 'Non-stop' : `${flight.stops} stop`}
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <span className="font-medium block">
                          {flight.departureTime} - {flight.arrivalTime}
                        </span>
                        <span className="text-[12px] text-secondary font-medium block">
                          {flight.departureTerminal} → {flight.arrivalTerminal}
                        </span>
                      </td>

                      <td className="py-4 px-6 font-bold text-primary">
                        ${flight.basePrice}
                      </td>

                      <td className="py-4 px-6">
                        <span className="px-2 py-0.5 rounded bg-surface-container text-primary font-semibold text-label-sm">
                          {flight.seatsAvailable} left
                        </span>
                      </td>

                      <td className="py-4 px-6">
                        <select
                          value={flight.status}
                          onChange={e => updateFlightStatus(flight.id, e.target.value as any)}
                          className="px-2 py-1 rounded bg-surface-container-low border border-outline-variant text-label-sm font-semibold text-primary cursor-pointer"
                        >
                          <option value="SCHEDULED">SCHEDULED</option>
                          <option value="BOARDING">BOARDING</option>
                          <option value="DEPARTED">DEPARTED</option>
                          <option value="DELAYED">DELAYED</option>
                        </select>
                      </td>

                      <td className="py-4 px-6 text-right">
                        <button
                          type="button"
                          onClick={() => alert(`Opening dispatcher manifest for ${flight.flightNumber}`)}
                          className="px-3 py-1.5 rounded-lg border border-outline-variant hover:bg-surface-container text-label-sm font-semibold text-primary transition-colors"
                        >
                          Manifest
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
