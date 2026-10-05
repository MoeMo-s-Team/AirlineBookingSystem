import React from 'react';

export interface AdminHeaderProps {
  readonly title: string;
  readonly subtitle?: string;
  readonly onSearch?: (query: string) => void;
  readonly searchValue?: string;
}

export const AdminHeader: React.FC<AdminHeaderProps> = ({
  title,
  subtitle,
  onSearch,
  searchValue = ''
}) => {
  return (
    <header className="h-16 bg-surface-container-lowest border-b border-outline-variant flex items-center justify-between px-8 sticky top-0 z-20 shadow-[0_1px_3px_rgba(13,71,161,0.04)]">
      <div>
        <h1 className="text-headline-sm font-bold text-primary tracking-tight">
          {title}
        </h1>
        {subtitle && (
          <p className="text-body-sm text-on-surface-variant -mt-0.5">
            {subtitle}
          </p>
        )}
      </div>

      <div className="flex items-center gap-4">
        {onSearch && (
          <div className="relative w-64 md:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-outline">
              search
            </span>
            <input
              type="text"
              placeholder="Search records, PNR, flight..."
              value={searchValue}
              onChange={e => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        )}

        <div className="flex items-center gap-2 pl-4 border-l border-outline-variant">
          <div className="w-8 h-8 rounded-full bg-secondary text-on-secondary flex items-center justify-center font-bold text-xs">
            OP
          </div>
          <div className="hidden sm:flex flex-col">
            <span className="text-label-md font-semibold text-primary leading-tight">
              Flight Dispatcher
            </span>
            <span className="text-[10px] text-on-surface-variant uppercase tracking-wider">
              Control Tower
            </span>
          </div>
        </div>
      </div>
    </header>
  );
};
