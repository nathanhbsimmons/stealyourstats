import { describe, it, expect, beforeAll, afterAll, beforeEach, vi } from 'vitest';
import { prisma } from '../lib/prisma';

describe('End-to-End Integration Tests', () => {
  let testArtist: any;
  let testVenues: any[];
  let testSongs: any[];
  let testShows: any[];
  let testPerformances: any[];
  let testRecordings: any[];

  beforeAll(async () => {
    // Clean up any existing test data
    await prisma.analysis.deleteMany({});
    await prisma.songRollup.deleteMany({});
    await prisma.performance.deleteMany({});
    await prisma.recording.deleteMany({});
    await prisma.show.deleteMany({});
    await prisma.song.deleteMany({});
    await prisma.venue.deleteMany({});
    await prisma.artist.deleteMany({ where: { name: { startsWith: 'Test' } } });

    // Create test data
    testArtist = await prisma.artist.create({
      data: {
        name: 'Test Grateful Dead',
        musicbrainzMbid: 'test-mbid-123'
      }
    });

    testVenues = await Promise.all([
      prisma.venue.create({
        data: {
          name: 'Test Fillmore West',
          city: 'San Francisco',
          state: 'CA',
          country: 'USA'
        }
      }),
      prisma.venue.create({
        data: {
          name: 'Test Madison Square Garden',
          city: 'New York',
          state: 'NY',
          country: 'USA'
        }
      })
    ]);

    testSongs = await Promise.all([
      prisma.song.create({
        data: {
          artistId: testArtist.id,
          title: 'Test Scarlet Begonias',
          altTitles: ['Test Scarlet Begonias', 'Test Scarlet'],
          slug: 'test-scarlet-begonias'
        }
      }),
      prisma.song.create({
        data: {
          artistId: testArtist.id,
          title: 'Test Fire on the Mountain',
          altTitles: ['Test Fire on the Mountain', 'Test Fire'],
          slug: 'test-fire-on-the-mountain'
        }
      }),
      prisma.song.create({
        data: {
          artistId: testArtist.id,
          title: 'Test Truckin',
          altTitles: ['Test Truckin', 'Test Truckin\''],
          slug: 'test-truckin'
        }
      })
    ]);

    testShows = await Promise.all([
      prisma.show.create({
        data: {
          artistId: testArtist.id,
          date: new Date('1977-05-08'),
          venueId: testVenues[0].id,
          archiveItemIds: ['test-gd1977-05-08'],
          sourceCount: 2
        }
      }),
      prisma.show.create({
        data: {
          artistId: testArtist.id,
          date: new Date('1989-07-07'),
          venueId: testVenues[1].id,
          archiveItemIds: ['test-gd1989-07-07'],
          sourceCount: 1
        }
      })
    ]);

    testPerformances = await Promise.all([
      // Show 1: Scarlet -> Fire
      prisma.performance.create({
        data: {
          showId: testShows[0].id,
          songId: testSongs[0].id,
          setNumber: 1,
          positionInSet: 1,
          segueToSongId: testSongs[1].id,
          isOpener: true,
          isCloser: false,
          isEncore: false
        }
      }),
      prisma.performance.create({
        data: {
          showId: testShows[0].id,
          songId: testSongs[1].id,
          setNumber: 1,
          positionInSet: 2,
          isOpener: false,
          isCloser: false,
          isEncore: false
        }
      }),
      prisma.performance.create({
        data: {
          showId: testShows[0].id,
          songId: testSongs[2].id,
          setNumber: 2,
          positionInSet: 1,
          isOpener: false,
          isCloser: true,
          isEncore: true
        }
      }),
      // Show 2: Just Truckin
      prisma.performance.create({
        data: {
          showId: testShows[1].id,
          songId: testSongs[2].id,
          setNumber: 1,
          positionInSet: 1,
          isOpener: true,
          isCloser: true,
          isEncore: false
        }
      })
    ]);

    testRecordings = await Promise.all([
      prisma.recording.create({
        data: {
          showId: testShows[0].id,
          archiveIdentifier: 'test-gd1977-05-08-sbd',
          sourceType: 'SBD',
          format: 'FLAC',
          trackMap: {
            'Test Scarlet Begonias': 'test-track-01.flac',
            'Test Fire on the Mountain': 'test-track-02.flac',
            'Test Truckin': 'test-track-03.flac'
          },
          durationMap: {
            'Test Scarlet Begonias': 420000,
            'Test Fire on the Mountain': 480000,
            'Test Truckin': 360000
          }
        }
      }),
      prisma.recording.create({
        data: {
          showId: testShows[1].id,
          archiveIdentifier: 'test-gd1989-07-07-aud',
          sourceType: 'AUD',
          format: 'FLAC',
          trackMap: {
            'Test Truckin': 'test-track-01.flac'
          },
          durationMap: {
            'Test Truckin': 390000
          }
        }
      })
    ]);

    // Create analyses
    await Promise.all([
      prisma.analysis.create({
        data: {
          performanceId: testPerformances[0].id,
          recordingId: testRecordings[0].id,
          durationMs: 420000,
          bpm: 120.5,
          bpmConfidence: 0.85
        }
      }),
      prisma.analysis.create({
        data: {
          performanceId: testPerformances[1].id,
          recordingId: testRecordings[0].id,
          durationMs: 480000,
          bpm: 118.2,
          bpmConfidence: 0.92
        }
      }),
      prisma.analysis.create({
        data: {
          performanceId: testPerformances[2].id,
          recordingId: testRecordings[0].id,
          durationMs: 360000,
          bpm: 125.8,
          bpmConfidence: 0.78
        }
      }),
      prisma.analysis.create({
        data: {
          performanceId: testPerformances[3].id,
          recordingId: testRecordings[1].id,
          durationMs: 390000,
          bpm: 122.3,
          bpmConfidence: 0.81
        }
      })
    ]);
  });

  afterAll(async () => {
    // Clean up test data
    await prisma.analysis.deleteMany({});
    await prisma.songRollup.deleteMany({});
    await prisma.performance.deleteMany({});
    await prisma.recording.deleteMany({});
    await prisma.show.deleteMany({});
    await prisma.song.deleteMany({});
    await prisma.venue.deleteMany({});
    await prisma.artist.deleteMany({ where: { name: { startsWith: 'Test' } } });
  });

  describe('Song Search API Integration', () => {
    it('should search songs by title from database', async () => {
      const response = await fetch(`http://localhost:3000/api/songs?q=Test%20Scarlet`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.source).toBe('database');
      expect(data.songs).toBeDefined();
      expect(data.songs.length).toBeGreaterThan(0);
      expect(data.songs[0].title).toContain('Test Scarlet');
    });

    it('should search songs by partial title', async () => {
      const response = await fetch(`http://localhost:3000/api/songs?q=scarlet`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.songs).toBeDefined();
      
      if (data.songs.length > 0) {
        expect(data.songs.some((song: any) => song.title.toLowerCase().includes('scarlet'))).toBe(true);
      }
    });

    it('should return empty results for non-existent songs', async () => {
      const response = await fetch(`http://localhost:3000/api/songs?q=NonExistentSong12345`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.songs).toEqual([]);
    });

    it('should return 400 for missing query parameter', async () => {
      const response = await fetch(`http://localhost:3000/api/songs`);
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Query parameter is required');
    });

    it('should limit results based on limit parameter', async () => {
      const response = await fetch(`http://localhost:3000/api/songs?q=Test&limit=2`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.songs.length).toBeLessThanOrEqual(2);
    });
  });

  describe('Song Detail API Integration', () => {
    it('should get song details by slug', async () => {
      const response = await fetch(`http://localhost:3000/api/songs/test-scarlet-begonias`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.song).toBeDefined();
      expect(data.song.title).toBe('Test Scarlet Begonias');
      expect(data.song.slug).toBe('test-scarlet-begonias');
    });

    it('should return 404 for non-existent song slug', async () => {
      const response = await fetch(`http://localhost:3000/api/songs/non-existent-song`);
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Song not found');
    });

    it('should include rollup data in song details', async () => {
      const response = await fetch(`http://localhost:3000/api/songs/test-truckin`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.song).toBeDefined();
      expect(data.counts).toBeDefined();
      expect(data.counts.openers).toBeDefined();
      expect(data.counts.closers).toBeDefined();
      expect(data.counts.encores).toBeDefined();
    });
  });

  describe('Show Detail API Integration', () => {
    it('should get show details by ID', async () => {
      const response = await fetch(`http://localhost:3000/api/shows/${testShows[0].id}`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.show).toBeDefined();
      expect(data.venue).toBeDefined();
      expect(data.setlist).toBeDefined();
      expect(data.recordings).toBeDefined();
      expect(data.eraContext).toBeDefined();
    });

    it('should return 404 for non-existent show ID', async () => {
      const response = await fetch(`http://localhost:3000/api/shows/non-existent-id`);
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Show not found');
    });

    it('should include setlist in correct order', async () => {
      const response = await fetch(`http://localhost:3000/api/shows/${testShows[0].id}`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.setlist).toBeDefined();
      expect(data.setlist.length).toBeGreaterThan(0);
      
      // Check that setlist is ordered by set and position
      const setlist = data.setlist;
      for (let i = 1; i < setlist.length; i++) {
        const prev = setlist[i - 1];
        const curr = setlist[i];
        
        if (prev.setNumber === curr.setNumber) {
          expect(curr.positionInSet).toBeGreaterThan(prev.positionInSet);
        } else {
          expect(curr.setNumber).toBeGreaterThan(prev.setNumber);
        }
      }
    });

    it('should include era context for show date', async () => {
      const response = await fetch(`http://localhost:3000/api/shows/${testShows[0].id}`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.eraContext).toBeDefined();
      expect(data.eraContext.year).toBe('1977');
      expect(data.eraContext.label).toBe('Return + \'77');
      expect(data.eraContext.description).toBeDefined();
    });
  });

  describe('BPM Analysis API Integration', () => {
    it('should store BPM analysis results', async () => {
      const bpmData = {
        performanceId: testPerformances[0].id,
        recordingId: testRecordings[0].id,
        bpm: 130.5,
        bpmConfidence: 0.95,
        durationMs: 425000
      };

      const response = await fetch(`http://localhost:3000/api/analysis/bpm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bpmData)
      });

      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.bpm).toBe(130.5);
      expect(data.bpmConfidence).toBe(0.95);
    });

    it('should return 400 for missing required fields', async () => {
      const response = await fetch(`http://localhost:3000/api/analysis/bpm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ bpm: 120 }) // missing required fields
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should return 404 for non-existent performance or recording', async () => {
      const bpmData = {
        performanceId: 'non-existent-id',
        recordingId: testRecordings[0].id,
        bpm: 130.5,
        bpmConfidence: 0.95
      };

      const response = await fetch(`http://localhost:3000/api/analysis/bpm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bpmData)
      });

      expect(response.status).toBe(404);
    });
  });

  describe('Data Consistency and Relationships', () => {
    it('should maintain referential integrity across all entities', async () => {
      // Test song -> artist relationship
      const song = await prisma.song.findFirst({
        where: { slug: 'test-scarlet-begonias' },
        include: { artist: true }
      });
      expect(song?.artist.name).toBe('Test Grateful Dead');

      // Test performance -> song -> show relationships
      const performance = await prisma.performance.findFirst({
        where: { songId: song?.id },
        include: {
          song: true,
          show: {
            include: { venue: true }
          }
        }
      });
      expect(performance?.song.title).toBe('Test Scarlet Begonias');
      expect(performance?.show.venue?.name).toBe('Test Fillmore West');

      // Test recording -> show relationship
      const recording = await prisma.recording.findFirst({
        where: { showId: performance?.showId },
        include: { show: true }
      });
      expect(recording?.show.id).toBe(performance?.showId);

      // Test analysis -> performance -> recording relationships
      const analysis = await prisma.analysis.findFirst({
        where: { 
          performanceId: performance?.id,
          recordingId: recording?.id
        },
        include: {
          performance: true,
          recording: true
        }
      });
      expect(analysis?.performance.id).toBe(performance?.id);
      expect(analysis?.recording.id).toBe(recording?.id);
    });

    it('should compute song rollups correctly', async () => {
      const response = await fetch(`http://localhost:3000/api/songs/test-truckin`);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      // Truckin appears in both shows
      expect(data.counts.openers).toBe(1); // Only opener in show 2
      expect(data.counts.closers).toBe(2); // Closer in both shows
      expect(data.counts.encores).toBe(1); // Encore in show 1
      
      // Should have debut and last show
      expect(data.debutShow).toBeDefined();
      expect(data.lastShow).toBeDefined();
      
      // Should have BPM data
      expect(data.highestBpm).toBeDefined();
      expect(data.lowestBpm).toBeDefined();
    });
  });

  describe('Error Handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // This test would require mocking the database connection
      // For now, we'll test that the API returns proper error responses
      const response = await fetch(`http://localhost:3000/api/songs/invalid-slug-format-!@#$%`);
      // Should either return 404 or 500, not crash
      expect([404, 500]).toContain(response.status);
    });

    it('should handle malformed JSON in POST requests', async () => {
      const response = await fetch(`http://localhost:3000/api/analysis/bpm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: 'invalid json'
      });

      expect(response.status).toBe(400);
    });
  });
});
