'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { classNames } from '@/lib/utils';

interface AddressSearchProps {
  onSelect: (address: string) => void;
  placeholder?: string;
  className?: string;
}

interface Suggestion {
  id: string;
  description: string;
  mainText: string;
  secondaryText: string;
  placeId: string | null;
}

export default function AddressSearch({
  onSelect,
  placeholder = 'Enter a property address...',
  className,
}: AddressSearchProps) {
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch suggestions from our API (which calls Google Places or Census fallback)
  const fetchSuggestions = useCallback(async (value: string) => {
    if (value.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      setLoading(false);
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`/api/autocomplete?input=${encodeURIComponent(value)}`);
      const data = await res.json();

      if (data.suggestions && data.suggestions.length > 0) {
        setSuggestions(data.suggestions);
        setShowSuggestions(true);
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    } catch (error) {
      console.error('Autocomplete fetch error:', error);
      setSuggestions([]);
      setShowSuggestions(false);
    } finally {
      setLoading(false);
    }
    setActiveIndex(-1);
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    // Debounce API calls - wait 300ms after user stops typing
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }
    debounceRef.current = setTimeout(() => {
      fetchSuggestions(value);
    }, 300);
  };

  const handleSelect = (suggestion: Suggestion) => {
    setQuery(suggestion.description);
    setShowSuggestions(false);
    setSuggestions([]);
    onSelect(suggestion.description);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && !showSuggestions && query.length >= 5) {
      // Allow direct submission if no suggestions showing (free-form address)
      e.preventDefault();
      onSelect(query);
      return;
    }

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
        } else if (query.length >= 5) {
          // Submit whatever is typed
          setShowSuggestions(false);
          onSelect(query);
        }
        break;
      case 'Escape':
        setShowSuggestions(false);
        break;
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div ref={containerRef} className={classNames('relative w-full max-w-2xl', className)}>
      {/* Search input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none">
          {loading ? (
            <Loader2 className="w-5 h-5 text-gold-400 animate-spin" />
          ) : (
            <Search className="w-5 h-5 text-gray-400" />
          )}
        </div>
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          onFocus={() => query.length >= 3 && suggestions.length > 0 && setShowSuggestions(true)}
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
      {showSuggestions && suggestions.length > 0 && (
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
                <p className="text-sm font-medium text-navy-900">{suggestion.mainText}</p>
                {suggestion.secondaryText && (
                  <p className="text-xs text-gray-500">{suggestion.secondaryText}</p>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* No results message */}
      {showSuggestions && suggestions.length === 0 && !loading && query.length >= 3 && (
        <div className="absolute z-20 w-full mt-2 bg-white rounded-2xl shadow-xl shadow-navy-900/10 border border-gray-100 px-5 py-4">
          <p className="text-sm text-gray-500">
            No matching addresses found. Try entering a full street address with city and state.
          </p>
        </div>
      )}
    </div>
  );
}
