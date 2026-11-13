import { localize, useLanguage } from '../../i18n/index';
import React from 'react';
import { LanguageToggle } from './LanguageToggle';

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
  useLanguage();
  return (
    <header className="min-h-16 bg-surface-container-lowest border-b border-outline-variant flex flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-8 sticky top-0 z-20 shadow-[0_1px_3px_rgba(13,71,161,0.04)]">
      <div className="min-w-0 flex-1">
        <h1 className="text-headline-sm font-bold text-primary tracking-tight">
          {localize(title)}
        </h1>
        {subtitle && (
          <p className="text-body-sm text-on-surface-variant -mt-0.5">
            {localize(subtitle)}
          </p>
        )}
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <LanguageToggle />
        {onSearch && (
          <div className="relative w-40 md:w-64 lg:w-80">
            <span className="material-symbols-outlined absolute left-3 top-2.5 text-[20px] text-outline">
              search
            </span>
            <input
              type="text"
              placeholder={localize("Search records, PNR, flight...")}
              value={searchValue}
              onChange={e => onSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-surface-container-low border border-outline-variant text-body-sm text-on-surface focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
            />
          </div>
        )}

      </div>
    </header>
  );
};
