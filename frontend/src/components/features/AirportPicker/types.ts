export interface Airport {
  code: string;
  name: string;
  city: string;
  country: string;
  countryCode: string;
}

export interface AirportPickerProps {
  value?: Airport;
  onChange: (airport: Airport) => void;
  airports: Airport[];
  label?: string;
  placeholder?: string;
  type?: 'origin' | 'destination';
}
