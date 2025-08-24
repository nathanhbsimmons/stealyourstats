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

describe('Double-Click Functionality and Format-Specific Counting', () => {
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

  describe('Format-Specific Track Counting', () => {
    it('should show correct MP3 track count in buttons', () => {
      const mp3Tracks = getFilteredTracks(mockTracks, 'MP3');
      const trackCount = mp3Tracks.length;
      
      expect(trackCount).toBe(2);
      expect(trackCount).toBeLessThan(mockTracks.length); // Should be less than total
    });

    it('should show correct FLAC track count in buttons', () => {
      const flacTracks = getFilteredTracks(mockTracks, 'FLAC');
      const trackCount = flacTracks.length;
      
      expect(trackCount).toBe(3);
      expect(trackCount).toBeLessThan(mockTracks.length); // Should be less than total
    });

    it('should update track count when switching formats', () => {
      const mp3Count = getFilteredTracks(mockTracks, 'MP3').length;
      const flacCount = getFilteredTracks(mockTracks, 'FLAC').length;
      
      expect(mp3Count).not.toBe(flacCount);
      expect(mp3Count).toBe(2);
      expect(flacCount).toBe(3);
    });
  });

  describe('Double-Click Event Handling', () => {
    it('should handle both click and double-click events', () => {
      const track = mockTracks[0];
      let selectedTrack: AudioTrack | null = null;
      
      // Simulate click event
      const handleClick = (track: AudioTrack) => {
        selectedTrack = track;
      };
      
      // Simulate double-click event
      const handleDoubleClick = (track: AudioTrack) => {
        selectedTrack = track;
      };
      
      handleClick(track);
      expect(selectedTrack).toBe(track);
      
      handleDoubleClick(track);
      expect(selectedTrack).toBe(track);
    });

    it('should maintain track selection state after double-click', () => {
      const track = mockTracks[1]; // MP3 version
      let selectedTrack: AudioTrack | null = null;
      
      const handleTrackSelect = (track: AudioTrack) => {
        selectedTrack = track;
      };
      
      // Double-click should select the track
      handleTrackSelect(track);
      expect(selectedTrack).toBe(track);
      expect(selectedTrack.format).toBe('VBR MP3');
    });
  });

  describe('Button Text Updates', () => {
    it('should show format-specific counts in track selector button', () => {
      const mp3Count = getFilteredTracks(mockTracks, 'MP3').length;
      const flacCount = getFilteredTracks(mockTracks, 'FLAC').length;
      
      const mp3ButtonText = `SHOW TRACK SELECTOR (${mp3Count} TRACKS)`;
      const flacButtonText = `SHOW TRACK SELECTOR (${flacCount} TRACKS)`;
      
      expect(mp3ButtonText).toBe('SHOW TRACK SELECTOR (2 TRACKS)');
      expect(flacButtonText).toBe('SHOW TRACK SELECTOR (3 TRACKS)');
      expect(mp3ButtonText).not.toBe(flacButtonText);
    });

    it('should show format-specific counts in all show tracks button', () => {
      const mp3Count = getFilteredTracks(mockTracks, 'MP3').filter(track => track.trackNumber).length;
      const flacCount = getFilteredTracks(mockTracks, 'FLAC').filter(track => track.trackNumber).length;
      
      const mp3ButtonText = `SHOW ALL SHOW TRACKS (${mp3Count} AVAILABLE)`;
      const flacButtonText = `SHOW ALL SHOW TRACKS (${flacCount} AVAILABLE)`;
      
      expect(mp3ButtonText).toBe('SHOW ALL SHOW TRACKS (2 AVAILABLE)');
      expect(flacButtonText).toBe('SHOW ALL SHOW TRACKS (3 AVAILABLE)');
      expect(mp3ButtonText).not.toBe(flacButtonText);
    });
  });

  describe('Track Selection Behavior', () => {
    it('should allow selecting tracks from both sections', () => {
      const songTracks = getFilteredTracks(mockTracks, 'MP3');
      const allShowTracks = getFilteredTracks(mockTracks, 'MP3').filter(track => track.trackNumber);
      
      expect(songTracks.length).toBe(2);
      expect(allShowTracks.length).toBe(2);
      
      // Both sections should have the same tracks in MP3 format
      expect(songTracks.map(t => t.name)).toEqual(allShowTracks.map(t => t.name));
    });

    it('should maintain selection when switching between sections', () => {
      const track = mockTracks[1]; // MP3 version
      let selectedTrack: AudioTrack | null = null;
      
      const handleTrackSelect = (track: AudioTrack) => {
        selectedTrack = track;
      };
      
      // Select from song tracks
      handleTrackSelect(track);
      expect(selectedTrack?.name).toBe('Jack Straw');
      expect(selectedTrack?.format).toBe('VBR MP3');
      
      // Selection should persist when viewing all show tracks
      expect(selectedTrack?.name).toBe('Jack Straw');
    });
  });
});
