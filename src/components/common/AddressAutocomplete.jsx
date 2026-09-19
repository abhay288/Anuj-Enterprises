import React, { useState, useEffect, useRef, useMemo } from 'react';
import { MapPin, Search, Check, Building2, Store, Navigation, CornerDownLeft } from 'lucide-react';
import KANPUR_PLACES from '../../data/kanpurPlaces.json';

/**
 * High-performance, client-side Kanpur Nagar search algorithm.
 * Follows strict priority ranking:
 * 1. Exact match
 * 2. StartsWith match (name, place, locality, village, or keywords)
 * 3. Contains match
 * 4. Popularity tie-breaker
 * 
 * ZERO external API calls, ZERO API keys required, completely offline-capable.
 */
export const searchKanpurPlaces = (rawQuery, maxResults = 8) => {
  const q = (rawQuery || '').trim().toLowerCase();
  if (!q || q.length < 1) return [];

  const scored = [];

  for (let i = 0; i < KANPUR_PLACES.length; i++) {
    const item = KANPUR_PLACES[i];
    const nameLower = (item.name || '').toLowerCase();
    const labelLower = (item.label || '').toLowerCase();
    const placeLower = (item.place || '').toLowerCase();
    const localityLower = (item.locality || '').toLowerCase();
    const villageLower = (item.village || '').toLowerCase();
    const blockLower = (item.block || '').toLowerCase();
    const tehsilLower = (item.tehsil || '').toLowerCase();
    const pincode = item.pincode || '';
    const keywords = item.keywords || [];

    let matchRank = 0; // 0 = no match, 1 = contains, 2 = startsWith, 3 = exact

    // 1. Exact match check
    if (
      nameLower === q || 
      placeLower === q || 
      localityLower === q || 
      villageLower === q ||
      pincode === q
    ) {
      matchRank = 3;
    }
    // 2. StartsWith check
    else if (
      nameLower.startsWith(q) ||
      placeLower.startsWith(q) ||
      localityLower.startsWith(q) ||
      villageLower.startsWith(q) ||
      blockLower.startsWith(q) ||
      tehsilLower.startsWith(q) ||
      pincode.startsWith(q) ||
      keywords.some(k => k === q || k.startsWith(q))
    ) {
      matchRank = 2;
    }
    // 3. Contains / Word matching check
    else if (
      labelLower.includes(q) ||
      nameLower.includes(q) ||
      placeLower.includes(q) ||
      localityLower.includes(q) ||
      villageLower.includes(q) ||
      blockLower.includes(q) ||
      tehsilLower.includes(q) ||
      keywords.some(k => k.includes(q))
    ) {
      matchRank = 1;
    }

    if (matchRank > 0) {
      // Calculate composite score
      // matchRank has dominant weight (exact = 3000, startsWith = 2000, contains = 1000)
      // Popularity adds 0 - 100
      // Shorter name bonus to favor concise matches (e.g. "Kanpur" over "Kanpur Central")
      const brevityBonus = Math.max(0, 30 - nameLower.length);
      const score = (matchRank * 1000) + (item.popularity || 50) + brevityBonus;
      scored.push({ item, score, matchRank });
    }
  }

  // Sort descending by calculated score
  scored.sort((a, b) => b.score - a.score);

  return scored.slice(0, maxResults).map(s => s.item);
};

/**
 * Returns a structured address object containing only non-empty fields.
 */
export const buildStructuredAddress = (item, rawAddressText) => {
  const addrText = rawAddressText || item.label || item.name || '';
  const structured = {
    address: addrText,
    label: addrText,
    city: item.city || 'Kanpur',
    district: item.district || 'Kanpur Nagar',
    state: item.state || 'Uttar Pradesh'
  };

  if (item.place) structured.place = item.place;
  if (item.village) structured.village = item.village;
  if (item.locality) structured.locality = item.locality;
  if (item.tehsil) structured.tehsil = item.tehsil;
  if (item.block) structured.block = item.block;
  if (item.pincode) structured.pincode = item.pincode;

  return structured;
};


