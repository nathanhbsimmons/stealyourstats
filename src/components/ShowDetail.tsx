'use client';

import React, { useState, useEffect } from 'react';
import { Show, ShowDetail as ShowDetailType } from '@/types';
import AudioPlayer from './AudioPlayer';

interface ShowDetailProps {
  show: Show;
  onBack: () => void;
}

export default function ShowDetail({ show, onBack }: ShowDetailProps) {
  const [showDetail, setShowDetail] = useState<ShowDetailType | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchShowDetail = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        const response = await fetch(`/api/shows/${show.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Show not found');
          }
          throw new Error(`Failed to fetch show details: ${response.statusText}`);
        }
        
        const data = await response.json();
        setShowDetail(data);
      } catch (err) {
        console.error('Error fetching show details:', err);
        setError(err instanceof Error ? err.message : 'Failed to load show details');
      } finally {
        setIsLoading(false);
      }
    };

    fetchShowDetail();
  }, [show.id]);

  const getEraLabel = (dateStr: string) => {
    const year = new Date(dateStr).getFullYear();
    if (year >= 1965 && year <= 1967) return 'Primal';
    if (year >= 1968 && year <= 1970) return 'Pigpen Peak';
    if (year >= 1971 && year <= 1972) return 'Europe \'72';
    if (year >= 1973 && year <= 1974) return 'Wall of Sound';
    if (year >= 1976 && year <= 1978) return 'Return + \'77';
    if (year >= 1979 && year <= 1986) return 'Brent (early)';
    if (year >= 1987 && year <= 1990) return 'Brent (late)';
    if (year >= 1991 && year <= 1995) return 'Vince';
    return 'Unknown Era';
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  if (isLoading) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-bold">LOADING SHOW DETAILS...</div>
        <div className="text-sm mt-2">Please wait while we fetch the data</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-bold text-red-600">ERROR LOADING SHOW</div>
        <div className="text-sm mt-2">{error}</div>
        <button
          onClick={onBack}
          className="btn-brutalist mt-4"
        >
          BACK TO SONG
        </button>
      </div>
    );
  }

  if (!showDetail) {
    return (
      <div className="text-center p-8">
        <div className="text-lg font-bold">SHOW NOT FOUND</div>
        <div className="text-sm mt-2">The requested show could not be loaded</div>
        <button
          onClick={onBack}
          className="btn-brutalist mt-4"
        >
          BACK TO SONG
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
        ← BACK TO SONG
      </button>

      {/* Show Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold uppercase">SHOW DETAILS</h1>
        <div className="text-lg mt-2">{formatDate(showDetail.show.date)}</div>
        {showDetail.venue && (
          <div className="text-lg mt-1">
            {showDetail.venue.name}
            {showDetail.venue.city && `, ${showDetail.venue.city}`}
            {showDetail.venue.state && `, ${showDetail.venue.state}`}
            {showDetail.venue.country && `, ${showDetail.venue.country}`}
          </div>
        )}
        <div className="text-sm mt-2">
          Era: {getEraLabel(showDetail.show.date)}
        </div>
      </div>

      {/* Show Statistics */}
      <div className="status-card">
        <div className="status-card-header">SHOW INFORMATION</div>
        <div className="status-row">
          <span className="status-label">DATE:</span>
          <span className="status-value">{formatDate(showDetail.show.date)}</span>
        </div>
        <div className="status-row">
          <span className="status-label">VENUE:</span>
          <span className="status-value">
            {showDetail.venue?.name || 'Unknown'}
            {showDetail.venue?.city && `, ${showDetail.venue.city}`}
          </span>
        </div>
        <div className="status-row">
          <span className="status-label">RECORDINGS:</span>
          <span className="status-value">{showDetail.recordings.length}</span>
        </div>
        <div className="status-row">
          <span className="status-label">SOURCE COUNT:</span>
          <span className="status-value">{showDetail.show.sourceCount}</span>
        </div>
      </div>

      {/* Setlist */}
      {showDetail.setlist.length > 0 && (
        <div className="status-card">
          <div className="status-card-header">SETLIST</div>
          <div className="panel-content">
            {showDetail.setlist.map((item, index) => (
              <div key={index} className="mb-2 p-2 border-2 border-black">
                <div className="flex justify-between items-center">
                  <div>
                    <span className="font-bold">
                      {item.setNumber === 1 ? 'Set 1' : 
                       item.setNumber === 2 ? 'Set 2' : 
                       item.setNumber === 3 ? 'Encore' : `Set ${item.setNumber}`}
                    </span>
                    <span className="ml-2">
                      {item.positionInSet}. {item.songTitle}
                    </span>
                    {item.isOpener && <span className="ml-2 text-xs">(OPENER)</span>}
                    {item.isCloser && <span className="ml-2 text-xs">(CLOSER)</span>}
                    {item.isEncore && <span className="ml-2 text-xs">(ENCORE)</span>}
                  </div>
                  {item.segueToSongTitle && (
                    <span className="text-sm">→ {item.segueToSongTitle}</span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Recordings */}
      {showDetail.recordings.length > 0 && (
        <div className="status-card">
          <div className="status-card-header">AVAILABLE RECORDINGS</div>
          <div className="panel-content">
            {showDetail.recordings.map((recording) => (
              <div key={recording.id} className="mb-4 p-3 border-2 border-black">
                <div className="grid grid-cols-2 gap-4 mb-2">
                  <div>
                    <span className="font-bold">Source:</span> {recording.sourceType || 'Unknown'}
                  </div>
                  <div>
                    <span className="font-bold">Format:</span> {recording.format || 'Unknown'}
                  </div>
                </div>
                
                <div className="mb-2">
                  <span className="font-bold">Tracks:</span>
                  <div className="mt-1">
                    {Object.entries(recording.trackMap).map(([trackName, archiveId]) => (
                      <div key={trackName} className="ml-4 text-sm">
                        {trackName}
                        {recording.durationMap[trackName] && (
                          <span className="ml-2 text-xs">
                            ({formatDuration(recording.durationMap[trackName])})
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="text-xs text-gray-600">
                  Archive ID: {recording.archiveIdentifier}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Era Context */}
      {showDetail.eraContext && (
        <div className="status-card">
          <div className="status-card-header">ERA CONTEXT</div>
          <div className="panel-content">
            <div className="mb-2">
              <span className="font-bold">{showDetail.eraContext.year}:</span> {showDetail.eraContext.label}
            </div>
            <div className="text-sm">
              {showDetail.eraContext.description}
            </div>
          </div>
        </div>
      )}

      {/* Audio Player */}
      <AudioPlayer
        trackName={`${showDetail.venue?.name || 'Unknown Venue'} - ${formatDate(showDetail.show.date)}`}
        showDate={showDetail.show.date}
        archiveIdentifier={showDetail.show.archiveItemIds?.[0]}
      />
    </div>
  );
}
