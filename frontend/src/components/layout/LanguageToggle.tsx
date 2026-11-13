import { getLanguage, setLanguage, useLanguage } from '../../i18n';

export function LanguageToggle() {
  const language = useLanguage();
  return (
    <button type="button" onClick={() => setLanguage(getLanguage() === 'en' ? 'vi' : 'en')}
      aria-label={language === 'en' ? 'Switch to Vietnamese' : 'Chuyển sang tiếng Anh'}
      title={language === 'en' ? 'Tiếng Việt' : 'English'}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-outline-variant bg-surface-container-lowest px-2.5 py-2 text-label-md font-semibold text-primary hover:bg-surface-container focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary">
      <span className="material-symbols-outlined text-[18px]" aria-hidden="true">translate</span>
      <span lang="en" className={language === 'en' ? 'font-bold' : 'opacity-50'}>EN</span>
      <span aria-hidden="true" className="text-outline">/</span>
      <span lang="vi" className={`inline-flex items-center gap-1 ${language === 'vi' ? 'font-bold' : 'opacity-50'}`}>
        <svg aria-hidden="true" focusable="false" viewBox="0 0 30 20" className="h-3.5 w-5 shrink-0 rounded-[1px]">
          <path fill="#DA251D" d="M0 0h30v20H0z" />
          <path fill="#FF0" d="m15 4 1.347 4.146h4.359l-3.526 2.562 1.347 4.146L15 12.292l-3.527 2.562 1.347-4.146-3.526-2.562h4.359Z" />
        </svg>
        VI
      </span>
    </button>
  );
}
