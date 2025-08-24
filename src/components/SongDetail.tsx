'use client';

import React, { useState } from 'react';
import { Song, Show, Venue, Performance, Recording } from '@/types';
import { mockShows, mockVenues, mockPerformances, mockRecordings, eraLabels } from '@/data/mockData';
import { DateTime } from 'luxon';

interface SongDetailProps {
  song: Song;
  onBack: () => void;
  onShowSelect: (show: Show) => void;
}

export default function SongDetail({ song, onBack, onShowSelect }: SongDetailProps) {
  const [activeTab, setActiveTab] = useState<'summary' | 'performances'>('summary');

  // Mock data - in real app this would come from API
  const mockSongDetail = {
    debutShow: mockShows[0],
    lastShow: mockShows[mockShows.length - 1],
    longest: {
      durationMs: 510000, // 8.5 minutes
      show: mockShows[1],
      ...mockPerformances[3]
    },
    shortest: {
      durationMs: 420000, // 7 minutes
      show: mockShows[0],
      ...mockPerformances[0]
    },
    counts: {
      openers: 1,
      closers: 0,
      encores: 0
    },
    avgDurationByYear: {
      '1969': 420000,
      '1977': 510000
    }
  };

  const getEraLabel = (year: string) => {
    return eraLabels.find(era => {
      const [start, end] = era.year.split('-').map(y => parseInt(y));
      const yearNum = parseInt(year);
      return yearNum >= start && yearNum <= (end || start);
    });
  };

  const formatDuration = (ms: number) => {
    const minutes = Math.floor(ms / 60000);
    const seconds = Math.floor((ms % 60000) / 1000);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const formatDate = (dateStr: string) => {
    return DateTime.fromISO(dateStr).toFormat('MMM dd, yyyy');
  };

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
        <h1>{song.title.toUpperCase()}</h1>
        <div></div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b-0">
        <button
          onClick={() => setActiveTab('summary')}
          className={`tab-brutalist ${
            activeTab === 'summary' ? 'active' : ''
          }`}
        >
          SUMMARY
        </button>
        <button
          onClick={() => setActiveTab('performances')}
          className={`tab-brutalist ${
            activeTab === 'performances' ? 'active' : ''
          }`}
        >
          PERFORMANCES
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'summary' && (
        <div className="space-y-8">
          {/* Key Stats */}
          <div className="grid grid-cols-2 gap-8">
            <div className="status-card">
              <div className="status-card-header">
                DEBUT SHOW
              </div>
              <div className="p-4">
                <div className="font-bold text-lg">{formatDate(mockSongDetail.debutShow.date)}</div>
                <div>
                  {mockVenues.find(v => v.id === mockSongDetail.debutShow.venueId)?.name}
                </div>
                <button
                  onClick={() => onShowSelect(mockSongDetail.debutShow)}
                  className="btn-brutalist mt-4"
                >
                  VIEW SHOW
                </button>
              </div>
            </div>

            <div className="status-card">
              <div className="status-card-header">
                LAST SHOW
              </div>
              <div className="p-4">
                <div className="font-bold text-lg">{formatDate(mockSongDetail.lastShow.date)}</div>
                <div>
                  {mockVenues.find(v => v.id === mockSongDetail.lastShow.venueId)?.name}
                </div>
                <button
                  onClick={() => onShowSelect(mockSongDetail.lastShow)}
                  className="btn-brutalist mt-4"
                >
                  VIEW SHOW
                </button>
              </div>
            </div>
          </div>

          {/* Duration Stats */}
          <div className="grid grid-cols-2 gap-8">
            <div className="status-card">
              <div className="status-card-header">
                LONGEST PERFORMANCE
              </div>
              <div className="p-4">
                <div className="font-bold text-2xl">
                  {formatDuration(mockSongDetail.longest.durationMs)}
                </div>
                <div>
                  {formatDate(mockSongDetail.longest.show.date)} - {mockVenues.find(v => v.id === mockSongDetail.longest.show.venueId)?.name}
                </div>
              </div>
            </div>

            <div className="status-card">
              <div className="status-card-header">
                SHORTEST PERFORMANCE
              </div>
              <div className="p-4">
                <div className="font-bold text-2xl">
                  {formatDuration(mockSongDetail.shortest.durationMs)}
                </div>
                <div>
                  {formatDate(mockSongDetail.shortest.show.date)} - {mockVenues.find(v => v.id === mockSongDetail.shortest.show.venueId)?.name}
                </div>
              </div>
            </div>
          </div>

          {/* Counts */}
          <div className="status-card">
            <div className="status-card-header">
              PERFORMANCE COUNTS
            </div>
            <div className="p-4">
              <div className="grid grid-cols-3 gap-8 text-center">
                <div>
                  <div className="text-2xl font-bold">{mockSongDetail.counts.openers}</div>
                  <div className="text-sm uppercase">OPENERS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{mockSongDetail.counts.closers}</div>
                  <div className="text-sm uppercase">CLOSERS</div>
                </div>
                <div>
                  <div className="text-2xl font-bold">{mockSongDetail.counts.encores}</div>
                  <div className="text-sm uppercase">ENCORES</div>
                </div>
              </div>
            </div>
          </div>

          {/* Era Context */}
          <div className="status-card">
            <div className="status-card-header">
              ERA CONTEXT
            </div>
            <div className="p-4">
              {Object.keys(mockSongDetail.avgDurationByYear).map(year => {
                const era = getEraLabel(year);
                return (
                  <div key={year} className="mb-4 p-4 border-2 border-black">
                    <div className="font-bold text-lg">{year} - {era?.label}</div>
                    <div>{era?.description}</div>
                    <div className="text-sm mt-2">
                      Avg duration: {formatDuration(mockSongDetail.avgDurationByYear[year])}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'performances' && (
        <div className="space-y-4">
          <div className="panel-brutalist">
            <div className="panel-header">
              ALL PERFORMANCES
            </div>
            <div className="panel-content">
              {mockPerformances
                .filter(p => p.songId === song.id)
                .map((performance) => {
                  const show = mockShows.find(s => s.id === performance.showId);
                  const venue = mockVenues.find(v => v.id === show?.venueId);
                  return (
                    <div key={performance.id} className="list-item">
                      <div className="flex justify-between items-center">
                        <div>
                          <div className="list-item-title">
                            {show ? formatDate(show.date) : 'Unknown Date'}
                          </div>
                          <div>
                            {venue?.name} - {venue?.city}, {venue?.state}
                          </div>
                          <div className="list-item-meta">
                            Set {performance.setNumber}, Position {performance.positionInSet}
                            {performance.isOpener && ' (Opener)'}
                            {performance.isCloser && ' (Closer)'}
                            {performance.isEncore && ' (Encore)'}
                          </div>
                        </div>
                        <button
                          onClick={() => show && onShowSelect(show)}
                          className="btn-brutalist"
                        >
                          VIEW SHOW
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
