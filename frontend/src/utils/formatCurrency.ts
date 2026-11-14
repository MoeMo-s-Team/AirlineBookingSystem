import { getLocale } from '../i18n';

const formatters = {
  'en-US': new Intl.NumberFormat('en-US', {
    style: 'currency', currency: 'VND', maximumFractionDigits: 0,
  }),
  'vi-VN': new Intl.NumberFormat('vi-VN', {
  style: 'currency',
  currency: 'VND',
  maximumFractionDigits: 0
  }),
};

export function formatCurrency(value: number): string {
  return formatters[getLocale()].format(value);
}
