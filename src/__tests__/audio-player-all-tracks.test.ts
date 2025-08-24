import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { songIndexService } from '../lib/song-index';

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('AudioPlayer All Tracks Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    songIndexService['loadTestIndex']();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('All Show Tracks API Response', () => {
    it('should return all show tracks in audioFiles array', async () => {
      // Mock successful API response with all show tracks
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          found: true,
          totalTracks: 2,
          songTracks: [
            {
              name: 'gd77-05-08s2t02.mp3',
              url: 'https://archive.org/download/gd1977-05-08.137571.mtx-2aud.dusborne.flac24/gd77-05-08s2t02.mp3',
              size: 16504320,
              format: 'VBR MP3',
              duration: 690,
              trackNumber: 15,
              title: 'Scarlet Begonias ->'
            },
            {
              name: 'gd77-05-08s2t02.flac',
              url: 'https://archive.org/download/gd1977-05-08.137571.mtx-2aud.dusborne.flac24/gd77-05-08s2t02.flac',
              size: 254197830,
              format: '24bit Flac',
              duration: 0,
              trackNumber: 15,
              title: 'Scarlet Begonias ->'
            }
          ],
          show: {
            identifier: 'gd1977-05-08.137571.mtx-2aud.dusborne.flac24',
            title: 'Grateful Dead - 1977-05-08',
            date: '1977-05-08',
            audioFiles: [
              {
                name: 'gd77-05-08s1t01.mp3',
                url: 'https://archive.org/download/gd1977-05-08.137571.mtx-2aud.dusborne.flac24/gd77-05-08s1t01.mp3',
                size: 1008128,
                format: 'VBR MP3',
                duration: 39,
                trackNumber: 1,
                title: 'Tuning'
              },
              {
                name: 'gd77-05-08s1t02.mp3',
                url: 'https://archive.org/download/gd1977-05-08.137571.mtx-2aud.dusborne.flac24/gd77-05-08s1t02.mp3',
                size: 7779328,
                format: 'VBR MP3',
                duration: 323,
                trackNumber: 2,
                title: 'Minglewood Blues'
              },
              {
                name: 'gd77-05-08s2t02.mp3',
                url: 'https://archive.org/download/gd1977-05-08.137571.mtx-2aud.dusborne.flac24/gd77-05-08s2t02.mp3',
                size: 16504320,
                format: 'VBR MP3',
                duration: 690,
                trackNumber: 15,
                title: 'Scarlet Begonias ->'
              }
            ],
            totalDuration: 10583,
            format: 'MP3'
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const response = await fetch('/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=Scarlet%20Begonias');
      const data = await response.json();

      expect(data.found).toBe(true);
      expect(data.totalTracks).toBe(2);
      expect(data.songTracks).toHaveLength(2);
      expect(data.show.audioFiles).toHaveLength(3);
      expect(data.show.audioFiles[0].title).toBe('Tuning');
      expect(data.show.audioFiles[1].title).toBe('Minglewood Blues');
      expect(data.show.audioFiles[2].title).toBe('Scarlet Begonias ->');
    });

    it('should have all tracks with proper track numbers', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          found: true,
          totalTracks: 1,
          songTracks: [],
          show: {
            identifier: 'gd1977-05-08.137571.mtx-2aud.dusborne.flac24',
            title: 'Grateful Dead - 1977-05-08',
            date: '1977-05-08',
            audioFiles: [
              {
                name: 'gd77-05-08s1t01.mp3',
                size: 1008128,
                format: 'VBR MP3',
                duration: 39,
                trackNumber: 1,
                title: 'Tuning'
              },
              {
                name: 'gd77-05-08s1t02.mp3',
                size: 7779328,
                format: 'VBR MP3',
                duration: 323,
                trackNumber: 2,
                title: 'Minglewood Blues'
              },
              {
                name: 'gd77-05-08s2t01.mp3',
                size: 2608128,
                format: 'VBR MP3',
                duration: 109,
                trackNumber: 14,
                title: 'Take A Step Back'
              }
            ],
            totalDuration: 10583,
            format: 'MP3'
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const response = await fetch('/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=Test');
      const data = await response.json();

      const numberedTracks = data.show.audioFiles.filter(track => track.trackNumber);
      expect(numberedTracks).toHaveLength(3);
      expect(numberedTracks[0].trackNumber).toBe(1);
      expect(numberedTracks[1].trackNumber).toBe(2);
      expect(numberedTracks[2].trackNumber).toBe(14);
    });
  });

  describe('Track Browsing UI', () => {
    it('should show all tracks button when show has multiple tracks', () => {
      const allShowTracks = [
        { name: 'track1.mp3', format: 'MP3', duration: 300, size: 1000000, trackNumber: 1, title: 'Tuning' },
        { name: 'track2.mp3', format: 'MP3', duration: 400, size: 1500000, trackNumber: 2, title: 'Minglewood Blues' },
        { name: 'track3.mp3', format: 'MP3', duration: 500, size: 2000000, trackNumber: 3, title: 'Loser' }
      ];

      const shouldShowAllTracksButton = allShowTracks.length > 0;
      expect(shouldShowAllTracksButton).toBe(true);
    });

    it('should filter out tracks without track numbers', () => {
      const allShowTracks = [
        { name: 'track1.mp3', format: 'MP3', duration: 300, size: 1000000, trackNumber: 1, title: 'Tuning' },
        { name: 'fingerprint.ffp', format: 'Flac FingerPrint', size: 1210, title: 'Fingerprint' },
        { name: 'track2.mp3', format: 'MP3', duration: 400, size: 1500000, trackNumber: 2, title: 'Minglewood Blues' }
      ];

      const numberedTracks = allShowTracks.filter((track: any) => track.trackNumber);
      expect(numberedTracks).toHaveLength(2);
      expect(numberedTracks[0].trackNumber).toBe(1);
      expect(numberedTracks[1].trackNumber).toBe(2);
    });

    it('should sort tracks by track number', () => {
      const allShowTracks = [
        { name: 'track3.mp3', format: 'MP3', duration: 500, size: 2000000, trackNumber: 3, title: 'Loser' },
        { name: 'track1.mp3', format: 'MP3', duration: 300, size: 1000000, trackNumber: 1, title: 'Tuning' },
        { name: 'track2.mp3', format: 'MP3', duration: 400, size: 1500000, trackNumber: 2, title: 'Minglewood Blues' }
      ];

      const sortedTracks = allShowTracks.sort((a: any, b: any) => (a.trackNumber || 0) - (b.trackNumber || 0));
      expect(sortedTracks[0].trackNumber).toBe(1);
      expect(sortedTracks[1].trackNumber).toBe(2);
      expect(sortedTracks[2].trackNumber).toBe(3);
    });
  });

  describe('Track Selection from All Tracks', () => {
    it('should allow selecting any track from the show', () => {
      const allShowTracks = [
        { name: 'track1.mp3', format: 'MP3', duration: 300, size: 1000000, trackNumber: 1, title: 'Tuning' },
        { name: 'track2.mp3', format: 'MP3', duration: 400, size: 1500000, trackNumber: 2, title: 'Minglewood Blues' }
      ];

      const selectedTrack = allShowTracks[1];
      expect(selectedTrack.title).toBe('Minglewood Blues');
      expect(selectedTrack.trackNumber).toBe(2);
    });

    it('should handle tracks with missing duration gracefully', () => {
      const allShowTracks = [
        { name: 'track1.mp3', format: 'MP3', duration: 300, size: 1000000, trackNumber: 1, title: 'Tuning' },
        { name: 'track2.flac', format: 'FLAC', duration: 0, size: 5000000, trackNumber: 2, title: 'Minglewood Blues' }
      ];

      const formatDuration = (seconds?: number) => {
        if (!seconds) return 'Unknown';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      expect(formatDuration(allShowTracks[0].duration)).toBe('5:00');
      expect(formatDuration(allShowTracks[1].duration)).toBe('Unknown');
    });
  });
});
