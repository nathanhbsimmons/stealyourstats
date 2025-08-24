import ky from 'ky'

// API Client Configuration
const SETLIST_FM_BASE_URL = 'https://api.setlist.fm/rest/1.0'
const ARCHIVE_ORG_BASE_URL = 'https://archive.org'
const MUSICBRAINZ_BASE_URL = 'https://musicbrainz.org/ws/2'

// Setlist.fm API Client
export class SetlistFmClient {
  private apiKey: string
  private client: typeof ky

  constructor(apiKey: string) {
    this.apiKey = apiKey
    this.client = ky.create({
      prefixUrl: SETLIST_FM_BASE_URL,
      headers: {
        'x-api-key': this.apiKey,
        'Accept': 'application/json'
      },
      timeout: 10000,
      retry: 2
    })
  }

  async searchSongs(artistId: string, query: string) {
    try {
      const response = await this.client.get(`search/songs`, {
        searchParams: {
          artistId,
          songName: query
        }
      }).json()
      return response
    } catch (error) {
      console.error('Setlist.fm API error:', error)
      throw new Error('Failed to search songs from setlist.fm')
    }
  }

  async getArtistSetlists(artistId: string, page: number = 1, year?: number) {
    try {
      const searchParams: any = { p: page }
      if (year) searchParams.year = year

      const response = await this.client.get(`artist/${artistId}/setlists`, {
        searchParams
      }).json()
      return response
    } catch (error) {
      console.error('Setlist.fm API error:', error)
      throw new Error('Failed to fetch setlists from setlist.fm')
    }
  }

  async getSetlist(setlistId: string) {
    try {
      const response = await this.client.get(`setlist/${setlistId}`).json()
      return response
    } catch (error) {
      console.error('Setlist.fm API error:', error)
      throw new Error('Failed to fetch setlist from setlist.fm')
    }
  }
}

// Archive.org API Client
export class ArchiveOrgClient {
  private client: typeof ky

  constructor() {
    this.client = ky.create({
      prefixUrl: ARCHIVE_ORG_BASE_URL,
      timeout: 15000,
      retry: 2
    })
  }

  async searchShows(creator: string, date?: string) {
    try {
      const searchParams: any = {
        q: `creator:${creator}`,
        output: 'json'
      }
      if (date) searchParams.date = date

      const response = await this.client.get('advancedsearch.php', {
        searchParams
      }).json()
      return response
    } catch (error) {
      console.error('Archive.org API error:', error)
      throw new Error('Failed to search shows from Archive.org')
    }
  }

  async getShowMetadata(identifier: string) {
    try {
      const response = await this.client.get(`metadata/${identifier}`).json()
      return response
    } catch (error) {
      console.error('Archive.org API error:', error)
      throw new Error('Failed to fetch show metadata from Archive.org')
    }
  }

  async getShowFiles(identifier: string) {
    try {
      const response = await this.client.get(`${identifier}/_files.json`).json()
      return response
    } catch (error) {
      console.error('Archive.org API error:', error)
      throw new Error('Failed to fetch show files from Archive.org')
    }
  }
}

// MusicBrainz API Client
export class MusicBrainzClient {
  private userAgent: string
  private client: typeof ky

  constructor(userAgent: string) {
    this.userAgent = userAgent
    this.client = ky.create({
      prefixUrl: MUSICBRAINZ_BASE_URL,
      headers: {
        'User-Agent': this.userAgent
      },
      timeout: 10000,
      retry: 2
    })
  }

  async searchArtist(name: string) {
    try {
      const response = await this.client.get('artist', {
        searchParams: {
          query: `name:"${name}"`,
          fmt: 'json'
        }
      }).json()
      return response
    } catch (error) {
      console.error('MusicBrainz API error:', error)
      throw new Error('Failed to search artist from MusicBrainz')
    }
  }

  async getArtist(artistId: string) {
    try {
      const response = await this.client.get(`artist/${artistId}`, {
        searchParams: {
          fmt: 'json'
        }
      }).json()
      return response
    } catch (error) {
      console.error('MusicBrainz API error:', error)
      throw new Error('Failed to fetch artist from MusicBrainz')
    }
  }
}

// Factory function to create API clients
export function createApiClients() {
  const setlistFmApiKey = process.env.SETLIST_FM_API_KEY
  const musicbrainzUserAgent = process.env.MUSICBRAINZ_USER_AGENT || 'StealYourStats/1.0.0'

  if (!setlistFmApiKey) {
    throw new Error('SETLIST_FM_API_KEY environment variable is required')
  }

  return {
    setlistFm: new SetlistFmClient(setlistFmApiKey),
    archiveOrg: new ArchiveOrgClient(),
    musicbrainz: new MusicBrainzClient(musicbrainzUserAgent)
  }
}
