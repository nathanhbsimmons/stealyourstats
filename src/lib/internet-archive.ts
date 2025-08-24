import { createApiClients } from './api-clients';

export interface ArchiveItem {
  identifier: string;
  title: string;
  date: string;
  creator: string;
  mediatype: string;
  files: ArchiveFile[];
  metadata: {
    title: string;
    date: string;
    creator: string;
    description?: string;
    subject?: string[];
    collection?: string[];
  };
}

export interface ArchiveFile {
  name: string;
  size: number;
  format: string;
  length?: string;
  track?: string;
  title?: string;
  album?: string;
  artist?: string;
}

export interface ShowRecording {
  identifier: string;
  title: string;
  date: string;
  venue?: string;
  audioFiles: AudioTrack[];
  totalDuration: number;
  format: 'FLAC' | 'MP3' | 'VBR' | 'SHN';
}

export interface AudioTrack {
  name: string;
  url: string;
  size: number;
  format: string;
  duration?: number;
  trackNumber?: number;
  title?: string;
}

export interface ShowQuery {
  date: string;
  venue?: string;
  city?: string;
  state?: string;
  songList?: string[];
}

export interface ArchiveCandidate {
  identifier: string;
  title?: string;
  year?: number;
  venue?: string;
  coverage?: string;
  source?: string;
  formats?: string[];
  score: number;
}

export interface ArchiveSearchResult {
  candidates: ArchiveCandidate[];
  bestIdentifier: string | null;
  tracks: AudioTrack[];
}

export class InternetArchiveService {
  private apiClients = createApiClients();

  constructor() {
    console.log('InternetArchiveService initialized - using real Archive.org data with advanced search');
  }

  /**
   * Find Archive.org identifiers for Grateful Dead shows using advanced search
   */
  async findArchiveIdentifier(query: ShowQuery): Promise<ArchiveSearchResult> {
    try {
      // Build the advanced search query
      const base = 'https://archive.org/advancedsearch.php';
      const parts = [
        'collection:GratefulDead',
        `date:${query.date}`,
        `identifier:gd${query.date}*`
      ];

      if (query.venue) {
        parts.push(`(title:"${query.venue}" OR venue:"${query.venue}")`);
      }

      if (query.city) {
        const cityQuery = query.state 
          ? `(coverage:"${query.city}" OR coverage:"${query.city}, ${query.state}")`
          : `coverage:"${query.city}"`;
        parts.push(cityQuery);
      }

      const searchQuery = encodeURIComponent(parts.join(' AND '));
      const fields = ['identifier', 'title', 'year', 'venue', 'coverage', 'format', 'mediatype', 'source'];
      const fl = fields.map(f => `fl[]=${encodeURIComponent(f)}`).join('&');
      
      const url = `${base}?q=${searchQuery}&${fl}&rows=50&page=1&output=json`;
      
      console.log(`Searching Archive.org with query: ${url}`);
      
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`Archive.org search failed: ${response.statusText}`);
      }

      const data = await response.json();
      const docs = data?.response?.docs ?? [];
      
      if (docs.length === 0) {
        console.log(`No shows found for date: ${query.date}`);
        return { candidates: [], bestIdentifier: null, tracks: [] };
      }

      console.log(`Found ${docs.length} candidates for date: ${query.date}`);

      // Score and rank candidates
      const candidates: ArchiveCandidate[] = docs.map((doc: any) => {
        const candidate: ArchiveCandidate = {
          identifier: doc.identifier,
          title: doc.title,
          year: doc.year,
          venue: doc.venue,
          coverage: doc.coverage,
          source: doc.source,
          formats: Array.isArray(doc.format) ? doc.format : [doc.format].filter(Boolean),
          score: 0
        };

        // Scoring rubric
        const datePrefix = `gd${query.date}`;
        if (candidate.identifier?.startsWith(datePrefix)) {
          candidate.score += 50; // Exact date prefix match
        }

        if (query.venue && (
          (candidate.title || '').toLowerCase().includes(query.venue.toLowerCase()) ||
          (candidate.venue || '').toLowerCase() === query.venue.toLowerCase()
        )) {
          candidate.score += 15; // Venue match
        }

        if (query.city && (candidate.coverage || '').toLowerCase().includes(query.city.toLowerCase())) {
          candidate.score += 10; // City match
        }

        if ((candidate.source || '').toLowerCase().includes('sbd') || 
            (candidate.title || '').toLowerCase().includes('sbd') ||
            (candidate.title || '').toLowerCase().includes('ultramatrix')) {
          candidate.score += 8; // SBD/UltraMatrix quality
        }

        if ((candidate.formats || []).some(f => /mp3|ogg/i.test(f))) {
          candidate.score += 5; // Streamable formats
        }

        return candidate;
      });

      // Sort by score (highest first)
      candidates.sort((a, b) => b.score - a.score);
      
      console.log(`Top candidates:`, candidates.slice(0, 3).map(c => ({
        identifier: c.identifier,
        score: c.score,
        title: c.title
      })));

