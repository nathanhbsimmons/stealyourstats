export interface Artist {
  id: string;
  name: string;
  musicbrainzMbid?: string;
}

export interface Venue {
  id: string;
  name: string;
  city?: string;
  state?: string;
  country?: string;
}

export interface Show {
  id: string;
  artistId: string;
  date: string; // ISO date string
  venueId?: string;
  archiveItemIds: string[];
  sourceCount: number;
}

export interface Song {
  id: string;
  artistId: string;
  title: string;
  altTitles: string[];
  slug: string;
}

export interface Performance {
  id: string;
  showId: string;
  songId: string;
  setNumber?: number;
  positionInSet?: number;
  segueToSongId?: string;
  isOpener: boolean;
  isCloser: boolean;
  isEncore: boolean;
}

export interface Recording {
  id: string;
  showId: string;
  archiveIdentifier: string;
  sourceType?: 'SBD' | 'AUD' | 'Matrix';
  format?: string;
  trackMap: Record<string, string>; // track name -> archive identifier
  durationMap: Record<string, number>; // track name -> duration in ms
}

export interface Analysis {
  id: string;
  performanceId: string;
  recordingId: string;
  durationMs?: number;
  bpm?: number;
  bpmConfidence?: number;
  analyzedAt: string;
}

export interface SongRollup {
  songId: string;
  debutShowId: string;
  lastShowId: string;
  longestPerformanceId: string;
  shortestPerformanceId: string;
  highestBpmPerformanceId?: string;
  lowestBpmPerformanceId?: string;
  openerCount: number;
  closerCount: number;
  encoreCount: number;
  avgDurationByYear: Record<string, number>; // year -> avg duration in ms
  computedAt: string;
}

export interface SongDetail {
  song: Song;
  debutShow: Show;
  lastShow: Show;
  longest: Performance & { durationMs: number; show: Show };
  shortest: Performance & { durationMs: number; show: Show };
  highestBpm?: Performance & { bpm: number; bpmConfidence: number; show: Show };
  lowestBpm?: Performance & { bpm: number; bpmConfidence: number; show: Show };
  counts: {
    openers: number;
    closers: number;
    encores: number;
  };
  sampling: {
    avgDurationByYear: Record<string, number>;
  };
  eraHints: Array<{ year: string; label: string }>;
}

export interface ShowDetail {
  show: Show;
  venue: Venue;
  setlist: Array<{
    setNumber: number;
    positionInSet: number;
    songTitle: string;
    segueToSongTitle?: string;
  }>;
  recordings: Recording[];
}

export interface StreamableTrack {
  title: string;
  url: string;
  durationMs?: number;
}

export interface EraLabel {
  year: string;
  label: string;
  description: string;
}

export interface SongIndex {
  songs: SongIndexEntry[];
  lastUpdated: string;
  totalShows: number;
}

export interface SongIndexEntry {
  title: string;
  slug: string;
  altTitles: string[];
  shows: ShowInfo[];
  totalPerformances: number;
  firstPerformance: ShowInfo;
  lastPerformance: ShowInfo;
}

export interface ShowInfo {
  id: string;
  date: string;
  venue: {
    id: string;
    name: string;
    city: string;
    country: string;
  };
  year: number;
  era: string;
}

export interface SetlistSyncInfo {
  lastUpdated: string;
  totalSetlists: number;
  lastSetlistId: string;
}
