import { describe, it, expect, beforeAll, vi, beforeEach } from 'vitest';

// Mock the ky module before importing anything else
vi.mock('ky', () => {
  const mockGet = vi.fn();
  const mockCreate = vi.fn(() => ({
    get: mockGet
  }));
  
  return {
    default: {
      create: mockCreate
    }
  };
});

// Import after mocking
import { createApiClients } from '../lib/api-clients';

describe('External APIs Integration Tests', () => {
  let apiClients: ReturnType<typeof createApiClients>;

  beforeAll(() => {
    // Load environment variables from .env file
    require('dotenv').config();
  });

  beforeEach(() => {
    // Create fresh API clients for each test
    apiClients = createApiClients();
  });

  describe('Setlist.fm API', () => {
    it('should search for artists and return JSON response', async () => {
      // Mock the response
      const mockResponse = {
        artist: [
          {
            mbid: 'test-mbid-123',
            name: 'Grateful Dead',
            sortName: 'Grateful Dead',
            disambiguation: 'American rock band',
            url: 'https://www.setlist.fm/setlists/grateful-dead-13d6b8c8.html'
          }
        ]
      };

      // Get the mocked ky instance and set up the response
      const { default: ky } = await import('ky');
      const mockClient = (apiClients.setlistFm as any).client;
      
      // Mock the get method to return an object with a json method
      mockClient.get.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse)
      });

      const response = await apiClients.setlistFm.searchArtist('Grateful Dead');
      
      // Verify we get a JSON response
      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
      
      // Check if it has the expected structure for setlist.fm API
      expect(response).toHaveProperty('artist');
      expect(Array.isArray((response as any).artist)).toBe(true);
      expect((response as any).artist[0]).toHaveProperty('mbid');
      expect((response as any).artist[0]).toHaveProperty('name');
      
      console.log('Setlist.fm search response:', JSON.stringify(response, null, 2));
    });

    it('should search for setlists and return JSON response', async () => {
      // Mock the artist search response
      const mockArtistResponse = {
        artist: [
          {
            mbid: 'test-mbid-123',
            name: 'Grateful Dead'
          }
        ]
      };

      // Mock the setlists response
      const mockSetlistsResponse = {
        setlist: [
          {
            id: 'setlist-123',
            versionId: 'version-123',
            eventDate: '1977-05-08',
            lastUpdated: '2023-01-01T00:00:00.000Z',
            artist: {
              mbid: 'test-mbid-123',
              name: 'Grateful Dead'
            },
            venue: {
              id: 'venue-123',
              name: 'Barton Hall',
              city: {
                id: 'city-123',
                name: 'Ithaca',
                state: 'NY',
                stateCode: 'NY',
                country: {
                  code: 'US',
                  name: 'United States'
                }
              }
            },
            sets: {
              set: [
                {
                  name: 'Set 1',
                  song: [
                    {
                      name: 'Scarlet Begonias',
                      info: '->',
                      cover: {
                        mbid: 'cover-mbid-123',
                        name: 'Scarlet Begonias'
                      }
                    }
                  ]
                }
              ]
            }
          }
        ]
      };

      // Mock the ky client responses
      const mockClient = (apiClients.setlistFm as any).client;
      mockClient.get
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValue(mockArtistResponse)
        })
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValue(mockSetlistsResponse)
        });

      // First get an artist ID
      const artistResponse = await apiClients.setlistFm.searchArtist('Grateful Dead');
      expect(artistResponse).toBeDefined();
      
      expect((artistResponse as any)).toHaveProperty('artist');
      expect((artistResponse as any).artist.length).toBeGreaterThan(0);
      const artistId = (artistResponse as any).artist[0].mbid;
      expect(artistId).toBeDefined();
      
      // Now search for setlists
      const setlistsResponse = await apiClients.setlistFm.searchSetlists(artistId);
      
      // Verify we get a JSON response
      expect(setlistsResponse).toBeDefined();
      expect(typeof setlistsResponse).toBe('object');
      expect((setlistsResponse as any)).toHaveProperty('setlist');
      expect(Array.isArray((setlistsResponse as any).setlist)).toBe(true);
      
      console.log('Setlist.fm setlists response:', JSON.stringify(setlistsResponse, null, 2));
    });
  });

  describe('MusicBrainz API', () => {
    it('should search for artists and return JSON response', async () => {
      // Mock the response
      const mockResponse = {
        artists: [
          {
            id: 'test-mbid-123',
            name: 'Grateful Dead',
            'sort-name': 'Grateful Dead',
            disambiguation: 'American rock band',
            country: 'US',
            'begin-date': '1965',
            'end-date': '1995',
            'type': 'Group'
          }
        ],
        count: 1,
        offset: 0
      };

      // Mock the ky client response
      const mockClient = (apiClients.musicbrainz as any).client;
      mockClient.get.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse)
      });

      const response = await apiClients.musicbrainz.searchArtist('Grateful Dead');
      
      // Verify we get a JSON response
      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
      
      // Check if it has the expected structure for MusicBrainz API
      expect(response).toHaveProperty('artists');
      expect(Array.isArray((response as any).artists)).toBe(true);
      expect((response as any).artists[0]).toHaveProperty('id');
      expect((response as any).artists[0]).toHaveProperty('name');
      
      console.log('MusicBrainz search response:', JSON.stringify(response, null, 2));
    });

    it('should get artist details and return JSON response', async () => {
      // Mock the artist search response
      const mockSearchResponse = {
        artists: [
          {
            id: 'test-mbid-123',
            name: 'Grateful Dead'
          }
        ]
      };

      // Mock the artist details response
      const mockArtistResponse = {
        id: 'test-mbid-123',
        name: 'Grateful Dead',
        'sort-name': 'Grateful Dead',
        disambiguation: 'American rock band',
        country: 'US',
        'begin-date': '1965',
        'end-date': '1995',
        'type': 'Group',
        'release-groups': [
          {
            id: 'release-group-123',
            title: 'American Beauty',
            'primary-type': 'Album',
            'first-release-date': '1970-11-01'
          }
        ]
      };

      // Mock the ky client responses
      const mockClient = (apiClients.musicbrainz as any).client;
      mockClient.get
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValue(mockSearchResponse)
        })
        .mockResolvedValueOnce({
          json: vi.fn().mockResolvedValue(mockArtistResponse)
        });

      // First search for an artist
      const searchResponse = await apiClients.musicbrainz.searchArtist('Grateful Dead');
      expect(searchResponse).toBeDefined();
      
      expect((searchResponse as any)).toHaveProperty('artists');
      expect((searchResponse as any).artists.length).toBeGreaterThan(0);
      const artistId = (searchResponse as any).artists[0].id;
      expect(artistId).toBeDefined();
      
      // Now get artist details
      const artistResponse = await apiClients.musicbrainz.getArtist(artistId);
      
      // Verify we get a JSON response
      expect(artistResponse).toBeDefined();
      expect(typeof artistResponse).toBe('object');
      expect((artistResponse as any)).toHaveProperty('id');
      expect((artistResponse as any)).toHaveProperty('name');
      expect((artistResponse as any)).toHaveProperty('release-groups');
      
      console.log('MusicBrainz artist response:', JSON.stringify(artistResponse, null, 2));
    });
  });

  describe('Archive.org API', () => {
    it('should search for shows and return JSON response', async () => {
      // Mock the response
      const mockResponse = {
        response: {
          docs: [
            {
              identifier: 'gd1977-05-08.rolfe.miller.28591.sbeok.flac16',
              title: 'Grateful Dead Live at Barton Hall on 1977-05-08',
              creator: 'Grateful Dead',
              date: '1977-05-08',
              venue: 'Barton Hall',
              city: 'Ithaca',
              state: 'NY',
              country: 'USA',
              source: 'SBD',
              format: 'FLAC'
            }
          ],
          numFound: 1,
          start: 0
        }
      };

      // Mock the ky client response
      const mockClient = (apiClients.archiveOrg as any).client;
      mockClient.get.mockResolvedValue({
        json: vi.fn().mockResolvedValue(mockResponse)
      });

      const response = await apiClients.archiveOrg.searchShows('Grateful Dead');
      
      // Verify we get a JSON response
      expect(response).toBeDefined();
      expect(typeof response).toBe('object');
      expect((response as any)).toHaveProperty('response');
      expect((response as any).response).toHaveProperty('docs');
      expect(Array.isArray((response as any).response.docs)).toBe(true);
      expect((response as any).response.docs[0]).toHaveProperty('identifier');
      expect((response as any).response.docs[0]).toHaveProperty('title');
      
      console.log('Archive.org search response:', JSON.stringify(response, null, 2));
    });
  });
});
