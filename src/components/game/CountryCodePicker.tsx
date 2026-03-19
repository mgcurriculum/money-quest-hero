import { useState, useRef, useEffect } from 'react';

export interface Country {
  code: string;
  name: string;
  dial: string;
  flag: string;
}

const COUNTRIES: Country[] = [
  // Priority countries
  { code: 'IN', name: 'India', dial: '+91', flag: '🇮🇳' },
  { code: 'AE', name: 'UAE', dial: '+971', flag: '🇦🇪' },
  { code: 'US', name: 'United States', dial: '+1', flag: '🇺🇸' },
  { code: 'GB', name: 'United Kingdom', dial: '+44', flag: '🇬🇧' },
  // Rest alphabetically
  { code: 'AU', name: 'Australia', dial: '+61', flag: '🇦🇺' },
  { code: 'BH', name: 'Bahrain', dial: '+973', flag: '🇧🇭' },
  { code: 'BD', name: 'Bangladesh', dial: '+880', flag: '🇧🇩' },
  { code: 'BR', name: 'Brazil', dial: '+55', flag: '🇧🇷' },
  { code: 'CA', name: 'Canada', dial: '+1', flag: '🇨🇦' },
  { code: 'CN', name: 'China', dial: '+86', flag: '🇨🇳' },
  { code: 'FR', name: 'France', dial: '+33', flag: '🇫🇷' },
  { code: 'DE', name: 'Germany', dial: '+49', flag: '🇩🇪' },
  { code: 'ID', name: 'Indonesia', dial: '+62', flag: '🇮🇩' },
  { code: 'IT', name: 'Italy', dial: '+39', flag: '🇮🇹' },
  { code: 'JP', name: 'Japan', dial: '+81', flag: '🇯🇵' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'KW', name: 'Kuwait', dial: '+965', flag: '🇰🇼' },
  { code: 'MY', name: 'Malaysia', dial: '+60', flag: '🇲🇾' },
  { code: 'MX', name: 'Mexico', dial: '+52', flag: '🇲🇽' },
  { code: 'NP', name: 'Nepal', dial: '+977', flag: '🇳🇵' },
  { code: 'NL', name: 'Netherlands', dial: '+31', flag: '🇳🇱' },
  { code: 'NZ', name: 'New Zealand', dial: '+64', flag: '🇳🇿' },
  { code: 'NG', name: 'Nigeria', dial: '+234', flag: '🇳🇬' },
  { code: 'OM', name: 'Oman', dial: '+968', flag: '🇴🇲' },
  { code: 'PK', name: 'Pakistan', dial: '+92', flag: '🇵🇰' },
  { code: 'PH', name: 'Philippines', dial: '+63', flag: '🇵🇭' },
  { code: 'QA', name: 'Qatar', dial: '+974', flag: '🇶🇦' },
  { code: 'SA', name: 'Saudi Arabia', dial: '+966', flag: '🇸🇦' },
  { code: 'SG', name: 'Singapore', dial: '+65', flag: '🇸🇬' },
  { code: 'ZA', name: 'South Africa', dial: '+27', flag: '🇿🇦' },
  { code: 'KR', name: 'South Korea', dial: '+82', flag: '🇰🇷' },
  { code: 'ES', name: 'Spain', dial: '+34', flag: '🇪🇸' },
  { code: 'LK', name: 'Sri Lanka', dial: '+94', flag: '🇱🇰' },
  { code: 'SE', name: 'Sweden', dial: '+46', flag: '🇸🇪' },
  { code: 'CH', name: 'Switzerland', dial: '+41', flag: '🇨🇭' },
  { code: 'TH', name: 'Thailand', dial: '+66', flag: '🇹🇭' },
  { code: 'VN', name: 'Vietnam', dial: '+84', flag: '🇻🇳' },
];

interface CountryCodePickerProps {
  selectedCountry: Country;
  onSelect: (country: Country) => void;
}

const CountryCodePicker = ({ selectedCountry, onSelect }: CountryCodePickerProps) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
        setSearch('');
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (open && searchRef.current) {
      searchRef.current.focus();
    }
  }, [open]);

  const filtered = COUNTRIES.filter(
    c =>
      c.name.toLowerCase().includes(search.toLowerCase()) ||
      c.dial.includes(search) ||
      c.code.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div ref={dropdownRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-1.5 bg-game-surface text-game-text rounded-xl px-3 py-3 font-body border border-game-card hover:border-game-gold focus:border-game-gold focus:outline-none transition-colors text-sm whitespace-nowrap"
      >
        <span className="text-lg">{selectedCountry.flag}</span>
        <span>{selectedCountry.dial}</span>
        <span className="text-[10px] text-game-muted">▼</span>
      </button>

      {open && (
        <div className="fixed inset-x-3 top-[max(4rem,env(safe-area-inset-top))] bottom-[max(1rem,env(safe-area-inset-bottom))] md:absolute md:inset-auto md:top-full md:left-0 md:mt-1 md:w-64 md:max-w-64 md:bottom-auto bg-game-surface border border-game-card rounded-xl shadow-xl z-[9999] max-h-[70vh] md:max-h-60 overflow-hidden flex flex-col">
          <div className="p-2 border-b border-game-card">
            <input
              ref={searchRef}
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search country..."
              className="w-full bg-game-card text-game-text rounded-lg px-3 py-2 text-xs font-body border-none focus:outline-none focus:ring-1 focus:ring-game-gold"
            />
          </div>
          <div className="overflow-y-auto flex-1">
            {filtered.map(country => (
              <button
                key={country.code}
                type="button"
                onClick={() => {
                  onSelect(country);
                  setOpen(false);
                  setSearch('');
                }}
                className={`w-full flex items-center gap-2 px-3 py-2 text-xs font-body text-left transition-colors hover:bg-game-card ${
                  selectedCountry.code === country.code ? 'bg-game-card text-game-gold' : 'text-game-text'
                }`}
              >
                <span className="text-base">{country.flag}</span>
                <span className="flex-1 truncate">{country.name}</span>
                <span className="text-game-muted">{country.dial}</span>
              </button>
            ))}
            {filtered.length === 0 && (
              <p className="text-game-muted text-xs text-center py-3">No results</p>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export { COUNTRIES };
export default CountryCodePicker;
