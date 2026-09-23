import React, { useState, useEffect, useRef } from 'react';
import { ArrowLeft, Search, X, History, TrendingUp, Link as LinkIcon } from 'lucide-react';
import { ApiService, extractYouTubeId } from '../services/api';

interface Props {
  onSearch: (query: string) => void;
  onClose: () => void;
  initialQuery?: string;
}

const SEARCH_HISTORY_KEY = 'ytlite_search_history';

export const SearchBar: React.FC<Props> = ({ onSearch, onClose, initialQuery = '' }) => {
  const [query, setQuery] = useState(initialQuery);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    try {
      const stored = localStorage.getItem(SEARCH_HISTORY_KEY);
      if (stored) setSearchHistory(JSON.parse(stored));
    } catch {
      // ignore
    }
  }, []);

  // Fetch suggestions with debounce
  useEffect(() => {
    if (query.trim().length < 2) {
      setSuggestions([]);
      return;
    }

    const timer = setTimeout(async () => {
      const results = await ApiService.getSuggestions(query);
      setSuggestions(results);
    }, 200);

    return () => clearTimeout(timer);
  }, [query]);

  const handleSubmit = (q: string) => {
    const clean = q.trim();
    if (!clean) return;

    // Save to history
    try {
      const updated = [clean, ...searchHistory.filter((item) => item !== clean)].slice(0, 10);
      setSearchHistory(updated);
      localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
    } catch {
      // ignore
    }

    onSearch(clean);
  };

  const directId = extractYouTubeId(query);

  const clearHistoryItem = (e: React.MouseEvent, item: string) => {
    e.stopPropagation();
    const updated = searchHistory.filter((h) => h !== item);
    setSearchHistory(updated);
    localStorage.setItem(SEARCH_HISTORY_KEY, JSON.stringify(updated));
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#0f0f0f] text-white flex flex-col">
      {/* Search Input Bar */}
      <div className="flex items-center gap-2 px-3 py-2.5 bg-zinc-900 border-b border-zinc-800">
        <button
          onClick={onClose}
          className="p-2 text-zinc-300 hover:text-white rounded-full active:bg-zinc-800"
          aria-label="Back"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>

        <div className="flex-1 flex items-center bg-zinc-800/90 rounded-full px-3.5 py-1.5 border border-zinc-700/60 focus-within:border-red-500">
          <input
            ref={inputRef}
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter') handleSubmit(query);
            }}
            placeholder="Search YouTube or paste URL..."
            className="w-full bg-transparent text-sm text-white placeholder-zinc-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-zinc-400 hover:text-white"
              aria-label="Clear"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <button
          onClick={() => handleSubmit(query)}
          className="p-2 bg-red-600 hover:bg-red-700 text-white rounded-full active:scale-95 transition"
          aria-label="Submit search"
        >
          <Search className="w-4 h-4" />
        </button>
      </div>

      {/* Direct YouTube link detection prompt */}
      {directId && (
        <div
          onClick={() => handleSubmit(query)}
          className="m-3 p-3 bg-red-950/60 border border-red-800/80 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-red-900/40 active:scale-[0.99] transition"
        >
          <div className="p-2 rounded-lg bg-red-600 text-white">
            <LinkIcon className="w-5 h-5" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-red-300">Direct YouTube Video Detected</div>
            <div className="text-[11px] text-zinc-300 truncate">Video ID: {directId} • Tap to play in Lite mode</div>
          </div>
        </div>
      )}

      {/* Autocomplete Suggestions or History */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-800/40">
        {suggestions.length > 0 ? (
          <div>
            <div className="px-4 py-2 text-[11px] font-semibold uppercase text-zinc-400">Suggestions</div>
            {suggestions.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSubmit(item)}
                className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-800/60 active:bg-zinc-800 cursor-pointer text-sm"
              >
                <Search className="w-4 h-4 text-zinc-400" />
                <span className="flex-1 truncate">{item}</span>
              </div>
            ))}
          </div>
        ) : searchHistory.length > 0 ? (
          <div>
            <div className="flex items-center justify-between px-4 py-2 text-[11px] font-semibold uppercase text-zinc-400">
              <span>Recent Searches</span>
            </div>
            {searchHistory.map((item, idx) => (
              <div
                key={idx}
                onClick={() => handleSubmit(item)}
                className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800/60 active:bg-zinc-800 cursor-pointer text-sm"
              >
                <div className="flex items-center gap-3 min-w-0 flex-1">
                  <History className="w-4 h-4 text-zinc-400" />
                  <span className="truncate text-zinc-200">{item}</span>
                </div>
                <button
                  onClick={(e) => clearHistoryItem(e, item)}
                  className="p-1 text-zinc-500 hover:text-zinc-300"
                  aria-label="Remove search"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-6 text-center text-zinc-500 text-xs">
            <TrendingUp className="w-8 h-8 mx-auto mb-2 text-zinc-600" />
            <p>Type keywords to search YouTube videos, channels, or paste any YouTube video link directly.</p>
          </div>
        )}
      </div>
    </div>
  );
};
