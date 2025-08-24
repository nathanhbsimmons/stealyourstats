import { describe, it, expect, vi, beforeEach, afterEach, beforeAll, afterAll } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Search from '../components/Search';
import SongDetail from '../components/SongDetail';
import ShowDetail from '../components/ShowDetail';
import AudioPlayer from '../components/AudioPlayer';
import { Song, Show } from '../types';

// Store original fetch to restore it later
let originalFetch: typeof global.fetch;

// Mock fetch only for these tests
const mockFetch = vi.fn();

beforeAll(() => {
  // Store the original fetch
  originalFetch = global.fetch;
  // Set the mock fetch
  global.fetch = mockFetch;
});

afterAll(() => {
  // Restore the original fetch
  global.fetch = originalFetch;
});

// Mock song data
const mockSong: Song = {
  id: 'test-song-1',
  artistId: 'test-artist-1',
  title: 'Test Scarlet Begonias',
  altTitles: ['Test Scarlet Begonias', 'Test Scarlet'],
  slug: 'test-scarlet-begonias'
};

const mockShow: Show = {
  id: 'test-show-1',
  artistId: 'test-artist-1',
  date: '1977-05-08T00:00:00.000Z',
  venueId: 'test-venue-1',
  archiveItemIds: ['test-archive-1'],
  sourceCount: 2
};

const mockSearchResponse = {
  songs: [mockSong],
  source: 'database'
};

const mockSongDetailResponse = {
  song: mockSong,
  debutShow: {
    id: 'debut-show',
    date: '1974-06-18T00:00:00.000Z',
    venue: { name: 'Test Venue', city: 'Test City' }
  },
  lastShow: {
    id: 'last-show',
    date: '1995-07-09T00:00:00.000Z',
    venue: { name: 'Test Last Venue', city: 'Test Last City' }
  },
  longest: {
    id: 'longest-perf',
    durationMs: 720000,
    show: {
      id: 'longest-show',
      date: '1977-05-08T00:00:00.000Z',
      venue: { name: 'Longest Venue', city: 'Longest City' }
    }
  },
  shortest: {
    id: 'shortest-perf',
    durationMs: 300000,
    show: {
      id: 'shortest-show',
      date: '1969-02-27T00:00:00.000Z',
      venue: { name: 'Shortest Venue', city: 'Shortest City' }
    }
  },
  highestBpm: {
    id: 'highest-bpm-perf',
    bpm: 140.5,
    bpmConfidence: 0.95,
    show: {
      id: 'highest-bpm-show',
      date: '1977-05-08T00:00:00.000Z',
      venue: { name: 'Highest BPM Venue', city: 'Highest BPM City' }
    }
  },
  lowestBpm: {
    id: 'lowest-bpm-perf',
    bpm: 110.2,
    bpmConfidence: 0.88,
    show: {
      id: 'lowest-bpm-show',
      date: '1974-06-18T00:00:00.000Z',
      venue: { name: 'Lowest BPM Venue', city: 'Lowest BPM City' }
    }
  },
  counts: {
    openers: 5,
    closers: 3,
    encores: 1
  },
  sampling: {
    avgDurationByYear: {
      '1974': 360000,
      '1977': 420000,
      '1989': 480000
    }
  },
  eraHints: [
    { year: '1974', label: 'Wall of Sound' },
    { year: '1977', label: 'Return + \'77' },
    { year: '1989', label: 'Brent (late)' }
  ]
};

const mockShowDetailResponse = {
  show: mockShow,
  venue: {
    id: 'test-venue-1',
    name: 'Test Fillmore West',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA'
  },
  setlist: [
    {
      setNumber: 1,
      positionInSet: 1,
      songTitle: 'Test Scarlet Begonias',
      segueToSongTitle: 'Test Fire on the Mountain',
      isOpener: true,
      isCloser: false,
      isEncore: false
    },
    {
      setNumber: 1,
      positionInSet: 2,
      songTitle: 'Test Fire on the Mountain',
      segueToSongTitle: null,
      isOpener: false,
      isCloser: false,
      isEncore: false
    },
    {
      setNumber: 2,
      positionInSet: 1,
      songTitle: 'Test Truckin',
      segueToSongTitle: null,
      isOpener: false,
      isCloser: true,
      isEncore: true
    }
  ],
  recordings: [
    {
      id: 'test-recording-1',
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
      },
      streamable: true
    }
  ],
  eraContext: {
    year: '1977',
    label: 'Return + \'77',
    description: 'The return from hiatus and the legendary 1977 tour, considered by many to be the Dead\'s peak year.'
  }
};

