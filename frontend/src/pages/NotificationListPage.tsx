import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { NotificationModel } from '../api/notificationApi';
import { NotificationItem } from '../components/notification/NotificationItem';
import { TopNavBar } from '../components/layout/TopNavBar';
import { Footer } from '../components/layout/Footer';
import { useAuth } from '../context/AuthContext';
import { MissingNotificationSessionError, useNotifications } from '../context/NotificationContext';

const PAGE_SIZE = 20;
type Filter = 'all' | 'unread';

export const NotificationListPage: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const { listPage, markRead } = useNotifications();
  const [filter, setFilter] = useState<Filter>('all');
  const [offset, setOffset] = useState(0);
  const [reloadKey, setReloadKey] = useState(0);
  const [items, setItems] = useState<readonly NotificationModel[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [unavailable, setUnavailable] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [savingId, setSavingId] = useState<number | null>(null);

  useEffect(() => {
    if (!isAuthenticated) {
      setItems([]);
      setTotal(0);
      setLoading(false);
      return;
    }
    let active = true;
    setLoading(true);
    setError(null);
    setUnavailable(false);
    void listPage({ isRead: filter === 'unread' ? false : undefined, limit: PAGE_SIZE, offset })
      .then(page => {
        if (!active) return;
        if (page.data.length === 0 && offset > 0 && page.pagination.total > 0) {
          setOffset(Math.floor((page.pagination.total - 1) / PAGE_SIZE) * PAGE_SIZE);
          return;
        }
        setItems(page.data);
        setTotal(page.pagination.total);
      })
      .catch(cause => {
        if (!active) return;
        setItems([]);
        setUnavailable(cause instanceof MissingNotificationSessionError);
        setError(cause instanceof Error ? cause.message : 'Could not load notifications.');
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAuthenticated, user?.id, listPage, filter, offset, reloadKey]);

  const handleMarkRead = async (id: number) => {
    setSavingId(id);
    setError(null);
    try {
      await markRead(id);
      setReloadKey(value => value + 1);
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not update notification.');
    } finally {
      setSavingId(null);
    }
  };

  const changeFilter = (next: Filter) => {
    setFilter(next);
    setOffset(0);
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <TopNavBar />
      <main className="flex-1 pt-16">
        <section className="border-b border-outline-variant bg-surface-container-low px-6 py-8 lg:px-12">
          <div className="mx-auto max-w-7xl">
            <p className="text-label-sm font-bold uppercase tracking-widest text-secondary">Your journey</p>
            <h1 className="mt-1 text-headline-lg font-bold text-primary">Notifications</h1>
            <p className="mt-1 text-body-md text-on-surface-variant">Updates about your bookings and payments, in one place.</p>
          </div>
        </section>

        <section className="mx-auto w-full max-w-7xl px-6 py-8 lg:px-12">
          {!isAuthenticated ? (
            <div className="max-w-2xl rounded-xl border border-outline-variant bg-surface-container-lowest p-6">
              <h2 className="text-headline-sm font-semibold text-primary">Sign in to view notifications</h2>
              <p className="mt-2 text-body-md text-on-surface-variant">Your booking updates are linked to your SkyWing account.</p>
              <Link to="/sign-in" className="mt-5 inline-flex rounded-lg bg-primary px-5 py-2.5 text-label-md font-semibold text-on-primary hover:bg-primary-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary">
                Sign in
              </Link>
            </div>
          ) : (
            <div className="max-w-3xl">
              <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
                <div role="group" aria-label="Filter notifications" className="inline-flex gap-1 rounded-lg border border-outline-variant bg-surface-container-lowest p-1">
                  <button type="button" aria-pressed={filter === 'all'} onClick={() => changeFilter('all')} className={`rounded-lg px-4 py-2 text-label-md font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary ${filter === 'all' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>All</button>
                  <button type="button" aria-pressed={filter === 'unread'} onClick={() => changeFilter('unread')} className={`rounded-lg px-4 py-2 text-label-md font-semibold focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary ${filter === 'unread' ? 'bg-primary text-on-primary' : 'text-on-surface-variant hover:bg-surface-container-low'}`}>Unread</button>
                </div>
                {!unavailable && !error && !loading && <span className="text-label-md text-on-surface-variant">{total} {total === 1 ? 'notification' : 'notifications'}</span>}
              </div>

              <div className="overflow-hidden rounded-xl border border-outline-variant bg-surface-container-lowest" aria-live="polite">
                {loading && (
                  <div role="status" aria-label="Loading notifications" className="space-y-3 p-5">
                    {[1, 2, 3].map(row => <div key={row} className="h-20 animate-pulse rounded-lg bg-surface-container" />)}
                  </div>
                )}
                {!loading && unavailable && <p className="p-6 text-body-md text-on-surface-variant">Notifications will be available after Supabase sign-in is connected.</p>}
                {!loading && error && !unavailable && (
                  <div role="alert" className="p-6 text-body-md text-error">
                    <p>{error}</p>
                    <button type="button" onClick={() => setReloadKey(value => value + 1)} className="mt-3 font-semibold underline">Try again</button>
                  </div>
                )}
                {!loading && !error && items.length === 0 && (
                  <div className="px-6 py-12 text-center">
                    <span aria-hidden="true" className="material-symbols-outlined text-[30px] text-secondary">notifications_none</span>
                    <h2 className="mt-2 text-headline-sm font-semibold text-primary">{filter === 'unread' ? 'No unread notifications' : "You're all caught up"}</h2>
                    <p className="mt-1 text-body-sm text-on-surface-variant">Booking updates will appear here when they are available.</p>
                  </div>
                )}
                {!loading && !error && items.map(item => (
                  <NotificationItem key={item.id} notification={item} onMarkRead={id => { void handleMarkRead(id); }} saving={savingId === item.id} />
                ))}
              </div>

              {!loading && !error && total > PAGE_SIZE && (
                <nav aria-label="Notification pages" className="mt-5 flex items-center justify-between gap-3">
                  <button type="button" disabled={offset === 0} onClick={() => setOffset(value => Math.max(0, value - PAGE_SIZE))} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-label-md font-semibold text-primary hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary disabled:opacity-50">Previous</button>
                  <span className="text-label-md text-on-surface-variant">{offset + 1}–{Math.min(offset + PAGE_SIZE, total)} of {total}</span>
                  <button type="button" disabled={offset + PAGE_SIZE >= total} onClick={() => setOffset(value => value + PAGE_SIZE)} className="rounded-lg border border-outline-variant bg-surface-container-lowest px-4 py-2 text-label-md font-semibold text-primary hover:bg-surface-container-low focus-visible:outline focus-visible:outline-2 focus-visible:outline-secondary disabled:opacity-50">Next</button>
                </nav>
              )}
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};
