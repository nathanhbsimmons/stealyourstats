import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

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

// Mock audio element
class MockAudioElement {
  currentTime = 0;
  duration = 0;
  volume = 1;
  paused = true;
  
  play() {
    this.paused = false;
    return Promise.resolve();
  }
  
  pause() {
    this.paused = true;
  }
  
  addEventListener() {}
  removeEventListener() {}
}

// Mock the handleTrackDoubleClick function
const handleTrackDoubleClick = (
  track: AudioTrack, 
  setSelectedTrack: (track: AudioTrack) => void,
  setAudioUrl: (url: string) => void,
  setShowTrackSelector: (show: boolean) => void,
  setIsPlaying: (playing: boolean) => void,
  audioRef: { current: MockAudioElement | null }
) => {
  setSelectedTrack(track);
  setAudioUrl(track.url);
  setShowTrackSelector(false);
  
  // Auto-play the track after a short delay to ensure audio is loaded
  setTimeout(() => {
    const audio = audioRef.current;
    if (audio) {
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((error) => {
        console.error('Failed to auto-play track:', error);
      });
    }
  }, 100);
};

describe('Auto-Play Functionality', () => {
  let mockAudio: MockAudioElement;
  let selectedTrack: AudioTrack | null = null;
  let audioUrl: string | null = null;
  let showTrackSelector = false;
  let isPlaying = false;

  beforeEach(() => {
    mockAudio = new MockAudioElement();
    selectedTrack = null;
    audioUrl = null;
    showTrackSelector = false;
    isPlaying = false;
    
    // Mock setTimeout to execute immediately
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  const mockTrack: AudioTrack = {
    name: 'Jack Straw',
    title: 'Jack Straw',
    url: 'http://example.com/jack-straw.mp3',
    size: 10600000,
    format: 'VBR MP3',
    duration: 467,
    trackNumber: 6
  };

  const setSelectedTrack = (track: AudioTrack) => {
    selectedTrack = track;
  };

  const setAudioUrl = (url: string) => {
    audioUrl = url;
  };

  const setShowTrackSelector = (show: boolean) => {
    showTrackSelector = show;
  };

  const setIsPlaying = (playing: boolean) => {
    isPlaying = playing;
  };

  describe('Double-Click Auto-Play', () => {
    it('should select track and set audio URL on double-click', () => {
      handleTrackDoubleClick(
        mockTrack,
        setSelectedTrack,
        setAudioUrl,
        setShowTrackSelector,
        setIsPlaying,
        { current: mockAudio }
      );

      expect(selectedTrack).toBe(mockTrack);
      expect(audioUrl).toBe(mockTrack.url);
      expect(showTrackSelector).toBe(false);
    });

    it('should auto-play track after double-click', async () => {
      handleTrackDoubleClick(
        mockTrack,
        setSelectedTrack,
        setAudioUrl,
        setShowTrackSelector,
        setIsPlaying,
        { current: mockAudio }
      );

      // Fast-forward timers to execute setTimeout
      vi.runAllTimers();

      // Wait for the play promise to resolve
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(isPlaying).toBe(true);
      expect(mockAudio.paused).toBe(false);
    });

    it('should handle audio play errors gracefully', async () => {
      // Mock audio that fails to play
      const failingAudio = new MockAudioElement();
      failingAudio.play = () => Promise.reject(new Error('Playback failed'));

      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

      handleTrackDoubleClick(
        mockTrack,
        setSelectedTrack,
        setAudioUrl,
        setShowTrackSelector,
        setIsPlaying,
        { current: failingAudio }
      );

      // Fast-forward timers to execute setTimeout
      vi.runAllTimers();

      // Wait for the play promise to reject
      await new Promise(resolve => setTimeout(resolve, 0));

      expect(consoleSpy).toHaveBeenCalledWith('Failed to auto-play track:', expect.any(Error));
      expect(isPlaying).toBe(false);

      consoleSpy.mockRestore();
    });
  });

  describe('Track Selection State', () => {
    it('should maintain track selection after auto-play', () => {
      handleTrackDoubleClick(
        mockTrack,
        setSelectedTrack,
        setAudioUrl,
        setShowTrackSelector,
        setIsPlaying,
        { current: mockAudio }
      );

      expect(selectedTrack?.name).toBe('Jack Straw');
      expect(selectedTrack?.format).toBe('VBR MP3');
      expect(selectedTrack?.duration).toBe(467);
    });

    it('should close track selector after double-click', () => {
      showTrackSelector = true; // Start with selector open
      
      handleTrackDoubleClick(
        mockTrack,
        setSelectedTrack,
        setAudioUrl,
        setShowTrackSelector,
        setIsPlaying,
        { current: mockAudio }
      );

      expect(showTrackSelector).toBe(false);
    });
  });

  describe('Audio Element Integration', () => {
    it('should use correct audio element reference', () => {
      const audioRef = { current: mockAudio };
      
      handleTrackDoubleClick(
        mockTrack,
        setSelectedTrack,
        setAudioUrl,
        setShowTrackSelector,
        setIsPlaying,
        audioRef
      );

      expect(audioRef.current).toBe(mockAudio);
    });

    it('should handle null audio element gracefully', () => {
      const audioRef = { current: null };
      
      // Should not throw error when audio element is null
      expect(() => {
        handleTrackDoubleClick(
          mockTrack,
          setSelectedTrack,
          setAudioUrl,
          setShowTrackSelector,
          setIsPlaying,
          audioRef
        );
      }).not.toThrow();
    });
  });

  describe('Timing and Delays', () => {
    it('should use setTimeout for auto-play delay', () => {
      const setTimeoutSpy = vi.spyOn(global, 'setTimeout');
      
      handleTrackDoubleClick(
        mockTrack,
        setSelectedTrack,
        setAudioUrl,
        setShowTrackSelector,
        setIsPlaying,
        { current: mockAudio }
      );

      expect(setTimeoutSpy).toHaveBeenCalledWith(expect.any(Function), 100);
      setTimeoutSpy.mockRestore();
    });

    it('should execute auto-play after delay', async () => {
      handleTrackDoubleClick(
        mockTrack,
        setSelectedTrack,
        setAudioUrl,
        setShowTrackSelector,
        setIsPlaying,
        { current: mockAudio }
      );

      // Before timer execution
      expect(isPlaying).toBe(false);

      // Execute timer
      vi.runAllTimers();
      await new Promise(resolve => setTimeout(resolve, 0));

      // After timer execution
      expect(isPlaying).toBe(true);
    });
  });
});
