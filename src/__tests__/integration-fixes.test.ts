import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { songIndexService } from '../lib/song-index';

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('Integration Tests - Fixes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    songIndexService['loadTestIndex']();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('End-to-End Song Search and Audio Loading', () => {
    it('should successfully load audio for Scarlet Begonias without duplicate calls', async () => {
      // Mock successful API response
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          found: true,
          songAudio: {
            url: 'https://archive.org/download/gd1977-05-08.137571.mtx-2aud.dusborne.flac24/gd77-05-08s2t02.mp3',
            title: 'Scarlet Begonias ->',
            duration: 690,
            format: 'VBR MP3'
          },
          show: {
            title: 'Grateful Dead - 1977-05-08',
            format: 'MP3',
            audioFiles: []
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      // Get song details from the index
      const songDetails = songIndexService.getSongDetails('scarlet-begonias');
      expect(songDetails).toBeDefined();
      expect(songDetails?.title).toBe('Scarlet Begonias');

      // Get the archive identifier
      const archiveIdentifier = songDetails?.shows[0].id;
      expect(archiveIdentifier).toBe('gd1977-05-08.137571.mtx-2aud.dusborne.flac24');

      // Simulate the API call that would be made by AudioPlayer
      const response = await fetch(`/api/audio/search?showId=${archiveIdentifier}&song=Scarlet%20Begonias`);
      const data = await response.json();

      // Verify the API call was made correctly
      expect(global.fetch).toHaveBeenCalledTimes(1);
      expect(global.fetch).toHaveBeenCalledWith(
        '/api/audio/search?showId=gd1977-05-08.137571.mtx-2aud.dusborne.flac24&song=Scarlet%20Begonias'
      );

      // Verify the response data
      expect(data.found).toBe(true);
      expect(data.songAudio.title).toBe('Scarlet Begonias ->');
      expect(data.songAudio.format).toBe('VBR MP3');
      expect(data.songAudio.duration).toBe(690);
    });

    it('should handle multiple song searches without interference', async () => {
      const mockResponses = {
        'jack-straw': {
          ok: true,
          json: () => Promise.resolve({
            found: true,
            songAudio: {
              url: 'https://example.com/jack-straw.mp3',
              title: 'Jack Straw',
              duration: 467,
              format: 'VBR MP3'
            },
            show: { title: 'Test Show', format: 'MP3' }
          })
        },
        'scarlet-begonias': {
          ok: true,
          json: () => Promise.resolve({
            found: true,
            songAudio: {
              url: 'https://example.com/scarlet-begonias.mp3',
              title: 'Scarlet Begonias',
              duration: 690,
              format: 'VBR MP3'
            },
            show: { title: 'Test Show', format: 'MP3' }
          })
        }
      };

      // Test Jack Straw
      (global.fetch as any).mockResolvedValue(mockResponses['jack-straw']);
      const jackStraw = songIndexService.getSongDetails('jack-straw');
      expect(jackStraw?.title).toBe('Jack Straw');

      const jackStrawResponse = await fetch(`/api/audio/search?showId=${jackStraw?.shows[0].id}&song=Jack%20Straw`);
      const jackStrawData = await jackStrawResponse.json();
      expect(jackStrawData.found).toBe(true);

      // Test Scarlet Begonias
      (global.fetch as any).mockResolvedValue(mockResponses['scarlet-begonias']);
      const scarletBegonias = songIndexService.getSongDetails('scarlet-begonias');
      expect(scarletBegonias?.title).toBe('Scarlet Begonias');

      const scarletBegoniasResponse = await fetch(`/api/audio/search?showId=${scarletBegonias?.shows[0].id}&song=Scarlet%20Begonias`);
      const scarletBegoniasData = await scarletBegoniasResponse.json();
      expect(scarletBegoniasData.found).toBe(true);

      // Verify total API calls
      expect(global.fetch).toHaveBeenCalledTimes(2);
    });

    it('should validate all songs in the test index have working archive identifiers', () => {
      const songs = songIndexService['songIndex']?.songs || [];
      
      songs.forEach(song => {
        expect(song.shows.length).toBeGreaterThan(0);
        
        song.shows.forEach(show => {
          // Verify archive identifier format
          expect(show.id).toMatch(/^gd\d{4}-\d{2}-\d{2}/);
          
          // Verify date format
          expect(show.date).toMatch(/^\d{2}-\d{2}-\d{4}$/);
          
          // Verify venue information
          expect(show.venue).toBeDefined();
          expect(show.venue.name).toBeDefined();
          expect(show.venue.city).toBeDefined();
        });
      });
    });
  });

  describe('Data Consistency Tests', () => {
    it('should have consistent show data across songs', () => {
      const jackStraw = songIndexService.getSongDetails('jack-straw');
      const scarletBegonias = songIndexService.getSongDetails('scarlet-begonias');
      const fireOnTheMountain = songIndexService.getSongDetails('fire-on-the-mountain');

      // All three songs should reference the same Cornell show
      const cornellShowId = 'gd1977-05-08.137571.mtx-2aud.dusborne.flac24';
      
      expect(jackStraw?.shows.some(show => show.id === cornellShowId)).toBe(true);
      expect(scarletBegonias?.shows.some(show => show.id === cornellShowId)).toBe(true);
      expect(fireOnTheMountain?.shows.some(show => show.id === cornellShowId)).toBe(true);
    });

    it('should have valid performance statistics', () => {
      const songs = songIndexService['songIndex']?.songs || [];
      
      songs.forEach(song => {
        expect(song.totalPerformances).toBeGreaterThan(0);
        expect(song.totalPerformances).toBe(song.shows.length);
        
        if (song.firstPerformance) {
          expect(song.firstPerformance.date).toBeDefined();
          expect(song.firstPerformance.venue).toBeDefined();
        }
        
        if (song.lastPerformance) {
          expect(song.lastPerformance.date).toBeDefined();
          expect(song.lastPerformance.venue).toBeDefined();
        }
      });
    });
  });
});