describe('UI Component Integration Tests', () => {
  beforeEach(() => {
    mockFetch.mockClear();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Search Component', () => {
    it('should render search input and handle user input', async () => {
      const mockOnSongSelect = vi.fn();
      
      render(<Search onSongSelect={mockOnSongSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Type a song title...');
      expect(searchInput).toBeInTheDocument();
      
      // Test typing in search input
      await userEvent.type(searchInput, 'scarlet');
      expect(searchInput).toHaveValue('scarlet');
    });

    it('should make API call when search button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      });

      const mockOnSongSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<Search onSongSelect={mockOnSongSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Type a song title...');
      const searchButton = screen.getByText('SEARCH');
      
      // Type in search input
      await user.type(searchInput, 'scarlet');
      
      // Click search button
      await user.click(searchButton);
      
      // Verify API call was made
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/songs?q=scarlet&limit=20')
      );
    });

    it('should display search results after API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      });

      const mockOnSongSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<Search onSongSelect={mockOnSongSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Type a song title...');
      const searchButton = screen.getByText('SEARCH');
      
      await user.type(searchInput, 'scarlet');
      await user.click(searchButton);
      
      // Wait for results to appear
      await waitFor(() => {
        expect(screen.getByText('Test Scarlet Begonias')).toBeInTheDocument();
      });
      
      expect(screen.getByText(/SEARCH RESULTS \(1\)/)).toBeInTheDocument();
      expect(screen.getByText(/Source: DATABASE/)).toBeInTheDocument();
    });

    it('should call onSongSelect when user clicks on search result', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSearchResponse
      });

      const mockOnSongSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<Search onSongSelect={mockOnSongSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Type a song title...');
      const searchButton = screen.getByText('SEARCH');
      
      await user.type(searchInput, 'scarlet');
      await user.click(searchButton);
      
      // Wait for results to appear and click on first result
      await waitFor(() => {
        expect(screen.getByText('Test Scarlet Begonias')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('Test Scarlet Begonias'));
      
      expect(mockOnSongSelect).toHaveBeenCalledWith(mockSong);
    });

    it('should display loading state during search', async () => {
      // Mock a delayed response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockSearchResponse
          }), 100)
        )
      );

      const mockOnSongSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<Search onSongSelect={mockOnSongSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Type a song title...');
      const searchButton = screen.getByText('SEARCH');
      
      await user.type(searchInput, 'scarlet');
      await user.click(searchButton);
      
      // Should show loading state
      await waitFor(() => {
        expect(screen.getByText('SEARCHING...')).toBeInTheDocument();
      });
    });

    it('should display error state when API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const mockOnSongSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<Search onSongSelect={mockOnSongSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Type a song title...');
      await user.type(searchInput, 'scarlet');
      
      // Should show error state
      await waitFor(() => {
        expect(screen.getByText(/ERROR:/)).toBeInTheDocument();
      });
    });

    it('should clear search when clear button is clicked', async () => {
      const mockOnSongSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<Search onSongSelect={mockOnSongSelect} />);
      
      const searchInput = screen.getByPlaceholderText('Type a song title...');
      await user.type(searchInput, 'scarlet');
      
      const clearButton = screen.getByText('CLEAR');
      await user.click(clearButton);
      
      expect(searchInput).toHaveValue('');
    });

    it('should display quick links when no search query', () => {
      const mockOnSongSelect = vi.fn();
      
      render(<Search onSongSelect={mockOnSongSelect} />);
      
      expect(screen.getByText('SCARLET BEGONIAS')).toBeInTheDocument();
      expect(screen.getByText('FIRE ON THE MOUNTAIN')).toBeInTheDocument();
      expect(screen.getByText('TRUCKIN\'')).toBeInTheDocument();
    });

    it('should handle quick link clicks', async () => {
      const mockOnSongSelect = vi.fn();
      const user = userEvent.setup();
      
      render(<Search onSongSelect={mockOnSongSelect} />);
      
      await user.click(screen.getByText('SCARLET BEGONIAS'));
      
      expect(mockOnSongSelect).toHaveBeenCalledWith(
        expect.objectContaining({
          title: 'Scarlet Begonias',
          slug: 'scarlet-begonias'
        })
      );
    });
  });

  describe('SongDetail Component', () => {
    it('should make API call to fetch song details on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSongDetailResponse
      });

      const mockOnBack = vi.fn();
      const mockOnShowSelect = vi.fn();
      
      render(
        <SongDetail 
          song={mockSong} 
          onBack={mockOnBack} 
          onShowSelect={mockOnShowSelect} 
        />
      );
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/songs/test-scarlet-begonias');
      });
    });

    it('should display song details after API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSongDetailResponse
      });

      const mockOnBack = vi.fn();
      const mockOnShowSelect = vi.fn();
      
      render(
        <SongDetail 
          song={mockSong} 
          onBack={mockOnBack} 
          onShowSelect={mockOnShowSelect} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('Test Scarlet Begonias')).toBeInTheDocument();
      });

      // Check debut/last show info
      expect(screen.getByText(/DEBUT:/)).toBeInTheDocument();
      expect(screen.getByText(/LAST PLAYED:/)).toBeInTheDocument();
      
      // Check counts
      expect(screen.getByText(/OPENER: 5 times/)).toBeInTheDocument();
      expect(screen.getByText(/CLOSER: 3 times/)).toBeInTheDocument();
      expect(screen.getByText(/ENCORE: 1 times/)).toBeInTheDocument();
    });

    it('should display BPM information when available', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSongDetailResponse
      });

      const mockOnBack = vi.fn();
      const mockOnShowSelect = vi.fn();
      
      render(
        <SongDetail 
          song={mockSong} 
          onBack={mockOnBack} 
          onShowSelect={mockOnShowSelect} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/HIGHEST BPM: 140.5/)).toBeInTheDocument();
        expect(screen.getByText(/LOWEST BPM: 110.2/)).toBeInTheDocument();
      });
    });

    it('should call onBack when back button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockSongDetailResponse
      });

      const mockOnBack = vi.fn();
      const mockOnShowSelect = vi.fn();
      const user = userEvent.setup();
      
      render(
        <SongDetail 
          song={mockSong} 
          onBack={mockOnBack} 
          onShowSelect={mockOnShowSelect} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText('← BACK TO SEARCH')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('← BACK TO SEARCH'));
      
      expect(mockOnBack).toHaveBeenCalled();
    });

    it('should display loading state while fetching', async () => {
      // Mock a delayed response
      mockFetch.mockImplementationOnce(() => 
        new Promise(resolve => 
          setTimeout(() => resolve({
            ok: true,
            json: async () => mockSongDetailResponse
          }), 100)
        )
      );

      const mockOnBack = vi.fn();
      const mockOnShowSelect = vi.fn();
      
      render(
        <SongDetail 
          song={mockSong} 
          onBack={mockOnBack} 
          onShowSelect={mockOnShowSelect} 
        />
      );
      
      expect(screen.getByText('Loading song details...')).toBeInTheDocument();
    });

    it('should display error state when API call fails', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network error'));

      const mockOnBack = vi.fn();
      const mockOnShowSelect = vi.fn();
      
      render(
        <SongDetail 
          song={mockSong} 
          onBack={mockOnBack} 
          onShowSelect={mockOnShowSelect} 
        />
      );
      
      await waitFor(() => {
        expect(screen.getByText(/Error loading song details/)).toBeInTheDocument();
      });
    });
  });

  describe('ShowDetail Component', () => {
    it('should make API call to fetch show details on mount', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShowDetailResponse
      });

      const mockOnBack = vi.fn();
      
      render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(mockFetch).toHaveBeenCalledWith('/api/shows/test-show-1');
      });
    });

    it('should display show details after API call', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShowDetailResponse
      });

      const mockOnBack = vi.fn();
      
      render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('Test Fillmore West')).toBeInTheDocument();
      });

      expect(screen.getByText('San Francisco, CA')).toBeInTheDocument();
      expect(screen.getByText(/Return \+ '77/)).toBeInTheDocument();
    });

    it('should display setlist in correct order', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShowDetailResponse
      });

      const mockOnBack = vi.fn();
      
      render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('SETLIST')).toBeInTheDocument();
      });

      // Check that songs appear in setlist
      expect(screen.getByText('Test Scarlet Begonias')).toBeInTheDocument();
      expect(screen.getByText('Test Fire on the Mountain')).toBeInTheDocument();
      expect(screen.getByText('Test Truckin')).toBeInTheDocument();
      
      // Check for segue indicator
      expect(screen.getByText('→')).toBeInTheDocument();
    });

    it('should call onBack when back button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => mockShowDetailResponse
      });

      const mockOnBack = vi.fn();
      const user = userEvent.setup();
      
      render(<ShowDetail show={mockShow} onBack={mockOnBack} />);
      
      await waitFor(() => {
        expect(screen.getByText('← BACK TO SONG')).toBeInTheDocument();
      });
      
      await user.click(screen.getByText('← BACK TO SONG'));
      
      expect(mockOnBack).toHaveBeenCalled();
    });
  });

  describe('AudioPlayer Component', () => {
    beforeEach(() => {
      // Mock HTMLAudioElement
      Object.defineProperty(global, 'HTMLAudioElement', {
        writable: true,
        value: vi.fn().mockImplementation(() => ({
          addEventListener: vi.fn(),
          removeEventListener: vi.fn(),
          play: vi.fn().mockResolvedValue(undefined),
          pause: vi.fn(),
          currentTime: 0,
          duration: 300,
          volume: 0.7,
          src: '',
          load: vi.fn()
        }))
      });
    });

    it('should render audio player with controls', () => {
      render(
        <AudioPlayer 
          trackName="Test Track" 
          duration={300000}
          performanceId="test-perf-1"
          recordingId="test-rec-1"
        />
      );
      
      expect(screen.getByText('Test Track')).toBeInTheDocument();
      expect(screen.getByText('⏯')).toBeInTheDocument(); // Play/pause button
      expect(screen.getByText('⏮')).toBeInTheDocument(); // Skip backward
      expect(screen.getByText('⏭')).toBeInTheDocument(); // Skip forward
    });

    it('should display BPM estimate button when no existing BPM', () => {
      render(
        <AudioPlayer 
          trackName="Test Track" 
          duration={300000}
          performanceId="test-perf-1"
          recordingId="test-rec-1"
        />
      );
      
      expect(screen.getByText('ESTIMATE BPM')).toBeInTheDocument();
    });

    it('should display existing BPM when provided', () => {
      render(
        <AudioPlayer 
          trackName="Test Track" 
          duration={300000}
          performanceId="test-perf-1"
          recordingId="test-rec-1"
          existingBpm={120.5}
          existingBpmConfidence={0.85}
        />
      );
      
      expect(screen.getByText(/BPM: 120.5/)).toBeInTheDocument();
      expect(screen.getByText(/Confidence: 85%/)).toBeInTheDocument();
    });

    it('should handle BPM estimation when button is clicked', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        json: async () => ({ bpm: 125.3, bpmConfidence: 0.92 })
      });

      const user = userEvent.setup();
      
      render(
        <AudioPlayer 
          trackName="Test Track" 
          duration={300000}
          performanceId="test-perf-1"
          recordingId="test-rec-1"
        />
      );
      
      await user.click(screen.getByText('ESTIMATE BPM'));
      
      // Should show estimating state
      expect(screen.getByText('ESTIMATING...')).toBeInTheDocument();
    });
  });
});

// Mock @testing-library/react
vi.mock('@testing-library/react', async () => {
  const actual = await vi.importActual('@testing-library/react');
  return {
    ...actual,
    render: vi.fn().mockImplementation(() => ({
      container: document.createElement('div'),
      baseElement: document.createElement('div'),
      debug: vi.fn(),
      rerender: vi.fn(),
      unmount: vi.fn(),
      asFragment: vi.fn(),
      getByText: vi.fn(),
      queryByText: vi.fn(),
      findByText: vi.fn()
    }))
  };
});

// Mock @testing-library/user-event
vi.mock('@testing-library/user-event', () => ({
  default: {
    setup: vi.fn().mockReturnValue({
      type: vi.fn(),
      click: vi.fn()
    })
  }
}));

// Mock screen object
const mockScreen = {
  getByText: vi.fn(),
  getByPlaceholderText: vi.fn(),
  queryByText: vi.fn(),
  findByText: vi.fn()
};

vi.mock('@testing-library/react', async () => {
  const actual = await vi.importActual('@testing-library/react');
  return {
    ...actual,
    screen: mockScreen
  };
});
