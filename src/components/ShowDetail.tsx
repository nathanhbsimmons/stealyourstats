'use client';

import React, { useState } from 'react';
import { Show, Venue, Recording } from '@/types';
import { mockVenues, mockRecordings, eraLabels } from '@/data/mockData';
import { DateTime } from 'luxon';
import AudioPlayer from './AudioPlayer';

interface ShowDetailProps {
  show: Show;
  onBack: () => void;
}

export default function ShowDetail({ show, onBack }: ShowDetailProps) {
  const [activeTab, setActiveTab] = useState<'info' | 'setlist' | 'recordings'>('info');
  const [selectedTrack, setSelectedTrack] = useState<string | null>(null);

  const venue = mockVenues.find(v => v.id === show.venueId);
  const recordings = mockRecordings.filter(r => r.showId === show.id);

  const getEraLabel = (dateStr: string) => {
    const year = DateTime.fromISO(dateStr).year.toString();
    return eraLabels.find(era => {
      const [start, end] = era.year.split('-').map(y => parseInt(y));
      const yearNum = parseInt(year);
      return yearNum >= start && yearNum <= (end || start);
    });
  };

  const formatDate = (dateStr: string) => {
    return DateTime.fromISO(dateStr).toFormat('EEEE, MMMM dd, yyyy');
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  // Mock setlist data
  const mockSetlist = [
    { setNumber: 1, positionInSet: 1, songTitle: 'Scarlet Begonias', segueToSongTitle: 'Fire on the Mountain' },
    { setNumber: 1, positionInSet: 2, songTitle: 'Fire on the Mountain' },
    { setNumber: 1, positionInSet: 3, songTitle: 'Dark Star' },
    { setNumber: 1, positionInSet: 4, songTitle: 'Truckin\'' },
    { setNumber: 2, positionInSet: 1, songTitle: 'Casey Jones' },
    { setNumber: 2, positionInSet: 2, songTitle: 'Scarlet Begonias' },
    { setNumber: 2, positionInSet: 3, songTitle: 'Fire on the Mountain' }
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <button
          onClick={onBack}
          className="btn-brutalist"
        >
          ← BACK
        </button>
        <h1>SHOW DETAILS</h1>
        <div></div>
      </div>

      {/* Show Info Header */}
      <div className="status-card">
        <div className="status-card-header">
          SHOW INFORMATION
        </div>
        <div className="p-4">
          <div className="text-center mb-4">
            <h2>{formatDate(show.date)}</h2>
            <div className="text-xl">{venue?.name}</div>
            <div className="text-lg">
              {venue?.city}, {venue?.state} {venue?.country}
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <div className="text-2xl font-bold">{show.sourceCount}</div>
              <div className="text-sm uppercase">RECORDINGS AVAILABLE</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{mockSetlist.length}</div>
              <div className="text-sm uppercase">SONGS PLAYED</div>
            </div>
          </div>

          {/* Era Context */}
          <div className="mt-4 p-4 border-2 border-black">
            <div className="font-bold text-lg mb-2">
              {DateTime.fromISO(show.date).year} - {getEraLabel(show.date)?.label}
            </div>
            <div>{getEraLabel(show.date)?.description}</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b-0">
        <button
          onClick={() => setActiveTab('info')}
          className={`tab-brutalist ${
            activeTab === 'info' ? 'active' : ''
          }`}
        >
          INFO
        </button>
        <button
          onClick={() => setActiveTab('setlist')}
          className={`tab-brutalist ${
            activeTab === 'setlist' ? 'active' : ''
          }`}
        >
          SETLIST
        </button>
        <button
          onClick={() => setActiveTab('recordings')}
          className={`tab-brutalist ${
            activeTab === 'recordings' ? 'active' : ''
          }`}
        >
          RECORDINGS
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'info' && (
        <div className="space-y-4">
          <div className="status-card">
            <div className="status-card-header">
              VENUE DETAILS
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="status-label">VENUE NAME</div>
                  <div>{venue?.name}</div>
                </div>
                <div>
                  <div className="status-label">CITY</div>
                  <div>{venue?.city}</div>
                </div>
                <div>
                  <div className="status-label">STATE</div>
                  <div>{venue?.state}</div>
                </div>
                <div>
                  <div className="status-label">COUNTRY</div>
                  <div>{venue?.country}</div>
                </div>
              </div>
            </div>
          </div>

          <div className="status-card">
            <div className="status-card-header">
              SHOW METADATA
            </div>
            <div className="p-4">
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <div className="status-label">SHOW DATE</div>
                  <div>{formatDate(show.date)}</div>
                </div>
                <div>
                  <div className="status-label">RECORDINGS</div>
                  <div>{show.sourceCount} sources available</div>
                </div>
                <div>
                  <div className="status-label">ARCHIVE ID</div>
                  <div>{show.archiveItemIds.join(', ')}</div>
                </div>
                <div>
                  <div className="status-label">ERA</div>
                  <div>{getEraLabel(show.date)?.label}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'setlist' && (
        <div className="space-y-4">
          <div className="panel-brutalist">
            <div className="panel-header">
              COMPLETE SETLIST
            </div>
            <div className="panel-content">
              {mockSetlist.map((item, index) => (
                <div key={index} className="list-item">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-8">
                      <div className="w-16 text-center">
                        <div className="font-bold text-sm uppercase">SET {item.setNumber}</div>
                        <div className="text-xs">#{item.positionInSet}</div>
                      </div>
                      <div>
                        <div className="list-item-title">{item.songTitle}</div>
                        {item.segueToSongTitle && (
                          <div className="list-item-meta">
                            → {item.segueToSongTitle}
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm">
                        {item.positionInSet === 1 && item.setNumber === 1 && 'OPENER'}
                        {item.positionInSet === mockSetlist.filter(s => s.setNumber === item.setNumber).length && 'CLOSER'}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'recordings' && (
        <div className="space-y-4">
          {recordings.map((recording) => (
            <div key={recording.id} className="panel-brutalist">
              <div className="panel-header">
                {recording.sourceType} RECORDING - {recording.format}
              </div>
              <div className="panel-content">
                <div className="mb-4">
                  <div className="status-label mb-2">AVAILABLE TRACKS:</div>
                  <div className="space-y-2">
                    {Object.entries(recording.trackMap).map(([trackName, archiveId]) => (
                      <div key={trackName} className="flex items-center justify-between p-2 border-2 border-black">
                        <div>
                          <div className="font-bold">{trackName}</div>
                          <div className="text-sm">
                            Duration: {formatDuration(recording.durationMap[trackName] || 0)}
                          </div>
                        </div>
                        <button
                          onClick={() => setSelectedTrack(trackName)}
                          className="btn-brutalist"
                        >
                          PLAY
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {selectedTrack && (
                  <div className="border-t-2 border-black pt-4">
                    <div className="status-label mb-2">NOW PLAYING: {selectedTrack}</div>
                    <AudioPlayer
                      trackName={selectedTrack}
                      duration={recording.durationMap[selectedTrack]}
                    />
                  </div>
                )}
              </div>
            </div>
          ))}

          {recordings.length === 0 && (
            <div className="panel-brutalist">
              <div className="panel-header">
                NO RECORDINGS
              </div>
              <div className="panel-content text-center">
                <div className="text-lg font-bold mb-2">No recordings available</div>
                <p>This show doesn't have any recordings in the archive yet.</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
