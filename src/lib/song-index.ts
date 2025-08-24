import { SongIndex, SongIndexEntry, ShowInfo, SetlistSyncInfo } from '@/types';
import { createApiClients } from './api-clients';

const GRATEFUL_DEAD_MBID = '6faa7ca7-0d99-4a5e-bfa6-1fd5037520c6';
const INDEX_FILE_PATH = './data/song-index.json';
const SYNC_INFO_PATH = './data/sync-info.json';

export class SongIndexService {
  private apiClients: ReturnType<typeof createApiClients> | null = null;
  private songIndex: SongIndex | null = null;
  private syncInfo: SetlistSyncInfo | null = null;

  constructor() {
    this.loadIndex();
    this.loadSyncInfo();
  }

  private getApiClients() {
    if (!this.apiClients) {
      this.apiClients = createApiClients();
    }
    return this.apiClients;
  }

  // Load existing index from file
  private loadIndex() {
    try {
      // In a real app, this would load from a database
      // For now, we'll start fresh each time
      this.songIndex = null;
      
      // Try to load test index if no real index exists
      this.loadTestIndex();
    } catch (error) {
      console.log('No existing index found, will create new one');
      this.songIndex = null;
      
      // Try to load test index
      this.loadTestIndex();
    }
  }

  // Load test index for development/testing
  private loadTestIndex() {
    try {
      const fs = require('fs');
      const path = require('path');
      const testIndexPath = path.join(process.cwd(), 'data', 'test-index.json');
      
      if (fs.existsSync(testIndexPath)) {
        const testData = fs.readFileSync(testIndexPath, 'utf8');
        this.songIndex = JSON.parse(testData);
        console.log('📚 Loaded test index with', this.songIndex.songs.length, 'songs');
      } else {
        console.log('📚 No test index found at:', testIndexPath);
      }
    } catch (error) {
      console.log('📚 Could not load test index:', error.message);
    }
  }

  // Load sync info from file
  private loadSyncInfo() {
    try {
      // In a real app, this would load from a database
      // For now, we'll start fresh each time
      this.syncInfo = null;
    } catch (error) {
      console.log('No existing sync info found, will create new one');
      this.syncInfo = null;
    }
  }

  // Build the complete song index (one-time operation)
  async buildIndex(): Promise<SongIndex> {
    console.log('Building complete song index...');
    
    const songMap = new Map<string, SongIndexEntry>();
    let totalShows = 0;
    
    // Start with just ONE year to test the approach
    const testYears = [1977]; // Grateful Dead's peak year
    
    for (const year of testYears) {
      console.log(`Processing year ${year}...`);
      
      try {
        // Get setlists for this year (limit pages to avoid rate limits)
        for (let page = 1; page <= 2; page++) { // Reduced to just 2 pages
          try {
            console.log(`  Searching year ${year}, page ${page}...`);
            
            const setlistsResponse = await this.getApiClients().setlistFm.getArtistSetlists(
              GRATEFUL_DEAD_MBID, 
              page,
              year
            );
            
            if (!setlistsResponse.setlist || setlistsResponse.setlist.length === 0) {
              console.log(`    No setlists found on page ${page}, moving to next year`);
              break;
            }
            
            console.log(`    Found ${setlistsResponse.setlist.length} setlists on page ${page}`);
            
            // Process each setlist
            setlistsResponse.setlist.forEach((setlist: any) => {
              if (setlist.sets?.set) {
                setlist.sets.set.forEach((set: any) => {
                  if (set.song) {
                    set.song.forEach((song: any) => {
                      const songTitle = song.name;
                      const songSlug = this.createSlug(songTitle);
                      
                      // Create or update song entry
                      if (!songMap.has(songSlug)) {
                        songMap.set(songSlug, {
                          title: songTitle,
                          slug: songSlug,
                          altTitles: [songTitle],
                          shows: [],
                          totalPerformances: 0,
                          firstPerformance: null as any,
                          lastPerformance: null as any
                        });
                      }
                      
                      const songEntry = songMap.get(songSlug)!;
                      
                      // Add show info
                      const showInfo: ShowInfo = {
                        id: setlist.id,
                        date: setlist.eventDate,
                        venue: {
                          id: setlist.venue?.id || '',
                          name: setlist.venue?.name || 'Unknown Venue',
                          city: setlist.venue?.city?.name || 'Unknown City',
                          country: setlist.venue?.city?.country?.name || 'Unknown Country'
                        },
                        year: this.parseYear(setlist.eventDate),
                        era: this.getEraLabel(setlist.eventDate)
                      };
                      
                      songEntry.shows.push(showInfo);
                      songEntry.totalPerformances++;
                      
                      // Update first/last performance
                      if (!songEntry.firstPerformance || showInfo.date < songEntry.firstPerformance.date) {
                        songEntry.firstPerformance = showInfo;
                      }
                      if (!songEntry.lastPerformance || showInfo.date > songEntry.lastPerformance.date) {
                        songEntry.lastPerformance = showInfo;
                      }
                      
                      // Add alt titles if different
                      if (!songEntry.altTitles.includes(songTitle)) {
                        songEntry.altTitles.push(songTitle);
                      }
                    });
                  }
                });
              }
            });
            
            totalShows += setlistsResponse.setlist.length;
            
            // Ultra-conservative rate limiting: wait 2 seconds between requests
            console.log(`    Waiting 2 seconds before next request...`);
            await new Promise(resolve => setTimeout(resolve, 2000));
            
          } catch (pageError: any) {
            console.log(`    Error on page ${page}:`, pageError.message);
            if (pageError.message.includes('429')) {
              console.log('    Rate limited, waiting 10 seconds...');
              await new Promise(resolve => setTimeout(resolve, 10000));
            }
            break;
          }
        }
        
        // Ultra-conservative rate limiting: wait 5 seconds between years
        console.log(`  Waiting 5 seconds before next year...`);
        await new Promise(resolve => setTimeout(resolve, 5000));
        
      } catch (yearError: any) {
        console.log(`  Error processing year ${year}:`, yearError.message);
      }
    }
    
    // Convert map to array
    const songs = Array.from(songMap.values());
    
    this.songIndex = {
      songs,
      lastUpdated: new Date().toISOString(),
      totalShows
    };
    
    console.log(`Index built successfully! Found ${songs.length} unique songs across ${totalShows} shows`);
    
    // Save index (in a real app, this would save to database)
    this.saveIndex();
    
    return this.songIndex;
  }