      const bestIdentifier = candidates[0]?.identifier;

      if (!bestIdentifier) {
        return { candidates, bestIdentifier: null, tracks: [] };
      }

      // Fetch metadata for the best candidate
      const tracks = await this.fetchShowTracks(bestIdentifier);

      return { candidates, bestIdentifier, tracks };

    } catch (error) {
      console.error('Archive.org search failed:', error);
      throw error;
    }
  }

  /**
   * Fetch show tracks from Archive.org metadata API
   */
  private async fetchShowTracks(identifier: string): Promise<AudioTrack[]> {
    try {
      const metadataUrl = `https://archive.org/metadata/${identifier}`;
      const response = await fetch(metadataUrl);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch metadata: ${response.statusText}`);
      }

      const data: ArchiveItem = await response.json();
      
      if (!data.files || data.files.length === 0) {
        return [];
      }

      // Filter for audio files and convert to AudioTrack format
      const audioFiles = data.files.filter(file => 
        file.format && (
          file.format.toLowerCase().includes('mp3') ||
          file.format.toLowerCase().includes('ogg') ||
          file.format.toLowerCase().includes('flac') ||
          file.format.toLowerCase().includes('shn') ||
          file.format.toLowerCase().includes('vbr')
        )
      );

      if (audioFiles.length === 0) {
        return [];
      }

      const audioTracks: AudioTrack[] = audioFiles.map(file => ({
        name: file.name,
        url: this.getStreamingUrl(identifier, file.name),
        size: file.size,
        format: file.format,
        duration: file.length ? this.parseDuration(file.length) : undefined,
        trackNumber: file.track ? parseInt(file.track) : undefined,
        title: file.title || file.name
      }));

      console.log(`Found ${audioTracks.length} audio tracks for ${identifier}`);
      return audioTracks;

    } catch (error) {
      console.error(`Failed to fetch tracks for ${identifier}:`, error);
      return [];
    }
  }

  /**
   * Search for Grateful Dead shows by date (legacy method - now uses findArchiveIdentifier)
   */
  async searchShowsByDate(date: string): Promise<ShowRecording[]> {
    try {
      const result = await this.findArchiveIdentifier({ date });
      
      if (!result.bestIdentifier || result.tracks.length === 0) {
        return [];
      }

      // Convert to ShowRecording format for backward compatibility
      const showRecording: ShowRecording = {
        identifier: result.bestIdentifier,
        title: result.candidates[0]?.title || `Grateful Dead - ${date}`,
        date: date,
        venue: result.candidates[0]?.venue,
        audioFiles: result.tracks,
        totalDuration: result.tracks.reduce((sum, track) => sum + (track.duration || 0), 0),
        format: this.determineFormat(result.tracks)
      };

      return [showRecording];

    } catch (error) {
      console.error('Archive.org search failed:', error);
      return [];
    }
  }

  /**
   * Get detailed information about a specific show
   */
  async getShowDetails(identifier: string): Promise<ShowRecording | null> {
    try {
      const tracks = await this.fetchShowTracks(identifier);
      
      if (tracks.length === 0) {
        return null;
      }

      // Get basic metadata from the identifier
      const dateMatch = identifier.match(/gd(\d{4})-(\d{2})-(\d{2})/);
      const date = dateMatch ? `${dateMatch[1]}-${dateMatch[2]}-${dateMatch[3]}` : 'Unknown Date';

      return {
        identifier,
        title: `Grateful Dead - ${date}`,
        date,
        venue: undefined,
        audioFiles: tracks,
        totalDuration: tracks.reduce((sum, track) => sum + (track.duration || 0), 0),
        format: this.determineFormat(tracks)
      };

    } catch (error) {
      console.error(`Failed to get show details for ${identifier}:`, error);
      return null;
    }
  }

  /**
   * Find all available audio files for a specific song from a show
   */
  async findAllSongTracks(showIdentifier: string, songTitle: string): Promise<AudioTrack[]> {
    try {
      const showDetails = await this.getShowDetails(showIdentifier);
      if (!showDetails) {
        return [];
      }
      
      // Find all tracks that match the song title
      const matchingTracks = showDetails.audioFiles.filter(track => {
        const trackTitle = track.title?.toLowerCase() || track.name.toLowerCase();
        const songTitleLower = songTitle.toLowerCase();
        
        return trackTitle.includes(songTitleLower) || 
               songTitleLower.includes(trackTitle) ||
               this.isSimilarTitle(trackTitle, songTitleLower);
      });
      
      if (matchingTracks.length > 0) {
        // Sort by format preference (MP3 first for streaming) and then by track number
        return matchingTracks.sort((a, b) => {
          // Prioritize MP3
          const aIsMp3 = a.format.toLowerCase().includes('mp3');
          const bIsMp3 = b.format.toLowerCase().includes('mp3');
          if (aIsMp3 && !bIsMp3) return -1;
          if (!aIsMp3 && bIsMp3) return 1;
          
          // Then sort by track number if available
          if (a.trackNumber && b.trackNumber) {
            return a.trackNumber - b.trackNumber;
          }
          
          // Finally by duration (shorter first for faster loading)
          if (a.duration && b.duration) {
            return a.duration - b.duration;
          }
          
          return 0;
        });
      }
      
      // If no exact match, return all audio files for the show
      return showDetails.audioFiles.sort((a, b) => {
        const aIsMp3 = a.format.toLowerCase().includes('mp3');
        const bIsMp3 = b.format.toLowerCase().includes('mp3');
        if (aIsMp3 && !bIsMp3) return -1;
        if (!aIsMp3 && bIsMp3) return 1;
        return 0;
      });
      
    } catch (error) {
      console.error(`Failed to find song tracks for ${songTitle} in ${showIdentifier}:`, error);
      return [];
    }
  }

  /**
   * Find the best audio file for a specific song from a show
   */
  async findSongAudio(showIdentifier: string, songTitle: string): Promise<AudioTrack | null> {
    try {
      const showDetails = await this.getShowDetails(showIdentifier);
      if (!showDetails) {
        return null;
      }
      
      // Try to find a track that matches the song title
      const matchingTracks = showDetails.audioFiles.filter(track => {
        const trackTitle = track.title?.toLowerCase() || track.name.toLowerCase();
        const songTitleLower = songTitle.toLowerCase();
        
        return trackTitle.includes(songTitleLower) || 
               songTitleLower.includes(trackTitle) ||
               this.isSimilarTitle(trackTitle, songTitleLower);
      });
      
      if (matchingTracks.length > 0) {
        // Prioritize MP3 over FLAC for streaming
        const mp3Track = matchingTracks.find(track => 
          track.format.toLowerCase().includes('mp3')
        );
        
        if (mp3Track) {
          return mp3Track;
        }
        
        // Return the first matching track if no MP3 found
        return matchingTracks[0];
      }
      
      // If no exact match, prioritize MP3 files for streaming
      const mp3Track = showDetails.audioFiles.find(track => 
        track.format.toLowerCase().includes('mp3')
      );
      
      if (mp3Track) {
        return mp3Track;
      }
      
      // Return the first available audio file
      return showDetails.audioFiles[0] || null;
      
    } catch (error) {
      console.error(`Failed to find song audio for ${songTitle} in ${showIdentifier}:`, error);
      return null;
    }
  }

  /**
   * Get streaming URL for an audio file
   */
  getStreamingUrl(identifier: string, fileName: string): string {
    return `https://archive.org/download/${identifier}/${encodeURIComponent(fileName)}`;
  }

  /**
   * Parse duration string to seconds
   */
  private parseDuration(durationStr: string): number {
    if (durationStr.includes(':')) {
      const parts = durationStr.split(':').map(Number);
      if (parts.length === 2) {
        return parts[0] * 60 + parts[1];
      } else if (parts.length === 3) {
        return parts[0] * 3600 + parts[1] * 60 + parts[2];
      }
    }
    return 0;
  }

  /**
   * Determine the primary format of the show
   */
  private determineFormat(audioFiles: AudioTrack[]): 'FLAC' | 'MP3' | 'VBR' | 'SHN' {
    const formatCounts: Record<string, number> = {};
    
    audioFiles.forEach(file => {
      const format = file.format.toLowerCase();
      if (format.includes('mp3')) formatCounts.mp3 = (formatCounts.mp3 || 0) + 1;
      else if (format.includes('flac')) formatCounts.flac = (formatCounts.flac || 0) + 1;
      else if (format.includes('shn')) formatCounts.shn = (formatCounts.shn || 0) + 1;
      else if (format.includes('vbr')) formatCounts.vbr = (formatCounts.vbr || 0) + 1;
    });
    
    // Prioritize MP3 for streaming, then return the most common format
    if (formatCounts.mp3 && formatCounts.mp3 > 0) {
      return 'MP3';
    }
    
    // Return the most common format
    const maxCount = Math.max(...Object.values(formatCounts));
    for (const [format, count] of Object.entries(formatCounts)) {
      if (count === maxCount) {
        return format.toUpperCase() as 'FLAC' | 'MP3' | 'VBR' | 'SHN';
      }
    }
    
    return 'MP3'; // Default fallback
  }

  /**
   * Check if two titles are similar (for song matching)
   */
  private isSimilarTitle(trackTitle: string, songTitle: string): boolean {
    const trackWords = trackTitle.split(/\s+/);
    const songWords = songTitle.split(/\s+/);
    
    const commonWords = trackWords.filter(word => 
      songWords.some(songWord => 
        word.length > 2 && songWord.length > 2 && 
        (word.includes(songWord) || songWord.includes(word))
      )
    );
    
    return commonWords.length >= Math.min(trackWords.length, songWords.length) * 0.5;
  }
}

export const internetArchiveService = new InternetArchiveService();
