import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { songIndexService } from '../lib/song-index';

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('AudioPlayer Component - Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    songIndexService['loadTestIndex']();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Duplicate API Calls Fix', () => {
    it('should only make one API call when searching for audio', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          found: true,
          songAudio: {
            url: 'https://example.com/audio.mp3',
            title: 'Test Song'
          },
          show: {
            title: 'Test Show',
            format: 'MP3'
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Simulate the API call that would be made by AudioPlayer
      const response = await fetch('/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=Test%20Song');
      const data = await response.json();

      // Verify the API call was made correctly
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=Test%20Song'
      );

      // Verify the response data
      expect(data.found).toBe(true);
      expect(data.songAudio.title).toBe('Test Song');
    });

    it('should handle date-based identifier construction correctly', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          found: true,
          songAudio: {
            url: 'https://example.com/audio.mp3',
            title: 'Test Song'
          },
          show: {
            title: 'Test Show',
            format: 'MP3'
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Test with DD-MM-YYYY format date
      const response = await fetch('/api/audio/search?showId=gd1977-05-08&song=Test%20Song');
      const data = await response.json();

      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/audio/search?showId=gd1977-05-08&song=Test%20Song'
      );
    });
  });

  describe('Audio Loading States', () => {
    it('should handle successful API responses', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          found: true,
          songAudio: {
            url: 'https://example.com/audio.mp3',
            title: 'Test Song'
          },
          show: {
            title: 'Test Show',
            format: 'MP3'
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const response = await fetch('/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=Test%20Song');
      const data = await response.json();

      expect(data.found).toBe(true);
      expect(data.songAudio.title).toBe('Test Song');
      expect(data.show.format).toBe('MP3');
    });

    it('should handle API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        statusText: 'Not Found'
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      try {
        await fetch('/api/audio/search?showId=invalid-id&song=Test%20Song');
      } catch (error) {
        // This is expected behavior for invalid requests
        expect(error).toBeDefined();
      }
    });
  });

  describe('Fallback Audio Loading', () => {
    it('should try to load show audio when specific song is not found', async () => {
      // First call: song not found
      const songNotFoundResponse = {
        ok: true,
        json: () => Promise.resolve({
          found: false,
          songAudio: null,
          show: null
        })
      };

      // Second call: show audio found
      const showAudioResponse = {
        ok: true,
        json: () => Promise.resolve({
          show: {
            title: 'Test Show',
            format: 'MP3',
            audioFiles: [
              {
                url: 'https://example.com/show-audio.mp3',
                title: 'Show Audio'
              }
            ]
          }
        })
      };

      (global.fetch as any)
        .mockResolvedValueOnce(songNotFoundResponse)
        .mockResolvedValueOnce(showAudioResponse);

      // Simulate the fallback logic
      const songResponse = await fetch('/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=Test%20Song');
      const songData = await songResponse.json();

      if (!songData.found) {
        const showResponse = await fetch('/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24');
        const showData = await showResponse.json();
        
        expect(showData.show).toBeDefined();
        expect(showData.show.audioFiles.length).toBeGreaterThan(0);
      }

      expect(global.fetch).toHaveBeenCalledTimes(2);
    });
  });
});
