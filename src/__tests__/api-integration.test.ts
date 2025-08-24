import { describe, it, expect, beforeEach } from 'vitest';
import { prisma } from '../lib/prisma';

describe('Steal Your Stats Integration Tests', () => {
  describe('Database Connection', () => {
    it('should connect to database', async () => {
      try {
        const result = await prisma.$queryRaw`SELECT 1 as test`;
        expect(result).toBeDefined();
        console.log('Database connection successful:', result);
      } catch (error) {
        console.error('Database connection failed:', error);
        throw error;
      }
    });
  });

  describe('Data Model Validation', () => {
    it('should have the correct data structure for songs', async () => {
      const songs = await prisma.song.findMany({
        include: {
          artist: true,
          performances: true
        },
        take: 1
      });
      
      if (songs.length > 0) {
        const song = songs[0];
        expect(song).toHaveProperty('id');
        expect(song).toHaveProperty('title');
        expect(song).toHaveProperty('slug');
        expect(song).toHaveProperty('artistId');
        expect(song).toHaveProperty('artist');
        expect(song).toHaveProperty('performances');
        expect(song.artist).toHaveProperty('name');
        expect(Array.isArray(song.performances)).toBe(true);
      }
    });

    it('should have the correct data structure for shows', async () => {
      const shows = await prisma.show.findMany({
        include: {
          artist: true,
          venue: true,
          performances: true
        },
        take: 1
      });
      
      if (shows.length > 0) {
        const show = shows[0];
        expect(show).toHaveProperty('id');
        expect(show).toHaveProperty('date');
        expect(show).toHaveProperty('artistId');
        expect(show).toHaveProperty('venueId');
        expect(show).toHaveProperty('artist');
        expect(show).toHaveProperty('venue');
        expect(show).toHaveProperty('performances');
        expect(show.artist).toHaveProperty('name');
        expect(show.venue).toHaveProperty('name');
        expect(show.venue).toHaveProperty('city');
        expect(Array.isArray(show.performances)).toBe(true);
      }
    });

    it('should have the correct data structure for performances', async () => {
      const performances = await prisma.performance.findMany({
        include: {
          song: true,
          show: true
        },
        take: 1
      });
      
      if (performances.length > 0) {
        const performance = performances[0];
        expect(performance).toHaveProperty('id');
        expect(performance).toHaveProperty('songId');
        expect(performance).toHaveProperty('showId');
        expect(performance).toHaveProperty('setNumber');
        expect(performance).toHaveProperty('positionInSet');
        expect(performance).toHaveProperty('song');
        expect(performance).toHaveProperty('show');
        expect(performance.song).toHaveProperty('title');
        expect(performance.show).toHaveProperty('date');
      }
    });
  });

  describe('Song Data Queries', () => {
    it('should find songs by title', async () => {
      const songs = await prisma.song.findMany({
        where: {
          title: { contains: 'Scarlet', mode: 'insensitive' }
        },
        include: {
          artist: true
        }
      });
      
      console.log('Found songs:', songs);
      expect(songs).toBeDefined();
      expect(songs.length).toBeGreaterThan(0);
      expect(songs[0].title).toContain('Scarlet');
    });

    it('should find songs with performances and shows', async () => {
      const songs = await prisma.song.findMany({
        where: {
          title: { contains: 'Scarlet', mode: 'insensitive' }
        },
        include: {
          artist: true,
          performances: {
            include: {
              show: {
                include: {
                  venue: true
                }
              }
            }
          }
        }
      });
      
      console.log('Found songs with performances:', songs);
      expect(songs).toBeDefined();
      if (songs.length > 0) {
        expect(songs[0].performances).toBeDefined();
        if (songs[0].performances.length > 0) {
          expect(songs[0].performances[0].show).toBeDefined();
          expect(songs[0].performances[0].show.venue).toHaveProperty('name');
          expect(songs[0].performances[0].show.venue).toHaveProperty('city');
        }
      }
    });

    it('should find songs by alternative titles', async () => {
      const songs = await prisma.song.findMany({
        where: {
          altTitles: { has: 'Scarlet Begonias' }
        },
        include: {
          artist: true
        }
      });
      
      expect(songs).toBeDefined();
      // Note: This test depends on the seed data having altTitles
    });
  });

  describe('Show Data Queries', () => {
    it('should find shows with setlists', async () => {
      const shows = await prisma.show.findMany({
        include: {
          artist: true,
          venue: true,
          performances: {
            include: {
              song: true
            },
            orderBy: {
              positionInSet: 'asc'
            }
          }
        }
      });
      
      console.log('Found shows:', shows);
      expect(shows).toBeDefined();
      expect(shows.length).toBeGreaterThan(0);
      if (shows[0].performances.length > 0) {
        expect(shows[0].performances[0].song).toBeDefined();
        expect(shows[0].performances[0].song).toHaveProperty('title');
      }
    });

    it('should find shows by date range', async () => {
      const shows = await prisma.show.findMany({
        where: {
          date: {
            gte: new Date('1969-01-01'),
            lte: new Date('1969-12-31')
          }
        },
        include: {
          artist: true,
          venue: true
        }
      });
      
      expect(shows).toBeDefined();
      if (shows.length > 0) {
        shows.forEach((show: any) => {
          expect(show.date.getFullYear()).toBe(1969);
        });
      }
    });
  });

  describe('Venue Data Queries', () => {
    it('should find venues with shows', async () => {
      const venues = await prisma.venue.findMany({
        include: {
          shows: {
            include: {
              artist: true
            }
          }
        }
      });
      
      expect(venues).toBeDefined();
      expect(venues.length).toBeGreaterThan(0);
      if (venues[0].shows.length > 0) {
        expect(venues[0].shows[0]).toHaveProperty('date');
        expect(venues[0].shows[0].artist).toHaveProperty('name');
      }
    });
  });

  describe('BPM Analysis Data', () => {
    it('should find BPM analysis records', async () => {
      const analyses = await prisma.analysis.findMany({
        include: {
          performance: true,
          recording: true
        }
      });
      
      console.log('Found BPM analyses:', analyses);
      expect(analyses).toBeDefined();
      // Note: There might not be any BPM analyses yet, so we just check the structure
    });

    it('should have correct BPM analysis structure', async () => {
      const analyses = await prisma.analysis.findMany({
        take: 1
      });
      
      if (analyses.length > 0) {
        const analysis = analyses[0];
        expect(analysis).toHaveProperty('id');
        expect(analysis).toHaveProperty('performanceId');
        expect(analysis).toHaveProperty('recordingId');
        expect(analysis).toHaveProperty('bpm');
        expect(analysis).toHaveProperty('bpmConfidence');
        expect(analysis).toHaveProperty('durationMs');
      }
    });
  });

  describe('Recording Data Queries', () => {
    it('should find recordings with track mappings', async () => {
      const recordings = await prisma.recording.findMany({
        include: {
          show: true
        }
      });
      
      expect(recordings).toBeDefined();
      if (recordings.length > 0) {
        const recording = recordings[0];
        expect(recording).toHaveProperty('id');
        expect(recording).toHaveProperty('archiveIdentifier');
        expect(recording).toHaveProperty('sourceType');
        expect(recording).toHaveProperty('format');
        expect(recording).toHaveProperty('trackMap');
        expect(recording).toHaveProperty('durationMap');
        expect(recording.show).toBeDefined();
      }
    });
  });

  describe('Data Relationships', () => {
    it('should maintain referential integrity', async () => {
      // Test that all foreign key relationships are valid
      const songs = await prisma.song.findMany({
        include: {
          artist: true,
          performances: {
            include: {
              show: true
            }
          }
        }
      });
      
      songs.forEach((song: any) => {
        expect(song.artist).toBeDefined();
        song.performances.forEach((performance: any) => {
          expect(performance.show).toBeDefined();
        });
      });
    });

    it('should have consistent data across related entities', async () => {
      const shows = await prisma.show.findMany({
        include: {
          performances: {
            include: {
              song: true
            }
          }
        }
      });
      
      shows.forEach((show: any) => {
        show.performances.forEach((performance: any) => {
          expect(performance.song).toBeDefined();
          expect(performance.song.title).toBeDefined();
        });
      });
    });
  });
});
