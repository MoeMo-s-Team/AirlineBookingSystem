import { getLocale, localize, useLanguage } from '../../i18n/index';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { AdminSidebar } from '../../components/layout/AdminSidebar';
import { LanguageToggle } from '../../components/layout/LanguageToggle';
import { FlightAdminForm } from '../../components/flight/FlightAdminForm';
import { flightAdminApi, type FlightAdminInput } from '../../api/flightAdminApi';
import type { FlightApiModel } from '../../api/flightApi';
import { formatCurrency } from '../../utils/formatCurrency';
import styles from './AdminFlightsPage.module.css';

type FlightFilter = 'all' | 'upcoming' | 'past';
const pageSize = 12;

const messageOf = (error: unknown) =>
  error instanceof Error ? error.message : 'Không thể kết nối với máy chủ.';

const formatTime = (value: string) =>
  new Intl.DateTimeFormat(getLocale(), { dateStyle: 'short', timeStyle: 'short' }).format(new Date(value));

export function AdminFlightsPage() {
  useLanguage();
  const [flights, setFlights] = useState<FlightApiModel[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<FlightFilter>('all');
  const [page, setPage] = useState(1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [editing, setEditing] = useState<FlightApiModel | null | undefined>(undefined);
  const [deleting, setDeleting] = useState<FlightApiModel | null>(null);
  const [deletingBusy, setDeletingBusy] = useState(false);

  const load = useCallback(async () => {
    setLoading(true);
    setLoadError(null);
    try {
      setFlights(await flightAdminApi.list());
    } catch (error) {
      setLoadError(messageOf(error));
    } finally {
      setLoading(false);
    }
  }, []);
  useEffect(() => { void load(); }, [load]);
  useEffect(() => {
    if (editing === undefined && !deleting && !menuOpen) return;
    const closeOnEscape = (event: KeyboardEvent) => {
      if (event.key !== 'Escape') return;
      if (deleting && !deletingBusy) setDeleting(null);
      else if (editing !== undefined && !saving) setEditing(undefined);
      else setMenuOpen(false);
    };
    window.addEventListener('keydown', closeOnEscape);
    return () => window.removeEventListener('keydown', closeOnEscape);
  }, [editing, deleting, deletingBusy, saving, menuOpen]);

  const filtered = useMemo(() => {
    const query = search.trim().toLowerCase();
    const now = Date.now();
    return flights.filter(flight => {
      const departure = new Date(flight.departureTime).getTime();
      const matchesStatus = filter === 'all' || (filter === 'upcoming' ? departure >= now : departure < now);
      const matchesQuery = !query || [flight.flightNumber, flight.origin, flight.destination]
        .some(value => value.toLowerCase().includes(query));
      return matchesStatus && matchesQuery;
    }).sort((a, b) => a.departureTime.localeCompare(b.departureTime));
  }, [flights, search, filter]);
  const pageCount = Math.max(1, Math.ceil(filtered.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const visible = filtered.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const save = async (input: FlightAdminInput) => {
    setSaving(true);
    setActionError(null);
    try {
      if (editing) {
        const original: FlightAdminInput = {
          flightNumber: editing.flightNumber,
          origin: editing.origin,
          destination: editing.destination,
          departureTime: editing.departureTime.slice(0, 16),
          arrivalTime: editing.arrivalTime.slice(0, 16),
          basePrice: editing.basePrice,
          availableSeats: editing.availableSeats,
        };
        const changed = Object.fromEntries(
          (Object.keys(input) as (keyof FlightAdminInput)[])
            .filter(key => input[key] !== original[key])
            .map(key => [key, input[key]])
        ) as Partial<FlightAdminInput>;
        if (Object.keys(changed).length > 0) {
          const updated = await flightAdminApi.update(editing.id, changed);
          setFlights(current => current.map(flight => flight.id === updated.id ? updated : flight));
        }
        setNotice('Đã cập nhật chuyến bay.');
      } else {
        const created = await flightAdminApi.create(input);
        setFlights(current => [...current, created].sort((a, b) => a.departureTime.localeCompare(b.departureTime)));
        setNotice('Đã tạo chuyến bay.');
      }
      setEditing(undefined);
    } catch (error) {
      setActionError(messageOf(error));
    } finally {
      setSaving(false);
    }
  };

  const remove = async () => {
    if (!deleting) return;
    const flight = deleting;
    setDeletingBusy(true);
    setActionError(null);
    setNotice(null);
    try {
      await flightAdminApi.remove(flight.id);
      setFlights(current => current.filter(item => item.id !== flight.id));
      setNotice(`Đã xóa ${flight.flightNumber}.`);
      setDeleting(null);
    } catch (error) {
      setActionError(messageOf(error));
    } finally {
      setDeletingBusy(false);
    }
  };

  const upcoming = flights.filter(flight => new Date(flight.departureTime).getTime() >= Date.now()).length;
  const seats = flights.reduce((sum, flight) => sum + flight.availableSeats, 0);

  return (
    <div className={styles.page}>
      <div className={`${styles.sidebarShell} ${menuOpen ? styles.sidebarOpen : ''}`}><AdminSidebar /></div>
      {menuOpen && <button type="button" className={styles.sidebarVeil} aria-label={localize("Close navigation")} onClick={() => setMenuOpen(false)} />}
      <div className={styles.content}>
        <header className={styles.topbar}>
          <button type="button" className={styles.mobileMenu} aria-label={localize("Open navigation")} aria-expanded={menuOpen}
            onClick={() => setMenuOpen(open => !open)}><span className="material-symbols-outlined" aria-hidden="true">menu</span></button>
          <div>
            <p className={styles.eyebrow}>{localize("Operations / Flights")}</p>
            <h1 className={styles.title}>{localize("Flight schedules")}</h1>
            <p className={styles.subtitle}>{localize("Manage routes, departure times, fares and available seats.")}</p>
          </div>
          <div className={styles.headerActions}>
            <LanguageToggle />
            <button type="button" className={styles.secondaryButton} onClick={() => void load()} disabled={loading}>
              <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">refresh</span>{localize("Refresh ")}</button>
            <button type="button" className={styles.primaryButton} onClick={() => { setEditing(null); setActionError(null); setNotice(null); }}>
              <span className={`material-symbols-outlined ${styles.icon}`} aria-hidden="true">add</span>{localize("Add flight ")}</button>
          </div>
        </header>
        <main className={styles.main}>
          <section className={styles.summary} aria-label={localize("Flight summary")}>
            {[
              ['Total flights', flights.length],
              ['Upcoming flights', upcoming],
              ['Available seats', seats],
            ].map(([label, value]) => (
              <div key={label} className={styles.stat}><span className={styles.statLabel}>{localize(label)}</span>
                <span className={styles.statValue}>{localize(Number(value).toLocaleString(getLocale()))}</span></div>
            ))}
          </section>
          {editing === undefined && actionError && <p role="alert" className={`${styles.feedback} ${styles.error}`}>{localize(actionError)}</p>}
          {notice && <p role="status" className={styles.feedback}>{localize(notice)}</p>}
          <section className={styles.panel} aria-labelledby="schedule-title">
            <div className={styles.panelHead}>
              <div><h2 id="schedule-title" className={styles.panelTitle}>{localize("Schedule")}</h2>
                <p className={styles.panelHint}>{localize(filtered.length.toLocaleString(getLocale()))}{localize(" of ")}{localize(flights.length.toLocaleString(getLocale()))}{localize(" flights")}</p></div>
            </div>
            <div className={styles.toolbar}>
              <label className={styles.searchBox}>
                <span className="sr-only">{localize("Search flights by number or airport")}</span>
                <span className={`material-symbols-outlined ${styles.searchIcon}`} aria-hidden="true">search</span>
                <input className={styles.searchInput} type="search" value={search} placeholder={localize("Flight number or airport code")}
                  onChange={event => { setSearch(event.target.value); setPage(1); }} />
              </label>
              <div className={styles.segments} role="group" aria-label={localize("Filter flights by departure")}>
                {([['all', 'All'], ['upcoming', 'Upcoming'], ['past', 'Past']] as const).map(([value, label]) => (
                  <button key={value} type="button" className={`${styles.segment} ${filter === value ? styles.segmentActive : ''}`}
                    aria-pressed={filter === value} onClick={() => { setFilter(value); setPage(1); }}>{localize(label)}</button>
                ))}
              </div>
            </div>
            {loadError && <p role="alert" className={`${styles.feedback} ${styles.error}`}>{localize("Failed to load flights: ")}{localize(loadError)}</p>}
            {loading ? <p role="status" className={styles.feedback}>{localize("Loading flights…")}</p>
              : !loadError && filtered.length === 0
                ? <div className={styles.empty}><strong>{localize(flights.length === 0 ? 'No flights yet' : 'No matching flights')}</strong>
                  <span>{localize(flights.length === 0 ? 'Add the first flight to build your schedule.' : 'Try another flight number, airport or departure filter.')}</span></div>
                : !loadError && <>
                  <div className={styles.tableWrap}><table className={styles.table}>
                    <thead><tr><th>{localize("Flight")}</th><th>{localize("Route")}</th><th>{localize("Departure")}</th><th>{localize("Arrival")}</th><th>{localize("Base fare")}</th><th>{localize("Seats")}</th><th>{localize("Actions")}</th></tr></thead>
                    <tbody>{visible.map(flight => (
                      <tr key={flight.id}>
                        <td data-label="Flight"><span className={styles.flightCode}>{localize(flight.flightNumber)}</span></td>
                        <td data-label="Route"><span className={styles.route}>{localize(flight.origin)} → {localize(flight.destination)}</span></td>
                        <td data-label="Departure"><span className={styles.time}>{localize(formatTime(flight.departureTime))}</span></td>
                        <td data-label="Arrival"><span className={styles.time}>{localize(formatTime(flight.arrivalTime))}</span></td>
                        <td data-label="Base fare"><span className={styles.money}>{localize(formatCurrency(flight.basePrice))}</span></td>
                        <td data-label="Seats"><span className={styles.number}>{localize(flight.availableSeats)}</span></td>
                        <td data-label="Actions"><div className={styles.rowActions}>
                          <button type="button" className={styles.textButton}
                            onClick={() => { setEditing(flight); setActionError(null); setNotice(null); }}>{localize("Edit")}</button>
                          <button type="button" className={`${styles.textButton} ${styles.dangerButton}`}
                            onClick={() => { setDeleting(flight); setActionError(null); setNotice(null); }} aria-label={localize(`Delete ${flight.flightNumber}`)}>{localize("Delete")}</button>
                        </div></td>
                      </tr>
                    ))}</tbody>
                  </table></div>
                  <div className={styles.pager}>
                    <span>{localize("Showing ")}<strong>{localize((currentPage - 1) * pageSize + 1)}–{localize(Math.min(currentPage * pageSize, filtered.length))}</strong>{localize(" of ")}<strong>{localize(filtered.length)}</strong></span>
                    <div className={styles.pagerActions}>
                      <button type="button" className={styles.secondaryButton} disabled={currentPage === 1} onClick={() => setPage(currentPage - 1)}>{localize("Previous")}</button>
                      <span>{localize("Page ")}{localize(currentPage)}{localize(" of ")}{localize(pageCount)}</span>
                      <button type="button" className={styles.secondaryButton} disabled={currentPage === pageCount} onClick={() => setPage(currentPage + 1)}>{localize("Next")}</button>
                    </div>
                  </div>
                </>}
          </section>
        </main>
      </div>
      {editing !== undefined && <>
        <button type="button" className={styles.backdrop} aria-label={localize("Close flight form")} onClick={() => { if (!saving) setEditing(undefined); }} />
        <div className={styles.drawer} role="dialog" aria-modal="true" aria-label={localize(editing ? `Edit ${editing.flightNumber}` : 'Add a flight')}>
          <FlightAdminForm key={editing?.id ?? 'new'} flight={editing} saving={saving} error={actionError}
            onSave={input => void save(input)} onCancel={() => { if (!saving) { setEditing(undefined); setActionError(null); } }} />
        </div>
      </>}
      {deleting && <>
        <button type="button" className={styles.backdrop} aria-label={localize("Cancel delete")} onClick={() => { if (!deletingBusy) setDeleting(null); }} />
        <div className={styles.confirm} role="alertdialog" aria-modal="true" aria-label={localize(`Delete ${deleting.flightNumber}`)}>
          <h2>{localize("Delete ")}{localize(deleting.flightNumber)}?</h2>
          <p>{localize("This removes the flight from the schedule. Please confirm before continuing.")}</p>
          {actionError && <p role="alert" className={styles.error}>{localize(actionError)}</p>}
          <div className={styles.confirmActions}>
            <button type="button" className={styles.secondaryButton} disabled={deletingBusy} onClick={() => setDeleting(null)}>{localize("Cancel")}</button>
            <button type="button" className={styles.deleteButton} disabled={deletingBusy} onClick={() => void remove()}>{localize(deletingBusy ? 'Deleting…' : 'Delete flight')}</button>
          </div>
        </div>
      </>}
    </div>
  );
}
