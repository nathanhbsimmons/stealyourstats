import { describe, it, expect, beforeEach } from 'vitest';
import { songIndexService } from '../lib/song-index';

describe('Song Search Functionality - Fixes', () => {
  beforeEach(() => {
    // Reload the test index before each test
    songIndexService['loadTestIndex']();
  });

  describe('Song Index Loading', () => {
    it('should load the test index with correct number of songs', () => {
      const songDetails = songIndexService.getSongDetails('jack-straw');
      expect(songDetails).toBeDefined();
      expect(songDetails?.title).toBe('Jack Straw');
    });

    it('should have the correct total number of songs', () => {
      // The test index should now have 4 songs
      expect(songIndexService['songIndex']?.songs.length).toBe(4);
    });
  });

  describe('Song Search by Slug', () => {
    it('should find Jack Straw by slug', () => {
      const songDetails = songIndexService.getSongDetails('jack-straw');
      expect(songDetails).toBeDefined();
      expect(songDetails?.title).toBe('Jack Straw');
      expect(songDetails?.shows.length).toBeGreaterThan(0);
    });

    it('should find China Cat Sunflower by slug', () => {
      const songDetails = songIndexService.getSongDetails('china-cat-sunflower');
      expect(songDetails).toBeDefined();
      expect(songDetails?.title).toBe('China Cat Sunflower');
      expect(songDetails?.shows.length).toBeGreaterThan(0);
    });

    it('should find Scarlet Begonias by slug', () => {
      const songDetails = songIndexService.getSongDetails('scarlet-begonias');
      expect(songDetails).toBeDefined();
      expect(songDetails?.title).toBe('Scarlet Begonias');
      expect(songDetails?.shows.length).toBeGreaterThan(0);
    });

    it('should find Fire on the Mountain by slug', () => {
      const songDetails = songIndexService.getSongDetails('fire-on-the-mountain');
      expect(songDetails).toBeDefined();
      expect(songDetails?.title).toBe('Fire on the Mountain');
      expect(songDetails?.shows.length).toBeGreaterThan(0);
    });

    it('should return null for non-existent songs', () => {
      const songDetails = songIndexService.getSongDetails('non-existent-song');
      expect(songDetails).toBeNull();
    });
  });

  describe('Song Data Structure', () => {
    it('should have correct show data for Jack Straw', () => {
      const songDetails = songIndexService.getSongDetails('jack-straw');
      expect(songDetails?.shows[0].id).toBe('gd1977-05-08.137571.mtx-2aud.dusborne.flac24');
      expect(songDetails?.shows[0].venue.name).toBe('Barton Hall, Cornell University');
      expect(songDetails?.shows[0].date).toBe('08-05-1977');
    });

    it('should have correct show data for Scarlet Begonias', () => {
      const songDetails = songIndexService.getSongDetails('scarlet-begonias');
      expect(songDetails?.shows[0].id).toBe('gd1977-05-08.137571.mtx-2aud.dusborne.flac24');
      expect(songDetails?.shows[0].venue.name).toBe('Barton Hall, Cornell University');
      expect(songDetails?.shows[0].date).toBe('08-05-1977');
    });

    it('should have correct performance counts', () => {
      const jackStraw = songIndexService.getSongDetails('jack-straw');
      expect(jackStraw?.totalPerformances).toBe(3);

      const scarletBegonias = songIndexService.getSongDetails('scarlet-begonias');
      expect(scarletBegonias?.totalPerformances).toBe(1);
    });
  });

  describe('Archive Identifier Validation', () => {
    it('should have valid Archive.org identifiers', () => {
      const songs = songIndexService['songIndex']?.songs || [];
      
      songs.forEach(song => {
        song.shows.forEach(show => {
          // All identifiers should start with 'gd' and contain valid date format
          expect(show.id).toMatch(/^gd\d{4}-\d{2}-\d{2}/);
          
          // Should not contain made-up identifiers
          expect(show.id).not.toContain('unknown');
          expect(show.id).not.toContain('123456');
          expect(show.id).not.toContain('567890');
        });
      });
    });

    it('should have consistent date formats', () => {
      const songs = songIndexService['songIndex']?.songs || [];
      
      songs.forEach(song => {
        song.shows.forEach(show => {
          // All dates should be in DD-MM-YYYY format
          expect(show.date).toMatch(/^\d{2}-\d{2}-\d{4}$/);
        });
      });
    });
  });

  describe('API Integration', () => {
    it('should provide valid archive identifiers for API calls', () => {
      const scarletBegonias = songIndexService.getSongDetails('scarlet-begonias');
      const showId = scarletBegonias?.shows[0].id;
      
      expect(showId).toBe('gd1977-05-08.137571.mtx-2aud.dusborne.flac24');
      
      // This identifier should work with the audio search API
      expect(showId).toMatch(/^gd\d{4}-\d{2}-\d{2}/);
    });
  });
});
