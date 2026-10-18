import { useState, type FormEvent } from 'react';
import type { FlightApiModel } from '../../api/flightApi';
import type { FlightAdminInput } from '../../api/flightAdminApi';
import styles from './FlightAdminForm.module.css';

interface Props {
  flight: FlightApiModel | null;
  saving: boolean;
  error: string | null;
  onSave: (input: FlightAdminInput) => void;
  onCancel: () => void;
}

const groups = [
  {
    title: 'Flight and route',
    fields: [
      ['flightNumber', 'Flight number', 'text'],
      ['origin', 'Origin (IATA)', 'text'],
      ['destination', 'Destination (IATA)', 'text'],
    ],
  },
  {
    title: 'Schedule',
    fields: [
      ['departureTime', 'Departure', 'datetime-local'],
      ['arrivalTime', 'Arrival', 'datetime-local'],
    ],
  },
  {
    title: 'Fare and inventory',
    fields: [
      ['basePrice', 'Base price (VND)', 'number'],
      ['availableSeats', 'Seats available', 'number'],
    ],
  },
] as const;

export function FlightAdminForm({ flight, saving, error, onSave, onCancel }: Props) {
  const [input, setInput] = useState<FlightAdminInput>({
    flightNumber: flight?.flightNumber ?? '',
    origin: flight?.origin ?? '',
    destination: flight?.destination ?? '',
    departureTime: flight?.departureTime.slice(0, 16) ?? '',
    arrivalTime: flight?.arrivalTime.slice(0, 16) ?? '',
    basePrice: flight?.basePrice ?? 0,
    availableSeats: flight?.availableSeats ?? 1,
  });
  const [validationError, setValidationError] = useState<string | null>(null);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const normalized = {
      ...input,
      flightNumber: input.flightNumber.trim().toUpperCase(),
      origin: input.origin.trim().toUpperCase(),
      destination: input.destination.trim().toUpperCase(),
    };
    let problem: string | null = null;
    if (!/^[A-Z]{3}$/.test(normalized.origin) || !/^[A-Z]{3}$/.test(normalized.destination)) {
      problem = 'Mã sân bay phải gồm đúng 3 chữ cái.';
    } else if (normalized.origin === normalized.destination) {
      problem = 'Sân bay đi và đến phải khác nhau.';
    } else if (new Date(normalized.arrivalTime).getTime() <= new Date(normalized.departureTime).getTime()) {
      problem = 'Giờ đến phải sau giờ khởi hành.';
    } else if ((!flight || normalized.departureTime !== flight.departureTime.slice(0, 16)) &&
      new Date(normalized.departureTime).getTime() <= Date.now()) {
      problem = 'Giờ khởi hành phải ở tương lai.';
    } else if (normalized.basePrice <= 0 || !Number.isInteger(normalized.availableSeats) || normalized.availableSeats <= 0) {
      problem = 'Giá và số ghế phải lớn hơn 0.';
    }
    setValidationError(problem);
    if (!problem) onSave(normalized);
  };

  return (
    <form onSubmit={submit} aria-label={flight ? 'Edit flight' : 'Create flight'}
      className={styles.form}>
      <div className={styles.head}>
        <div>
          <p className={styles.eyebrow}>Flight management</p>
          <h2 className={styles.title}>{flight ? `Edit ${flight.flightNumber}` : 'Add a flight'}</h2>
          <p className={styles.intro}>Update the schedule, fare and seat inventory shown to passengers.</p>
        </div>
        <button type="button" onClick={onCancel} className={styles.close} aria-label="Close flight form">
          <span className="material-symbols-outlined" aria-hidden="true">close</span>
        </button>
      </div>
      <div className={styles.body}>
        {groups.map(group => (
          <section key={group.title} className={styles.group}>
            <h3 className={styles.groupTitle}>{group.title}</h3>
            <div className={styles.grid}>
              {group.fields.map(([name, label, type]) => (
                <label key={name} className={`${styles.field} ${name === 'flightNumber' ? styles.wide : ''}`}>
                  {label}
                  <input required type={type} aria-label={label} maxLength={type === 'text' ? name === 'flightNumber' ? 20 : 3 : undefined}
                    min={type === 'number' ? name === 'availableSeats' ? 1 : 0.01 : undefined}
                    step={type === 'number' ? name === 'availableSeats' ? 1 : 0.01 : undefined}
                    value={input[name]}
                    onChange={event => {
                      const value = type === 'number' ? Number(event.target.value) : event.target.value;
                      setInput(previous => ({ ...previous, [name]: value }));
                      setValidationError(null);
                    }}
                    className={styles.input} />
                  {name === 'departureTime' && <span className={styles.helper}>Local departure time</span>}
                </label>
              ))}
            </div>
          </section>
        ))}
        {(validationError || error) && <p role="alert" className={styles.error}>{validationError || error}</p>}
      </div>
      <div className={styles.footer}>
        <button type="button" onClick={onCancel} className={styles.cancel}>Cancel</button>
        <button type="submit" disabled={saving} className={styles.submit}>
          {saving ? 'Saving…' : flight ? 'Save changes' : 'Create flight'}
        </button>
      </div>
    </form>
  );
}
