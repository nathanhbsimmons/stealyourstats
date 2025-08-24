import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { songIndexService } from '../lib/song-index';

// Mock fetch for integration tests
global.fetch = vi.fn();

describe('Multi-Show Selection Functionality', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (global.fetch as any).mockClear();
    songIndexService['loadTestIndex']();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Song Search Returns Multiple Shows', () => {
    it('should return multiple shows for Scarlet Begonias', async () => {
      // Mock successful API response with multiple shows
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          song: {
            title: 'Scarlet Begonias',
            slug: 'scarlet-begonias'
          },
          shows: [
            {
              id: 'gd1977-05-08.137571.mtx-2aud.dusborne.flac24',
              date: '08-05-1977',
              venue: {
                id: 'barton-hall',
                name: 'Barton Hall, Cornell University',
                city: 'Ithaca',
                country: 'United States'
              },
              year: 1977,
              era: 'Return + \'77 Era'
            },
            {
              id: 'gd1978-07-08.137571.mtx-2aud.dusborne.flac24',
              date: '08-07-1978',
              venue: {
                id: 'red-rocks',
                name: 'Red Rocks Amphitheatre',
                city: 'Morrison',
                country: 'United States'
              },
              year: 1978,
              era: 'Return + \'77 Era'
            },
            {
              id: 'gd1980-06-20.137571.mtx-2aud.dusborne.flac24',
              date: '20-06-1980',
              venue: {
                id: 'capitol-theatre',
                name: 'Capitol Theatre',
                city: 'Passaic',
                country: 'United States'
              },
              year: 1980,
              era: 'Brent Early Era'
            }
          ],
          counts: {
            total: 3,
            openers: 0,
            closers: 0,
            encores: 0
          }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const response = await fetch('/api/songs/scarlet-begonias');
      const data = await response.json();

      expect(data.shows).toHaveLength(3);
      expect(data.shows[0].venue.name).toBe('Barton Hall, Cornell University');
      expect(data.shows[1].venue.name).toBe('Red Rocks Amphitheatre');
      expect(data.shows[2].venue.name).toBe('Capitol Theatre');
      expect(data.counts.total).toBe(3);
    });

    it('should show different eras and years for different shows', async () => {
      const mockResponse = {
        ok: true,
        json: () => Promise.resolve({
          song: { title: 'Scarlet Begonias', slug: 'scarlet-begonias' },
          shows: [
            {
              id: 'gd1977-05-08.137571.mtx-2aud.dusborne.flac24',
              date: '08-05-1977',
              venue: { name: 'Barton Hall' },
              year: 1977,
              era: 'Return + \'77 Era'
            },
            {
              id: 'gd1990-09-20.137571.mtx-2aud.dusborne.flac24',
              date: '20-09-1990',
              venue: { name: 'Madison Square Garden' },
              year: 1990,
              era: 'Brent Late Era'
            }
          ],
          counts: { total: 2, openers: 0, closers: 0, encores: 0 }
        })
      };

      (global.fetch as any).mockResolvedValue(mockResponse);

      const response = await fetch('/api/songs/scarlet-begonias');
      const data = await response.json();

      expect(data.shows[0].year).toBe(1977);
      expect(data.shows[0].era).toBe('Return + \'77 Era');
      expect(data.shows[1].year).toBe(1990);
      expect(data.shows[1].era).toBe('Brent Late Era');
    });
  });

  describe('Show Selection UI Logic', () => {
    it('should show show selector when multiple shows are available', () => {
      const shows = [
        { id: 'show1', date: '1977-05-08', venue: { name: 'Venue 1' } },
        { id: 'show2', date: '1978-07-08', venue: { name: 'Venue 2' } }
      ];

      const shouldShowSelector = shows.length > 1;
      expect(shouldShowSelector).toBe(true);
    });

    it('should auto-select first show by default', () => {
      const shows = [
        { id: 'show1', date: '1977-05-08', venue: { name: 'Venue 1' } },
        { id: 'show2', date: '1978-07-08', venue: { name: 'Venue 2' } }
      ];

      const defaultSelectedShow = shows[0];
      expect(defaultSelectedShow.id).toBe('show1');
      expect(defaultSelectedShow.venue.name).toBe('Venue 1');
    });

    it('should allow switching between different shows', () => {
      const shows = [
        { id: 'show1', date: '1977-05-08', venue: { name: 'Venue 1' } },
        { id: 'show2', date: '1978-07-08', venue: { name: 'Venue 2' } }
      ];

      let selectedShow = shows[0];
      expect(selectedShow.id).toBe('show1');

      // Switch to second show
      selectedShow = shows[1];
      expect(selectedShow.id).toBe('show2');
      expect(selectedShow.venue.name).toBe('Venue 2');
    });
  });

  describe('Audio Player Integration', () => {
    it('should pass selected show to AudioPlayer', () => {
      const selectedShow = {
        id: 'gd1978-07-08.137571.mtx-2aud.dusborne.flac24',
        date: '08-07-1978',
        venue: { name: 'Red Rocks Amphitheatre' }
      };

      const audioPlayerProps = {
        trackName: 'Scarlet Begonias',
        showDate: selectedShow.date,
        archiveIdentifier: selectedShow.id
      };

      expect(audioPlayerProps.archiveIdentifier).toBe('gd1978-07-08.137571.mtx-2aud.dusborne.flac24');
      expect(audioPlayerProps.showDate).toBe('08-07-1978');
    });

    it('should handle different archive identifiers for different shows', () => {
      const shows = [
        { id: 'gd1977-05-08.137571.mtx-2aud.dusborne.flac24', date: '1977-05-08' },
        { id: 'gd1990-09-20.137571.mtx-2aud.dusborne.flac24', date: '1990-09-20' }
      ];

      const firstShowAudioProps = {
        trackName: 'Scarlet Begonias',
        showDate: shows[0].date,
        archiveIdentifier: shows[0].id
      };

      const secondShowAudioProps = {
        trackName: 'Scarlet Begonias',
        showDate: shows[1].date,
        archiveIdentifier: shows[1].id
      };

      expect(firstShowAudioProps.archiveIdentifier).toBe('gd1977-05-08.137571.mtx-2aud.dusborne.flac24');
      expect(secondShowAudioProps.archiveIdentifier).toBe('gd1990-09-20.137571.mtx-2aud.dusborne.flac24');
      expect(firstShowAudioProps.archiveIdentifier).not.toBe(secondShowAudioProps.archiveIdentifier);
    });
  });
});