  // Search songs in the local index
  searchSongs(query: string, limit: number = 20): SongIndexEntry[] {
    if (!this.songIndex) {
      console.log('No index available, returning empty results');
      return [];
    }
    
    const searchTerm = query.toLowerCase().trim();
    if (!searchTerm) return [];
    
    // Simple text search through song titles and alt titles
    const results = this.songIndex.songs.filter(song => {
      return song.title.toLowerCase().includes(searchTerm) ||
             song.altTitles.some(alt => alt.toLowerCase().includes(searchTerm));
    });
    
    // Sort by relevance (exact matches first, then by performance count)
    results.sort((a, b) => {
      const aExact = a.title.toLowerCase() === searchTerm;
      const bExact = b.title.toLowerCase() === searchTerm;
      
      if (aExact && !bExact) return -1;
      if (!aExact && bExact) return 1;
      
      return b.totalPerformances - a.totalPerformances;
    });
    
    return results.slice(0, limit);
  }

  // Get song details by slug
  getSongDetails(slug: string): SongIndexEntry | null {
    if (!this.songIndex) return null;
    
    return this.songIndex.songs.find(song => song.slug === slug) || null;
  }

  // Get index stats
  getIndexStats() {
    if (!this.songIndex) return null;
    
    return {
      totalSongs: this.songIndex.songs.length,
      totalShows: this.songIndex.totalShows,
      lastUpdated: this.songIndex.lastUpdated
    };
  }

  // Check if index needs rebuilding
  shouldRebuildIndex(): boolean {
    if (!this.songIndex) return true;
    
    const lastUpdate = new Date(this.songIndex.lastUpdated);
    const daysSinceUpdate = (Date.now() - lastUpdate.getTime()) / (1000 * 60 * 60 * 24);
    
    // Rebuild if older than 7 days
    return daysSinceUpdate > 7;
  }

  // Save index to file (in a real app, this would save to database)
  private saveIndex() {
    try {
      // In a real app, this would save to database
      console.log('Index would be saved here (database in production)');
    } catch (error) {
      console.error('Error saving index:', error);
    }
  }

  // Helper methods
  private createSlug(title: string): string {
    return title.toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
      .trim();
  }

  private parseYear(dateString: string): number {
    try {
      const [day, month, year] = dateString.split('-');
      return parseInt(year);
    } catch {
      return new Date().getFullYear();
    }
  }

  private getEraLabel(dateString: string): string {
    const year = this.parseYear(dateString);
    
    if (year >= 1965 && year <= 1967) return 'Primal Era';
    if (year >= 1968 && year <= 1970) return 'Pigpen Peak Era';
    if (year >= 1971 && year <= 1972) return 'Europe \'72 Era';
    if (year >= 1973 && year <= 1974) return 'Wall of Sound Era';
    if (year >= 1975 && year <= 1975) return 'Hiatus';
    if (year >= 1976 && year <= 1978) return 'Return + \'77 Era';
    if (year >= 1979 && year <= 1986) return 'Brent Early Era';
    if (year >= 1987 && year <= 1990) return 'Brent Late Era';
    if (year >= 1991 && year <= 1995) return 'Vince Era';
    
    return 'Unknown Era';
  }
}

// Export singleton instance
export const songIndexService = new SongIndexService();
