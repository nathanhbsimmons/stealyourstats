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
      headers: {
        'x-api-key': this.apiKey,
        'Accept': 'application/json'
      },
      timeout: 10000,
      retry: 2
    })
  }

  async searchArtist(name: string) {
    try {
      const response = await this.client.get(`${SETLIST_FM_BASE_URL}/search/artists`, {
        searchParams: {
          artistName: name,
          fmt: 'json'
        }
      }).json() // Get as JSON since we're requesting JSON
      return response
    } catch (error) {
      console.error('Setlist.fm API error:', error)
      throw error // Re-throw the original error instead of wrapping it
    }
  }

  async getArtistSetlists(artistId: string, page: number = 1, year?: number) {
    try {
      const searchParams: any = { p: page, fmt: 'json' }
      if (year) searchParams.year = year

      const response = await this.client.get(`${SETLIST_FM_BASE_URL}/artist/${artistId}/setlists`, {
        searchParams
      }).json() // Get as JSON since we're requesting JSON
      return response
    } catch (error) {
      console.error('Setlist.fm API error:', error)
      throw error // Re-throw the original error instead of wrapping it
    }
  }

  async searchSetlists(artistId: string, songName?: string, year?: number) {
    try {
      const searchParams: any = { artistId, fmt: 'json' }
      if (songName) searchParams.songName = songName
      if (year) searchParams.year = year

      const response = await this.client.get(`${SETLIST_FM_BASE_URL}/search/setlists`, {
        searchParams
      }).json() // Get as JSON since we're requesting JSON
      return response
    } catch (error) {
      console.error('Setlist.fm API error:', error)
      throw error // Re-throw the original error instead of wrapping it
    }
  }

  async getSetlist(setlistId: string) {
    try {
      const response = await this.client.get(`${SETLIST_FM_BASE_URL}/setlist/${setlistId}`, {
        searchParams: {
          fmt: 'json'
        }
      }).json()
      return response
    } catch (error) {
      console.error('Setlist.fm API error:', error)
      throw error // Re-throw the original error instead of wrapping it
    }
  }
}

// Archive.org API Client
export class ArchiveOrgClient {
  private client: typeof ky

  constructor() {
    this.client = ky.create({
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

      const response = await this.client.get(`${ARCHIVE_ORG_BASE_URL}/advancedsearch.php`, {
        searchParams
      }).json()
      return response
    } catch (error) {
      console.error('Archive.org API error:', error)
      throw error // Re-throw the original error instead of wrapping it
    }
  }

  async getShowMetadata(identifier: string) {
    try {
      const response = await this.client.get(`${ARCHIVE_ORG_BASE_URL}/metadata/${identifier}`).json()
      return response
    } catch (error) {
      console.error('Archive.org API error:', error)
      throw error // Re-throw the original error instead of wrapping it
    }
  }

  async getShowFiles(identifier: string) {
    try {
      const response = await this.client.get(`${ARCHIVE_ORG_BASE_URL}/${identifier}/_files.json`).json()
      return response
    } catch (error) {
      console.error('Archive.org API error:', error)
      throw error // Re-throw the original error instead of wrapping it
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
      headers: {
        'User-Agent': this.userAgent,
        'Accept': 'application/json'
      },
      timeout: 10000,
      retry: 2
    })
  }

  async searchArtist(name: string) {
    try {
      const response = await this.client.get(`${MUSICBRAINZ_BASE_URL}/artist`, {
        searchParams: {
          query: `name:"${name}"`,
          fmt: 'json',
          limit: 25
        }
      }).json()
      return response
    } catch (error) {
      console.error('MusicBrainz API error:', error)
      throw error // Re-throw the original error instead of wrapping it
    }
  }

  async getArtist(artistId: string) {
    try {
      const response = await this.client.get(`${MUSICBRAINZ_BASE_URL}/artist/${artistId}`, {
        searchParams: {
          fmt: 'json',
          inc: 'url-rels+release-groups'
        }
      }).json()
      return response
    } catch (error) {
      console.error('MusicBrainz API error:', error)
      throw error // Re-throw the original error instead of wrapping it
    }
  }

  async searchRecordings(artistId: string, query?: string) {
    try {
      const searchParams: any = {
        artist: artistId,
        fmt: 'json',
        limit: 100
      }
      if (query) searchParams.query = query

      const response = await this.client.get(`${MUSICBRAINZ_BASE_URL}/recording`, {
        searchParams
      }).json()
      return response
    } catch (error) {
      console.error('MusicBrainz API error:', error)
      throw error // Re-throw the original error instead of wrapping it
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
