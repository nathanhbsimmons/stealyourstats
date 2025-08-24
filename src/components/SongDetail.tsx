'use client';

import React, { useState, useEffect } from 'react';
import { Song, SongDetail as SongDetailType, Show } from '@/types';
import AudioPlayer from './AudioPlayer';

interface SongDetailProps {
  song: Song;
  onBack: () => void;
  onShowSelect: (show: Show) => void;
}

export default function SongDetail({ song, onBack, onShowSelect }: SongDetailProps) {
  const [songDetail, setSongDetail] = useState<SongDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchSongDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/songs/${song.slug}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Song not found');
          }
          throw new Error(`Failed to fetch song details: ${response.statusText}`);
        }
        
        const data = await response.json();
        setSongDetail(data);
      } catch (err) {
        console.error('Error fetching song details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load song details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchSongDetail();
  }, [song.slug]);

  const getEraLabel = (year: string) => {
    const yearNum = parseInt(year);
    if (yearNum >= 1965 && yearNum <= 1967) return 'Primal';
    if (yearNum >= 1968 && yearNum <= 1970) return 'Pigpen Peak';
    if (yearNum >= 1971 && yearNum <= 1972) return 'Europe \'72';
    if (yearNum >= 1973 && yearNum <= 1974) return 'Wall of Sound';
    if (yearNum >= 1976 && yearNum <= 1978) return 'Return + \'77';
    if (yearNum >= 1979 && yearNum <= 1986) return 'Brent (early)';
    if (yearNum >= 1987 && yearNum <= 1990) return 'Brent (late)';
    if (yearNum >= 1991 && yearNum <= 1995) return 'Vince';
    return 'Unknown Era';
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-bold">LOADING SONG DETAILS...</div>
        <div className="text-sm mt-2">Please wait while we fetch the data</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-bold text-red-600">ERROR LOADING SONG</div>
        <div className="text-sm mt-2">{error}</div>
        <button
          onClick={onBack}
          className="btn-brutalist mt-4"
        >
          BACK TO SEARCH
        </button>
      </div>
    );
  }

  if (!songDetail) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-bold">SONG NOT FOUND</div>
        <div className="text-sm mt-2">The requested song could not be loaded</div>
        <button
          onClick={onBack}
          className="btn-brutalist mt-4"
        >
          BACK TO SEARCH
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={onBack}
        className="btn-brutalist"
      >
        ← BACK TO SEARCH
      </button>

      {/* Song Title */}
      <div className="text-center">
        <h1 className="text-4xl font-bold uppercase">{song.title}</h1>
        {song.altTitles && song.altTitles.length > 1 && (
          <p className="text-sm mt-2">
            Also known as: {song.altTitles.filter(t => t !== song.title).join(', ')}
          </p>
        )}
        {song.altTitles && song.altTitles.length === 1 && song.altTitles[0] !== song.title && (
          <p className="text-sm mt-2">
            Also known as: {song.altTitles[0]}
          </p>
        )}
      </div>

      {/* Song Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Debut Show */}
        {songDetail.debutShow && (
          <div className="status-card">
            <div className="status-card-header">DEBUT SHOW</div>
            <div className="status-row">
              <span className="status-label">DATE:</span>
              <span className="status-value">{formatDate(songDetail.debutShow.date)}</span>
            </div>
            <div className="status-row">
              <span className="status-label">VENUE:</span>
              <span className="status-value">
                {songDetail.debutShow.venue?.name || 'Unknown'}
                {songDetail.debutShow.venue?.city && `, ${songDetail.debutShow.venue.city}`}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">ERA:</span>
              <span className="status-value">{getEraLabel(new Date(songDetail.debutShow.date).getFullYear().toString())}</span>
            </div>
          </div>
        )}

        {/* Last Show */}
        {songDetail.lastShow && (
          <div className="status-card">
            <div className="status-card-header">LAST SHOW</div>
            <div className="status-row">
              <span className="status-label">DATE:</span>
              <span className="status-value">{formatDate(songDetail.lastShow.date)}</span>
            </div>
            <div className="status-row">
              <span className="status-label">VENUE:</span>
              <span className="status-value">
                {songDetail.lastShow.venue?.name || 'Unknown'}
                {songDetail.lastShow.venue?.city && `, ${songDetail.lastShow.venue.city}`}
              </span>
            </div>
            <div className="status-row">
              <span className="status-label">ERA:</span>
              <span className="status-value">{getEraLabel(new Date(songDetail.lastShow.date).getFullYear().toString())}</span>
            </div>
          </div>
        )}
      </div>

      {/* Performance Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Longest Performance */}
        {songDetail.longest && (
          <div className="status-card">
            <div className="status-card-header">LONGEST PERFORMANCE</div>
            <div className="status-row">
              <span className="status-label">DURATION:</span>
              <span className="status-value">{formatDuration(songDetail.longest.durationMs)}</span>
            </div>
            <div className="status-row">
              <span className="status-label">DATE:</span>
              <span className="status-value">{formatDate(songDetail.longest.show.date)}</span>
            </div>
            <div className="status-row">
              <span className="status-label">VENUE:</span>
              <span className="status-value">
                {songDetail.longest.show.venue?.name || 'Unknown'}
                {songDetail.longest.show.venue?.city && `, ${songDetail.longest.show.venue.city}`}
              </span>
            </div>
          </div>
        )}

        {/* Shortest Performance */}
        {songDetail.shortest && (
          <div className="status-card">
            <div className="status-card-header">SHORTEST PERFORMANCE</div>
            <div className="status-row">
              <span className="status-label">DURATION:</span>
              <span className="status-value">{formatDuration(songDetail.shortest.durationMs)}</span>
            </div>
            <div className="status-row">
              <span className="status-label">DATE:</span>
              <span className="status-value">{formatDate(songDetail.shortest.show.date)}</span>
            </div>
            <div className="status-row">
              <span className="status-label">VENUE:</span>
              <span className="status-value">
                {songDetail.shortest.show.venue?.name || 'Unknown'}
                {songDetail.shortest.show.venue?.city && `, ${songDetail.shortest.show.venue.city}`}
              </span>
            </div>
          </div>
        )}
      </div>

      {/* BPM Statistics */}
      {(songDetail.highestBpm || songDetail.lowestBpm) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Highest BPM */}
          {songDetail.highestBpm && (
            <div className="status-card">
              <div className="status-card-header">HIGHEST BPM</div>
              <div className="status-row">
                <span className="status-label">BPM:</span>
                <span className="status-value">{songDetail.highestBpm.bpm.toFixed(1)}</span>
              </div>
              <div className="status-row">
                <span className="status-label">CONFIDENCE:</span>
                <span className="status-value">{(songDetail.highestBpm.bpmConfidence * 100).toFixed(1)}%</span>
              </div>
              <div className="status-row">
                <span className="status-label">DATE:</span>
                <span className="status-value">{formatDate(songDetail.highestBpm.show.date)}</span>
              </div>
            </div>
          )}

          {/* Lowest BPM */}
          {songDetail.lowestBpm && (
            <div className="status-card">
              <div className="status-card-header">LOWEST BPM</div>
              <div className="status-row">
                <span className="status-label">BPM:</span>
                <span className="status-value">{songDetail.lowestBpm.bpm.toFixed(1)}</span>
              </div>
              <div className="status-row">
                <span className="status-label">CONFIDENCE:</span>
                <span className="status-value">{(songDetail.lowestBpm.bpmConfidence * 100).toFixed(1)}%</span>
              </div>
              <div className="status-row">
                <span className="status-label">DATE:</span>
                <span className="status-value">{formatDate(songDetail.lowestBpm.show.date)}</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Performance Counts */}
      <div className="status-card">
        <div className="status-card-header">PERFORMANCE STATISTICS</div>
        <div className="status-row">
          <span className="status-label">TOTAL PERFORMANCES:</span>
          <span className="status-value font-bold text-lg">{songDetail.counts.total || songDetail.shows?.length || 0}</span>
        </div>
        <div className="status-row">
          <span className="status-label">OPENERS:</span>
          <span className="status-value">{songDetail.counts.openers}</span>
        </div>
        <div className="status-row">
          <span className="status-label">CLOSERS:</span>
          <span className="status-value">{songDetail.counts.closers}</span>
        </div>
        <div className="status-row">
          <span className="status-label">ENCORES:</span>
          <span className="status-value">{songDetail.counts.encores}</span>
        </div>
      </div>

      {/* Average Duration by Year Chart */}
      {Object.keys(songDetail.sampling.avgDurationByYear).length > 0 && (
        <div className="status-card">
          <div className="status-card-header">AVERAGE DURATION BY YEAR</div>
          <div className="panel-content">
            <div className="ascii-chart">
              {Object.entries(songDetail.sampling.avgDurationByYear)
                .sort(([a], [b]) => parseInt(a) - parseInt(b))
                .map(([year, duration]) => (
                  <div key={year} className="mb-2">
                    <div className="flex justify-between mb-1">
                      <span className="text-sm font-bold">{year}:</span>
                      <span className="text-sm">{formatDuration(duration)}</span>
                    </div>
                    <div className="ascii-bar" style={{ width: `${Math.min((duration / 600000) * 100, 100)}%` }}>
                      {'█'.repeat(Math.floor((duration / 600000) * 20))}
                    </div>
                  </div>
                ))}
            </div>
          </div>
        </div>
      )}

      {/* Era Hints */}
      {songDetail.eraHints.length > 0 && (
        <div className="status-card">
          <div className="status-card-header">ERA CONTEXT</div>
          <div className="panel-content">
            {songDetail.eraHints.map((hint, index) => (
              <div key={index} className="mb-2">
                <span className="font-bold">{hint.year}:</span> {hint.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Complete Show Collection */}
      {songDetail.shows && songDetail.shows.length > 0 && (
        <div className="status-card">
          <div className="status-card-header">COMPLETE PERFORMANCE HISTORY ({songDetail.shows.length} shows)</div>
          <div className="panel-content">
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {songDetail.shows.map((show, index) => (
                <div key={show.id} className="border-b border-gray-200 pb-2 last:border-b-0">
                  <div className="flex justify-between items-start">
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {formatDate(show.date)}
                      </div>
                      <div className="text-xs text-gray-600">
                        {show.venue?.name || 'Unknown Venue'}
                        {show.venue?.city && `, ${show.venue.city}`}
                      </div>
                    </div>
                    <div className="text-xs text-gray-500 ml-2">
                      #{index + 1}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Audio Player */}
      <AudioPlayer
        trackName={song.title}
        duration={songDetail.longest?.durationMs}
        showDate={songDetail.shows[0]?.date}
        archiveIdentifier={songDetail.shows[0]?.id}
      />
    </div>
  );
}
