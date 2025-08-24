'use client';

import React, { useState } from 'react';
import { Song } from '@/types';

interface SearchProps {
  onSongSelect: (song: Song) => void;
}

interface SearchResult {
  songs: Song[];
  source: 'database' | 'external';
}

export default function Search({ onSongSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchSource, setSearchSource] = useState<'database' | 'external' | null>(null);
  const [hasSearched, setHasSearched] = useState(false);

  const handleSearch = async () => {
    if (!query.trim()) {
      setResults([]);
      setSearchSource(null);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    setError(null);
    setHasSearched(true);

    try {
      const response = await fetch(`/api/songs?q=${encodeURIComponent(query)}&limit=20`);
      
      if (!response.ok) {
        throw new Error(`Search failed: ${response.statusText}`);
      }

      const data: SearchResult = await response.json();
      setResults(data.songs || []);
      setSearchSource(data.source);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSongClick = (song: Song) => {
    onSongSelect(song);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuery(e.target.value);
  };

  const handleKeyPress = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleSearch();
    }
  };

  const clearSearch = () => {
    setQuery('');
    setResults([]);
    setError(null);
    setSearchSource(null);
    setHasSearched(false);
  };

  return (
    <div className="search-bar">
      <div className="search-label">SEARCH FOR A SONG</div>
      
      <div className="mb-4 flex gap-2">
        <input
          type="text"
          value={query}
          onChange={handleInputChange}
          onKeyPress={handleKeyPress}
          placeholder="Type a song title..."
          className="input-brutalist flex-1"
          disabled={isLoading}
        />
        
        <button
          onClick={handleSearch}
          className="btn-brutalist"
          disabled={isLoading || !query.trim()}
        >
          {isLoading ? 'SEARCHING...' : 'SEARCH'}
        </button>
        
        {query && (
          <button
            onClick={clearSearch}
            className="btn-brutalist"
          >
            CLEAR
          </button>
        )}
      </div>

      {/* Search Status */}
      {isLoading && (
        <div className="mb-4 p-2 border-2 border-black text-center">
          <div className="text-sm">SEARCHING...</div>
        </div>
      )}

      {error && (
        <div className="mb-4 p-2 border-2 border-black bg-red-50 text-center">
          <div className="text-sm font-bold">ERROR: {error}</div>
        </div>
      )}

      {/* Search Results */}
      {results.length > 0 && (
        <div className="mb-4">
          <div className="panel-header">
            SEARCH RESULTS ({results.length}) - Source: {searchSource?.toUpperCase()}
          </div>
          <div className="panel-content">
            {results.map((song) => (
              <div
                key={song.id}
                className="list-item"
                onClick={() => handleSongClick(song)}
              >
                <div className="list-item-title">{song.title}</div>
                <div className="list-item-meta">
                  ID: {song.id} | Slug: {song.slug}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Results */}
      {hasSearched && !isLoading && !error && results.length === 0 && (
        <div className="mb-4 p-2 border-2 border-black text-center">
          <div className="text-sm">No songs found matching "{query}"</div>
          <div className="text-xs mt-1">Try a different search term</div>
        </div>
      )}

      {/* Quick Links */}
      {!hasSearched && results.length === 0 && (
        <div className="quick-links-grid">
          <div
            className="quick-link-item"
            onClick={() => onSongSelect({
              id: 'scarlet-begonias',
              artistId: 'grateful-dead',
              title: 'Scarlet Begonias',
              altTitles: ['Scarlet Begonias', 'Scarlet'],
              slug: 'scarlet-begonias'
            })}
          >
            <div className="font-bold">SCARLET BEGONIAS</div>
            <div className="text-sm">Click to view details</div>
          </div>
          
          <div
            className="quick-link-item"
            onClick={() => onSongSelect({
              id: 'fire-on-the-mountain',
              artistId: 'grateful-dead',
              title: 'Fire on the Mountain',
              altTitles: ['Fire on the Mountain', 'Fire'],
              slug: 'fire-on-the-mountain'
            })}
          >
            <div className="font-bold">FIRE ON THE MOUNTAIN</div>
            <div className="text-sm">Click to view details</div>
          </div>
          
          <div
            className="quick-link-item"
            onClick={() => onSongSelect({
              id: 'truckin',
              artistId: 'grateful-dead',
              title: 'Truckin\'',
              altTitles: ['Truckin\'', 'Truckin'],
              slug: 'truckin'
            })}
          >
            <div className="font-bold">TRUCKIN'</div>
            <div className="text-sm">Click to view details</div>
          </div>
        </div>
      )}
    </div>
  );
}