export const AddressAutocomplete = ({
  value = '',
  onChange,
  onSelectLocation,
  placeholder = 'Search shop, mandi, locality or village in Kanpur Nagar...',
  className = '',
  required = false,
  disabled = false,
  id
}) => {
  const [query, setQuery] = useState(value);
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const wrapperRef = useRef(null);
  const inputRef = useRef(null);

  // Sync internal query if external value prop updates
  useEffect(() => {
    setQuery(value || '');
  }, [value]);

  // Handle click outside to dismiss the dropdown
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Compute suggestions purely in client-side memory (instant, 0ms lag)
  const suggestions = useMemo(() => {
    return searchKanpurPlaces(query, 8);
  }, [query]);

  const hasQuery = (query || '').trim().length > 0;
  const isNotFound = hasQuery && suggestions.length === 0;

  const handleInputChange = (e) => {
    const val = e.target.value;
    setQuery(val);
    setIsOpen(true);
    setHighlightedIndex(-1);
    if (onChange) onChange(e);
  };

  const handleSelect = (item) => {
    const structured = buildStructuredAddress(item, item.label || item.name);
    setQuery(structured.address);
    setIsOpen(false);

    if (onChange) {
      onChange({ target: { value: structured.address, name: 'address' } });
    }
    if (onSelectLocation) {
      onSelectLocation(structured);
    }
  };

  // Fallback: User enters address manually without forcing autocomplete selection
  const handleUseManualAddress = () => {
    setIsOpen(false);
    const manualStructured = {
      address: query.trim(),
      city: 'Kanpur',
      district: 'Kanpur Nagar',
      state: 'Uttar Pradesh'
    };
    if (onChange) {
      onChange({ target: { value: query.trim(), name: 'address' } });
    }
    if (onSelectLocation) {
      onSelectLocation(manualStructured);
    }
  };

  const handleKeyDown = (e) => {
    if (!isOpen) {
      if (e.key === 'ArrowDown') {
        setIsOpen(true);
      }
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex(prev => (prev < suggestions.length - 1 ? prev + 1 : 0));
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (suggestions.length > 0) {
        setHighlightedIndex(prev => (prev > 0 ? prev - 1 : suggestions.length - 1));
      }
    } else if (e.key === 'Enter') {
      if (highlightedIndex >= 0 && highlightedIndex < suggestions.length) {
        e.preventDefault();
        handleSelect(suggestions[highlightedIndex]);
      } else if (isNotFound) {
        e.preventDefault();
        handleUseManualAddress();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const getTypeBadge = (type) => {
    switch (type) {
      case 'mandi':
        return { text: 'Wholesale Mandi', bg: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20' };
      case 'tehsil':
        return { text: 'Tehsil', bg: 'bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20' };
      case 'block':
        return { text: 'Block', bg: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20' };
      case 'village':
        return { text: 'Gram Panchayat', bg: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20' };
      case 'industrial':
        return { text: 'Industrial Area', bg: 'bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20' };
      case 'city':
      case 'district':
        return { text: 'Kanpur Nagar', bg: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20' };
      case 'landmark':
        return { text: 'Landmark', bg: 'bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border-indigo-500/20' };
      default:
        return { text: 'Locality', bg: 'bg-slate-500/10 text-slate-600 dark:text-slate-400 border-slate-500/20' };
    }
  };

  return (
    <div ref={wrapperRef} className="relative w-full">
      <div className="relative flex items-center">
        <MapPin className="absolute left-3.5 w-4 h-4 text-amber-500 dark:text-amber-400 pointer-events-none shrink-0" />
        <input
          ref={inputRef}
          id={id}
          type="text"
          value={query}
          onChange={handleInputChange}
          onFocus={() => {
            if (hasQuery) setIsOpen(true);
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          autoComplete="off"
          spellCheck="false"
          className={`w-full pl-10 pr-9 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-900 dark:text-white placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500 transition-all ${className}`}
        />
        {hasQuery && (
          <button
            type="button"
            onClick={() => {
              setQuery('');
              setIsOpen(false);
              if (onChange) onChange({ target: { value: '', name: 'address' } });
            }}
            className="absolute right-3 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-0.5"
            tabIndex={-1}
            aria-label="Clear address"
          >
            <span className="text-sm leading-none">&times;</span>
          </button>
        )}
      </div>

      {/* Google-Style Dropdown Menu */}
      {isOpen && (
        <div className="absolute z-[9999] left-0 right-0 mt-1.5 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800 overflow-hidden max-h-72 sm:max-h-80 overflow-y-auto">
          {/* Header */}
          <div className="px-3.5 py-2 bg-slate-50/80 dark:bg-slate-950/60 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between text-[11px] font-bold text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <Navigation className="w-3 h-3 text-amber-500" />
              <span>Kanpur Nagar Location Directory</span>
            </span>
            <span>{suggestions.length > 0 ? `${suggestions.length} match${suggestions.length > 1 ? 'es' : ''}` : 'No exact match'}</span>
          </div>

          {/* Results List */}
          {suggestions.length > 0 ? (
            <div className="py-1 divide-y divide-slate-100/60 dark:divide-slate-800/40">
              {suggestions.map((item, index) => {
                const isSelected = highlightedIndex === index;
                const badge = getTypeBadge(item.type);

                // Build secondary line details
                const subDetails = [
                  item.block ? `Block: ${item.block}` : null,
                  item.tehsil ? `Tehsil: ${item.tehsil}` : null,
                  item.pincode ? `PIN: ${item.pincode}` : null,
                  !item.block && !item.tehsil ? 'Kanpur Nagar, UP' : null
                ].filter(Boolean).join(' • ');

                return (
                  <div
                    key={item.id || index}
                    role="button"
                    tabIndex={0}
                    onMouseDown={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(item);
                    }}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleSelect(item);
                    }}
                    onMouseEnter={() => setHighlightedIndex(index)}
                    className={`w-full px-3.5 py-2.5 sm:py-3 flex items-start gap-3 cursor-pointer transition-colors text-left select-none ${
                      isSelected 
                        ? 'bg-amber-500/10 dark:bg-amber-500/15' 
                        : 'hover:bg-slate-50 dark:hover:bg-slate-800/60'
                    }`}
                  >
                    {/* Google-style Pin Container */}
                    <div className={`mt-0.5 w-7 h-7 rounded-full flex items-center justify-center shrink-0 border ${
                      isSelected 
                        ? 'bg-amber-500 text-slate-950 border-amber-500' 
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}>
                      <MapPin className="w-3.5 h-3.5" />
                    </div>

                    {/* Location Information */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-xs font-bold text-slate-900 dark:text-white leading-tight">
                          {item.label || item.name}
                        </span>
                        {badge && (
                          <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full border ${badge.bg}`}>
                            {badge.text}
                          </span>
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 truncate">
                        {subDetails}
                      </p>
                    </div>

                    {isSelected && (
                      <Check className="w-4 h-4 text-amber-500 shrink-0 mt-1" />
                    )}
                  </div>
                );
              })}
            </div>
          ) : (
            /* Fallback: Location Not Found */
            <div className="p-4 text-center">
              <div className="w-10 h-10 mx-auto rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 mb-2">
                <MapPin className="w-5 h-5" />
              </div>
              <p className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Location not found in Kanpur directory
              </p>
              <p className="text-[11px] text-slate-400 mt-0.5 mb-3">
                You can still type and use your custom address manually.
              </p>
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUseManualAddress();
                }}
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  handleUseManualAddress();
                }}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-xs rounded-xl transition-all shadow-md"
              >
                <CornerDownLeft className="w-3.5 h-3.5" />
                <span>Use "{query}" manually</span>
              </button>
            </div>
          )}


          {/* Footer Guide */}
          <div className="px-3.5 py-1.5 bg-slate-50 dark:bg-slate-950/80 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-[10px] text-slate-400">
            <span>Official Kanpur Nagar Revenue Data</span>
            <span className="hidden sm:inline">Use ↑ ↓ and Enter to select</span>
          </div>
        </div>
      )}
    </div>
  );
};
