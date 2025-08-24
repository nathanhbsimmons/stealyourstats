import { describe, it, expect } from 'vitest';

// Mock AudioTrack interface
interface AudioTrack {
  name: string;
  url: string;
  size: number;
  format: string;
  duration?: number;
  trackNumber?: number;
  title?: string;
}

// Mock the getFilteredTracks function
const getFilteredTracks = (tracks: AudioTrack[], format: 'MP3' | 'FLAC') => {
  const filtered = tracks.filter(track => 
    track.format.toUpperCase().includes(format)
  );
  
  // Deduplicate by song name, preferring the selected format
  const uniqueTracks = new Map<string, AudioTrack>();
  
  filtered.forEach(track => {
    const songName = track.title || track.name;
    if (!uniqueTracks.has(songName) || track.format.toUpperCase().includes(format)) {
      uniqueTracks.set(songName, track);
    }
  });
  
  return Array.from(uniqueTracks.values());
};

describe('Format Filtering and Deduplication', () => {
  const mockTracks: AudioTrack[] = [
    {
      name: 'Jack Straw',
      title: 'Jack Straw',
      url: 'http://example.com/jack-straw-flac.flac',
      size: 162600000,
      format: '24BIT FLAC',
      duration: 467,
      trackNumber: 6
    },
    {
      name: 'Jack Straw',
      title: 'Jack Straw',
      url: 'http://example.com/jack-straw-mp3.mp3',
      size: 10600000,
      format: 'VBR MP3',
      duration: 467,
      trackNumber: 6
    },
    {
      name: 'Scarlet Begonias',
      title: 'Scarlet Begonias',
      url: 'http://example.com/scarlet-flac.flac',
      size: 183000000,
      format: '24BIT FLAC',
      duration: 530,
      trackNumber: 7
    },
    {
      name: 'Scarlet Begonias',
      title: 'Scarlet Begonias',
      url: 'http://example.com/scarlet-mp3.mp3',
      size: 11900000,
      format: 'VBR MP3',
      duration: 530,
      trackNumber: 7
    },
    {
      name: 'Deal',
      title: 'Deal',
      url: 'http://example.com/deal-flac.flac',
      size: 152000000,
      format: '24BIT FLAC',
      duration: 456,
      trackNumber: 8
    }
  ];

  describe('MP3 Format Filtering', () => {
    it('should show only MP3 tracks when MP3 format is selected', () => {
      const mp3Tracks = getFilteredTracks(mockTracks, 'MP3');
      
      expect(mp3Tracks).toHaveLength(2);
      expect(mp3Tracks.every(track => track.format.includes('MP3'))).toBe(true);
      expect(mp3Tracks.map(track => track.title)).toEqual(['Jack Straw', 'Scarlet Begonias']);
    });

    it('should eliminate duplicate songs in MP3 format', () => {
      const mp3Tracks = getFilteredTracks(mockTracks, 'MP3');
      const songNames = mp3Tracks.map(track => track.title);
      
      // Should have no duplicates
      expect(new Set(songNames).size).toBe(songNames.length);
      expect(songNames).toHaveLength(2);
    });
  });

  describe('FLAC Format Filtering', () => {
    it('should show only FLAC tracks when FLAC format is selected', () => {
      const flacTracks = getFilteredTracks(mockTracks, 'FLAC');
      
      expect(flacTracks).toHaveLength(3);
      expect(flacTracks.every(track => track.format.includes('FLAC'))).toBe(true);
      expect(flacTracks.map(track => track.title)).toEqual(['Jack Straw', 'Scarlet Begonias', 'Deal']);
    });

    it('should eliminate duplicate songs in FLAC format', () => {
      const flacTracks = getFilteredTracks(mockTracks, 'FLAC');
      const songNames = flacTracks.map(track => track.title);
      
      // Should have no duplicates
      expect(new Set(songNames).size).toBe(songNames.length);
      expect(songNames).toHaveLength(3);
    });
  });

  describe('Format Switching', () => {
    it('should show different track counts for different formats', () => {
      const mp3Tracks = getFilteredTracks(mockTracks, 'MP3');
      const flacTracks = getFilteredTracks(mockTracks, 'FLAC');
      
      expect(mp3Tracks.length).toBeLessThan(flacTracks.length);
      expect(mp3Tracks.length).toBe(2);
      expect(flacTracks.length).toBe(3);
    });

    it('should maintain track numbers and metadata when switching formats', () => {
      const mp3Tracks = getFilteredTracks(mockTracks, 'MP3');
      const flacTracks = getFilteredTracks(mockTracks, 'FLAC');
      
      // Jack Straw should have same track number in both formats
      const jackStrawMp3 = mp3Tracks.find(track => track.title === 'Jack Straw');
      const jackStrawFlac = flacTracks.find(track => track.title === 'Jack Straw');
      
      expect(jackStrawMp3?.trackNumber).toBe(6);
      expect(jackStrawFlac?.trackNumber).toBe(6);
      expect(jackStrawMp3?.duration).toBe(467);
      expect(jackStrawFlac?.duration).toBe(467);
    });
  });

  describe('File Size Differences', () => {
    it('should show significantly different file sizes between MP3 and FLAC', () => {
      const jackStrawMp3 = mockTracks.find(track => track.title === 'Jack Straw' && track.format.includes('MP3'));
      const jackStrawFlac = mockTracks.find(track => track.title === 'Jack Straw' && track.format.includes('FLAC'));
      
      expect(jackStrawMp3?.size).toBe(10600000); // ~10.6 MB
      expect(jackStrawFlac?.size).toBe(162600000); // ~162.6 MB
      
      // FLAC should be much larger than MP3
      expect(jackStrawFlac!.size).toBeGreaterThan(jackStrawMp3!.size * 10);
    });
  });
});
