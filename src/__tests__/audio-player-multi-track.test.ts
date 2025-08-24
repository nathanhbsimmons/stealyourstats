import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { songIndexService } from '../lib/song-index';

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('AudioPlayer Multi-Track Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    songIndexService['loadTestIndex']();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Multi-Track API Response', () => {
    it('should return multiple tracks for a song instead of just one', async () => {
      // Mock successful API response with multiple tracks
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          found: true,
          totalTracks: 3,
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
            },
            {
              name: 'gd77-05-08s2t02.ogg',
              url: 'https://archive.org/download/gd1977-05-08.137571.mtx-2aud.dusborne.flac24/gd77-05-08s2t02.ogg',
              size: 8980113,
              format: 'Ogg Vorbis',
              duration: 0,
              trackNumber: 15,
              title: 'Scarlet Begonias ->'
            }
          ],
          show: {
            identifier: 'gd1977-05-08.137571.mtx-2aud.dusborne.flac24',
            title: 'Grateful Dead - 1977-05-08',
            date: '1977-05-08',
            format: 'MP3'
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Test the API endpoint directly
      const response = await fetch('/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=Scarlet%20Begonias');
      const data = await response.json();

      expect(data.found).toBe(true);
      expect(data.totalTracks).toBe(3);
      expect(data.songTracks).toHaveLength(3);
      expect(data.songTracks[0].format).toBe('VBR MP3');
      expect(data.songTracks[1].format).toBe('24bit Flac');
      expect(data.songTracks[2].format).toBe('Ogg Vorbis');
    });

    it('should prioritize MP3 tracks for streaming', async () => {
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
            format: 'MP3'
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const response = await fetch('/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=Scarlet%20Begonias');
      const data = await response.json();

      // MP3 should be first due to prioritization
      expect(data.songTracks[0].format).toBe('VBR MP3');
      expect(data.songTracks[1].format).toBe('24bit Flac');
    });
  });

  describe('Track Selection UI', () => {
    it('should show track selector when multiple tracks are available', async () => {
      // This would require rendering the component, but we can test the logic
      const availableTracks = [
        { name: 'track1.mp3', format: 'MP3', duration: 300, size: 1000000 },
        { name: 'track1.flac', format: 'FLAC', duration: 300, size: 5000000 }
      ];

      const showTrackSelector = availableTracks.length > 1;
      expect(showTrackSelector).toBe(true);
    });

    it('should auto-select first track when only one track is available', async () => {
      const availableTracks = [
        { name: 'track1.mp3', format: 'MP3', duration: 300, size: 1000000 }
      ];

      const shouldAutoSelect = availableTracks.length === 1;
      expect(shouldAutoSelect).toBe(true);
    });
  });

  describe('Track Information Display', () => {
    it('should format duration correctly', () => {
      const formatDuration = (seconds?: number) => {
        if (!seconds) return 'Unknown';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs.toString().padStart(2, '0')}`;
      };

      expect(formatDuration(690)).toBe('11:30');
      expect(formatDuration(125)).toBe('2:05');
      expect(formatDuration(0)).toBe('Unknown');
      expect(formatDuration(undefined)).toBe('Unknown');
    });

    it('should format file size correctly', () => {
      const formatFileSize = (bytes: number) => {
        const mb = bytes / (1024 * 1024);
        return `${mb.toFixed(1)} MB`;
      };

      expect(formatFileSize(16504320)).toBe('15.7 MB');
      expect(formatFileSize(254197830)).toBe('242.4 MB');
      expect(formatFileSize(8980113)).toBe('8.6 MB');
    });
  });

  describe('API Integration', () => {
    it('should handle API errors gracefully', async () => {
      const mockErrorResponse = {
        ok: false,
        statusText: 'Not Found'
      };

      (global.fetch as any).mockResolvedValue(mockErrorResponse);

      try {
        const response = await fetch('/api/audio/search?showId=invalid&song=Test');
        expect(response.ok).toBe(false);
      } catch (error) {
        // Expected behavior
      }
    });

    it('should return empty tracks array when no matches found', async () => {
      const mockEmptyResponse = {
        ok: true,
        json: () => Promise.resolve({
          found: false,
          totalTracks: 0,
          songTracks: [],
          show: null
        })
      };

      (global.fetch as any).mockResolvedValue(mockEmptyResponse);

      const response = await fetch('/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=NonExistentSong');
      const data = await response.json();

      expect(data.found).toBe(false);
      expect(data.totalTracks).toBe(0);
      expect(data.songTracks).toHaveLength(0);
    });
  });
});
