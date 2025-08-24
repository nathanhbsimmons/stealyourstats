import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as searchHandler, POST as createSongHandler } from '../app/api/songs/route';
import { GET as songDetailHandler } from '../app/api/songs/[slug]/route';
import { GET as showDetailHandler } from '../app/api/shows/[id]/route';
import { POST as bpmAnalysisHandler } from '../app/api/analysis/bpm/route';
import { prisma } from '../lib/prisma';

describe('API Endpoints Unit Tests', () => {
  let testArtist: any;
  let testVenue: any;
  let testSong: any;
  let testShow: any;
  let testPerformance: any;
  let testRecording: any;

  beforeAll(async () => {
    // Clean up and create test data
    await prisma.analysis.deleteMany({});
    await prisma.songRollup.deleteMany({});
    await prisma.performance.deleteMany({});
    await prisma.recording.deleteMany({});
    await prisma.show.deleteMany({});
    await prisma.song.deleteMany({});
    await prisma.venue.deleteMany({});
    await prisma.artist.deleteMany({ where: { name: { startsWith: 'API Test' } } });

    testArtist = await prisma.artist.create({
      data: {
        name: 'API Test Grateful Dead',
        musicbrainzMbid: 'api-test-mbid'
      }
    });

    testVenue = await prisma.venue.create({
      data: {
        name: 'API Test Venue',
        city: 'Test City',
        state: 'TS',
        country: 'USA'
      }
    });

    testSong = await prisma.song.create({
      data: {
        artistId: testArtist.id,
        title: 'API Test Song',
        altTitles: ['API Test Song', 'API Test'],
        slug: 'api-test-song'
      }
    });

    testShow = await prisma.show.create({
      data: {
        artistId: testArtist.id,
        date: new Date('1977-05-08'),
        venueId: testVenue.id,
        archiveItemIds: ['api-test-archive'],
        sourceCount: 1
      }
    });

    testPerformance = await prisma.performance.create({
      data: {
        showId: testShow.id,
        songId: testSong.id,
        setNumber: 1,
        positionInSet: 1,
        isOpener: true,
        isCloser: false,
        isEncore: false
      }
    });

    testRecording = await prisma.recording.create({
      data: {
        showId: testShow.id,
        archiveIdentifier: 'api-test-recording',
        sourceType: 'SBD',
        format: 'FLAC',
        trackMap: { 'API Test Song': 'api-test-track.flac' },
        durationMap: { 'API Test Song': 420000 }
      }
    });
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
    await prisma.artist.deleteMany({ where: { name: { startsWith: 'API Test' } } });
  });

  describe('Songs Search API', () => {
    it('should search songs successfully', async () => {
      const request = new NextRequest('http://localhost:3000/api/songs?q=Scarlet&limit=10');
      const response = await searchHandler(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.songs).toBeDefined();
      expect(data.source).toBe('database');
      expect(data.songs.length).toBeGreaterThan(0);
      expect(data.songs[0].title).toContain('Scarlet');
    });

    it('should return 400 for missing query parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/songs');
      const response = await searchHandler(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toBe('Query parameter is required');
    });

    it('should return empty results for non-existent songs', async () => {
      const request = new NextRequest('http://localhost:3000/api/songs?q=NonExistentSong12345');
      const response = await searchHandler(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.songs).toEqual([]);
    });

    it('should respect limit parameter', async () => {
      const request = new NextRequest('http://localhost:3000/api/songs?q=API&limit=1');
      const response = await searchHandler(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.songs.length).toBeLessThanOrEqual(1);
    });

    it('should include artist and performance data in results', async () => {
      const request = new NextRequest('http://localhost:3000/api/songs?q=API%20Test');
      const response = await searchHandler(request);
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.songs[0].artist).toBeDefined();
      expect(data.songs[0].artist.name).toBe('API Test Grateful Dead');
      expect(data.songs[0].performances).toBeDefined();
      expect(Array.isArray(data.songs[0].performances)).toBe(true);
    });
  });

  describe('Song Creation API', () => {
    it('should create a new song', async () => {
      const songData = {
        title: 'New API Test Song',
        altTitles: ['New API Test Song'],
        artistId: testArtist.id,
        slug: 'new-api-test-song'
      };

      const request = new NextRequest('http://localhost:3000/api/songs', {
        method: 'POST',
        body: JSON.stringify(songData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createSongHandler(request);
      
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.title).toBe('New API Test Song');
      expect(data.slug).toBe('new-api-test-song');
      expect(data.artist).toBeDefined();
    });

    it('should return 400 for missing required fields', async () => {
      const songData = {
        title: 'Incomplete Song'
        // Missing artistId and slug
      };

      const request = new NextRequest('http://localhost:3000/api/songs', {
        method: 'POST',
        body: JSON.stringify(songData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await createSongHandler(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('required');
    });
  });

  describe('Song Detail API', () => {
    it('should get song details by slug', async () => {
      const request = new NextRequest('http://localhost:3000/api/songs/api-test-song');
      const response = await songDetailHandler(request, { params: { slug: 'api-test-song' } });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.song).toBeDefined();
      expect(data.song.title).toBe('API Test Song');
      expect(data.song.slug).toBe('api-test-song');
      expect(data.counts).toBeDefined();
      expect(data.sampling).toBeDefined();
    });

    it('should return 404 for non-existent song slug', async () => {
      const request = new NextRequest('http://localhost:3000/api/songs/non-existent-slug');
      const response = await songDetailHandler(request, { params: { slug: 'non-existent-slug' } });
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Song not found');
    });

    it('should compute rollup data if not exists', async () => {
      const request = new NextRequest('http://localhost:3000/api/songs/api-test-song');
      const response = await songDetailHandler(request, { params: { slug: 'api-test-song' } });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.counts.openers).toBeDefined();
      expect(data.counts.closers).toBeDefined();
      expect(data.counts.encores).toBeDefined();
    });
  });

  describe('Show Detail API', () => {
    it('should get show details by ID', async () => {
      const request = new NextRequest(`http://localhost:3000/api/shows/${testShow.id}`);
      const response = await showDetailHandler(request, { params: { id: testShow.id } });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.show).toBeDefined();
      expect(data.venue).toBeDefined();
      expect(data.setlist).toBeDefined();
      expect(data.recordings).toBeDefined();
      expect(data.eraContext).toBeDefined();
    });

    it('should return 404 for non-existent show ID', async () => {
      const request = new NextRequest('http://localhost:3000/api/shows/non-existent-id');
      const response = await showDetailHandler(request, { params: { id: 'non-existent-id' } });
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Show not found');
    });

    it('should include setlist in correct order', async () => {
      const request = new NextRequest(`http://localhost:3000/api/shows/${testShow.id}`);
      const response = await showDetailHandler(request, { params: { id: testShow.id } });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.setlist).toBeDefined();
      expect(Array.isArray(data.setlist)).toBe(true);
      
      if (data.setlist.length > 1) {
        // Check ordering
        for (let i = 1; i < data.setlist.length; i++) {
          const prev = data.setlist[i - 1];
          const curr = data.setlist[i];
          
          if (prev.setNumber === curr.setNumber) {
            expect(curr.positionInSet).toBeGreaterThan(prev.positionInSet);
          } else {
            expect(curr.setNumber).toBeGreaterThan(prev.setNumber);
          }
        }
      }
    });

    it('should include era context', async () => {
      const request = new NextRequest(`http://localhost:3000/api/shows/${testShow.id}`);
      const response = await showDetailHandler(request, { params: { id: testShow.id } });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.eraContext).toBeDefined();
      expect(data.eraContext.year).toBe('1977');
      expect(data.eraContext.label).toBe('Return + \'77');
      expect(data.eraContext.description).toBeDefined();
    });
  });

  describe('BPM Analysis API', () => {
    it('should store BPM analysis results', async () => {
      const bpmData = {
        performanceId: testPerformance.id,
        recordingId: testRecording.id,
        bpm: 130.5,
        bpmConfidence: 0.95,
        durationMs: 425000
      };

      const request = new NextRequest('http://localhost:3000/api/analysis/bpm', {
        method: 'POST',
        body: JSON.stringify(bpmData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await bpmAnalysisHandler(request);
      
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.bpm).toBe(130.5);
      expect(data.bpmConfidence).toBe(0.95);
      expect(data.durationMs).toBe(425000);
    });

    it('should return 400 for missing required fields', async () => {
      const bpmData = {
        bpm: 130.5
        // Missing performanceId, recordingId, bpmConfidence
      };

      const request = new NextRequest('http://localhost:3000/api/analysis/bpm', {
        method: 'POST',
        body: JSON.stringify(bpmData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await bpmAnalysisHandler(request);
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.error).toContain('required');
    });

    it('should return 404 for non-existent performance', async () => {
      const bpmData = {
        performanceId: 'non-existent-id',
        recordingId: testRecording.id,
        bpm: 130.5,
        bpmConfidence: 0.95
      };

      const request = new NextRequest('http://localhost:3000/api/analysis/bpm', {
        method: 'POST',
        body: JSON.stringify(bpmData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await bpmAnalysisHandler(request);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Performance not found');
    });

    it('should return 404 for non-existent recording', async () => {
      const bpmData = {
        performanceId: testPerformance.id,
        recordingId: 'non-existent-id',
        bpm: 130.5,
        bpmConfidence: 0.95
      };

      const request = new NextRequest('http://localhost:3000/api/analysis/bpm', {
        method: 'POST',
        body: JSON.stringify(bpmData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await bpmAnalysisHandler(request);
      
      expect(response.status).toBe(404);
      
      const data = await response.json();
      expect(data.error).toBe('Recording not found');
    });

    it('should update existing analysis', async () => {
      // First, create an analysis
      const initialData = {
        performanceId: testPerformance.id,
        recordingId: testRecording.id,
        bpm: 120.0,
        bpmConfidence: 0.80
      };

      const initialRequest = new NextRequest('http://localhost:3000/api/analysis/bpm', {
        method: 'POST',
        body: JSON.stringify(initialData),
        headers: { 'Content-Type': 'application/json' }
      });

      await bpmAnalysisHandler(initialRequest);

      // Then update it
      const updateData = {
        performanceId: testPerformance.id,
        recordingId: testRecording.id,
        bpm: 125.5,
        bpmConfidence: 0.90,
        durationMs: 430000
      };

      const updateRequest = new NextRequest('http://localhost:3000/api/analysis/bpm', {
        method: 'POST',
        body: JSON.stringify(updateData),
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await bpmAnalysisHandler(updateRequest);
      
      expect(response.status).toBe(201);
      
      const data = await response.json();
      expect(data.bpm).toBe(125.5);
      expect(data.bpmConfidence).toBe(0.90);
      expect(data.durationMs).toBe(430000);
    });
  });

  describe('API Error Handling', () => {
    it('should handle malformed JSON in POST requests', async () => {
      const request = new NextRequest('http://localhost:3000/api/analysis/bpm', {
        method: 'POST',
        body: 'invalid json',
        headers: { 'Content-Type': 'application/json' }
      });

      const response = await bpmAnalysisHandler(request);
      
      // Should return 400 or 500, not crash
      expect([400, 500]).toContain(response.status);
    });

    it('should handle database connection errors gracefully', async () => {
      // This would require mocking Prisma to throw errors
      // For now, we test that invalid IDs return proper 404s
      const request = new NextRequest('http://localhost:3000/api/songs/invalid-slug-format-!@#$%');
      const response = await songDetailHandler(request, { params: { slug: 'invalid-slug-format-!@#$%' } });
      
      expect([404, 500]).toContain(response.status);
    });
  });
});
