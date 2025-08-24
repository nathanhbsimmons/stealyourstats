'use client';

import React, { useState, useEffect } from 'react';
import Fuse from 'fuse.js';
import { Song } from '@/types';
import { mockSongs } from '@/data/mockData';

interface SearchProps {
  onSongSelect: (song: Song) => void;
}

export default function Search({ onSongSelect }: SearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Song[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  // Initialize Fuse.js for fuzzy search
  const fuse = new Fuse(mockSongs, {
    keys: ['title', 'altTitles'],
    threshold: 0.3,
    includeScore: true
  });

  useEffect(() => {
    const timeoutId = setTimeout(() => {
      if (query.trim()) {
        setIsSearching(true);
        const searchResults = fuse.search(query);
        setResults(searchResults.slice(0, 10).map(result => result.item));
        setIsSearching(false);
      } else {
        setResults([]);
      }
    }, 250); // Debounce as specified in requirements

    return () => clearTimeout(timeoutId);
  }, [query]);

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1>STEAL YOUR STATS</h1>
        <p>A Grateful Dead Song Lookup Tool</p>
      </div>

      {/* Search Input */}
      <div className="max-w-2xl mx-auto">
        <div className="search-bar">
          <label className="search-label">SEARCH FOR A SONG</label>
          <div className="relative">
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search for a song..."
              className="input-brutalist"
            />
          </div>
        </div>
      </div>

      {/* Search Results */}
      {isSearching && (
        <div className="text-center">
          <div className="inline-block">Searching...</div>
        </div>
      )}

      {results.length > 0 && (
        <div className="max-w-2xl mx-auto">
          <div className="panel-brutalist">
            <div className="panel-header">
              SEARCH RESULTS
            </div>
            <div className="panel-content">
              {results.map((song) => (
                <div
                  key={song.id}
                  onClick={() => onSongSelect(song)}
                  className="list-item"
                >
                  <div className="list-item-title">{song.title}</div>
                  {song.altTitles.length > 1 && (
                    <div className="list-item-meta">
                      Also known as: {song.altTitles.filter(t => t !== song.title).join(', ')}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {query && !isSearching && results.length === 0 && (
        <div className="text-center max-w-2xl mx-auto">
          <div className="panel-brutalist">
            <div className="panel-header">
              NO RESULTS
            </div>
            <div className="panel-content">
              <div className="mb-4">No songs found</div>
              <p>Try searching for a different song title or check the spelling.</p>
              <p className="mt-4">Popular songs: Scarlet Begonias, Dark Star, Truckin', Casey Jones</p>
            </div>
          </div>
        </div>
      )}

      {/* Quick Links */}
      {!query && (
        <div className="max-w-4xl mx-auto">
          <div className="panel-brutalist">
            <div className="panel-header">
              QUICK LINKS
            </div>
            <div className="panel-content">
              <div className="quick-links-grid">
                {mockSongs.slice(0, 4).map((song) => (
                  <div
                    key={song.id}
                    onClick={() => onSongSelect(song)}
                    className="quick-link-item"
                  >
                    <div className="font-bold">{song.title}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
