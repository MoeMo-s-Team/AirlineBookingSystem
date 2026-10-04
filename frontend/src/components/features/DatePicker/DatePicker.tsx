import { useState } from 'react';
import { DayPicker } from 'react-day-picker';
import { format, isBefore, startOfToday, startOfDay } from 'date-fns';
import { Icon } from '@/components/ui/Icon/Icon';
import { Modal } from '@/components/ui/Modal/Modal';

export interface DatePickerProps {
  value?: Date;
  onChange: (date: Date) => void;
  minDate?: Date;
  label?: string;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  minDate,
  label = 'Select Date',
  placeholder = 'Pick a date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const today = startOfToday();
  const defaultMinDate = minDate ? startOfDay(minDate) : today;

  const handleSelect = (date: Date | undefined) => {
    if (date) {
      onChange(date);
      setIsOpen(false);
    }
  };

  const disabledDays = (date: Date) => {
    return isBefore(date, defaultMinDate);
  };

  return (
    <>
      {/* Trigger */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="w-full bg-surface-container-low/60 hover:bg-surface-container-low transition-colors rounded-lg p-space-md text-left"
      >
        <span className="font-label-sm text-outline uppercase tracking-wider flex items-center gap-1">
          <Icon name="calendar_today" size={16} className="text-secondary" />
          {label}
        </span>
        <div className="mt-1">
          {value ? (
            <>
              <p className="font-headline-md text-on-surface font-semibold">
                {format(value, 'yyyy-MM-dd')}
              </p>
              <p className="font-body-sm text-outline truncate mt-0.5">
                {format(value, 'EEEE · MMMM d, yyyy')}
              </p>
            </>
          ) : (
            <p className="font-headline-md text-on-surface-variant">
              {placeholder}
            </p>
          )}
        </div>
      </button>

      {/* Calendar Modal */}
      <Modal
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        title={label}
        size="sm"
      >
        <div className="flex justify-center">
          <DayPicker
            mode="single"
            selected={value}
            onSelect={handleSelect}
            disabled={disabledDays}
            fromMonth={today}
            defaultMonth={value || today}
            className="bg-surface-container-lowest rounded-lg p-4"
            classNames={{
              months: 'flex flex-col sm:flex-row space-y-4 sm:space-x-4 sm:space-y-0',
              month: 'space-y-4',
              caption: 'flex justify-center pt-1 relative items-center',
              caption_label: 'font-headline-sm text-primary font-semibold',
              nav: 'space-x-1 flex items-center',
              nav_button: 'h-7 w-7 bg-transparent p-0 opacity-50 hover:opacity-100 border border-outline rounded-lg',
              nav_button_previous: '',
              nav_button_next: '',
              table: 'w-full border-collapse space-y-1',
              head_row: 'flex',
              head_cell: 'text-on-surface-variant w-10 font-label-sm font-semibold text-center',
              row: 'flex w-full mt-2',
              cell: 'h-10 w-10 text-center p-0 relative [&:has([aria-selected])]:bg-surface-container-high rounded-full',
              day: 'h-10 w-10 p-0 font-body-md rounded-full hover:bg-surface-container transition-colors',
              day_selected: 'bg-primary text-on-primary hover:bg-primary-container',
              day_today: 'font-bold border border-secondary',
              day_outside: 'text-outline opacity-50',
              day_disabled: 'text-outline opacity-30 cursor-not-allowed',
              day_range_middle: 'aria-selected:bg-surface-container-high aria-selected:text-on-surface',
              day_hidden: 'invisible',
            }}
            components={{
              IconLeft: () => <Icon name="chevron_left" size={18} />,
              IconRight: () => <Icon name="chevron_right" size={18} />,
            }}
          />
        </div>
      </Modal>
    </>
  );
}
