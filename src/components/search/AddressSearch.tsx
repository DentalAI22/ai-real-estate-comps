'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface AddressSearchProps {
  onSelect: (address: string) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  id: string;
  address: string;
  city: string;
  state: string;
  zip: string;
}

const MOCK_SUGGESTIONS: Suggestion[] = [
  { id: '1', address: '123 Oak Street', city: 'Los Angeles', state: 'CA', zip: '90012' },
  { id: '2', address: '456 Elm Avenue', city: 'Beverly Hills', state: 'CA', zip: '90210' },
  { id: '3', address: '789 Maple Drive', city: 'Santa Monica', state: 'CA', zip: '90401' },
  { id: '4', address: '321 Pine Lane', city: 'Pasadena', state: 'CA', zip: '91101' },
  { id: '5', address: '654 Cedar Court', city: 'Burbank', state: 'CA', zip: '91502' },
  { id: '6', address: '987 Birch Road', city: 'Glendale', state: 'CA', zip: '91201' },
  { id: '7', address: '147 Walnut Street', city: 'Irvine', state: 'CA', zip: '92614' },
  { id: '8', address: '258 Spruce Boulevard', city: 'San Diego', state: 'CA', zip: '92101' },
];

export default function AddressSearch({
  onSelect,
  placeholder = 'Enter any US address to get started',
  className,
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const filterSuggestions = useCallback((value: string) => {
    if (value.length < 2) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }
    const lower = value.toLowerCase();
    const filtered = MOCK_SUGGESTIONS.filter(
      (s) =>
        s.address.toLowerCase().includes(lower) ||
        s.city.toLowerCase().includes(lower) ||
        s.zip.includes(lower)
    ).slice(0, 5);
    setSuggestions(filtered);
    setShowSuggestions(filtered.length > 0);
    setActiveIndex(-1);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);
    filterSuggestions(value);
  };

  const handleSelect = (suggestion: Suggestion) => {
    const fullAddress = `${suggestion.address}, ${suggestion.city}, ${suggestion.state} ${suggestion.zip}`;
    setQuery(fullAddress);
    setShowSuggestions(false);
    onSelect(fullAddress);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!showSuggestions) return;

    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault();
        setActiveIndex((prev) => Math.min(prev + 1, suggestions.length - 1));
        break;
      case 'ArrowUp':
        e.preventDefault();
        setActiveIndex((prev) => Math.max(prev - 1, -1));
        break;
      case 'Enter':
        e.preventDefault();
        if (activeIndex >= 0 && activeIndex < suggestions.length) {
          handleSelect(suggestions[activeIndex]);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className={classNames('relative w-full max-w-2xl', className)}>
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          <Search className="w-5 h-5 text-gray-400" />
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 2 && suggestions.length > 0 && setShowSuggestions(true)}
          placeholder={placeholder}
          className="w-full pl-14 pr-6 py-4 lg:py-5 text-base lg:text-lg text-navy-900 bg-white border-0 rounded-full shadow-lg shadow-navy-900/10 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-gold-400/30 transition-shadow duration-200"
          role="combobox"
          aria-expanded={showSuggestions}
          aria-autocomplete="list"
          aria-controls="address-suggestions"
          aria-activedescendant={activeIndex >= 0 ? `suggestion-${activeIndex}` : undefined}
          autoComplete="off"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && (
        <ul
          id="address-suggestions"
          className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-xl shadow-navy-900/10 border border-gray-100 overflow-hidden"
          role="listbox"
        >
          {suggestions.map((suggestion, index) => (
            <li
              key={suggestion.id}
              id={`suggestion-${index}`}
              role="option"
              aria-selected={index === activeIndex}
              className={classNames(
                'flex items-center space-x-3 px-5 py-3.5 cursor-pointer transition-colors duration-150',
                index === activeIndex ? 'bg-navy-50' : 'hover:bg-gray-50'
              )}
              onClick={() => handleSelect(suggestion)}
              onMouseEnter={() => setActiveIndex(index)}
            >
              <MapPin className="w-4 h-4 text-gold-400 flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-navy-900">{suggestion.address}</p>
                <p className="text-xs text-gray-500">
                  {suggestion.city}, {suggestion.state} {suggestion.zip}
                </p>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
