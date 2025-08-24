import { Artist, Venue, Show, Song, Performance, Recording, EraLabel } from '@/types';

export const mockArtist: Artist = {
  id: '1',
  name: 'Grateful Dead',
  musicbrainzMbid: '6f856a92-6b9c-4c4a-8b6e-5c3f3c2b1a0f'
};

export const mockVenues: Venue[] = [
  {
    id: '1',
    name: 'Fillmore West',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA'
  },
  {
    id: '2',
    name: 'Winterland Arena',
    city: 'San Francisco',
    state: 'CA',
    country: 'USA'
  },
  {
    id: '3',
    name: 'Madison Square Garden',
    city: 'New York',
    state: 'NY',
    country: 'USA'
  },
  {
    id: '4',
    name: 'Red Rocks Amphitheatre',
    city: 'Morrison',
    state: 'CO',
    country: 'USA'
  }
];

export const mockShows: Show[] = [
  {
    id: '1',
    artistId: '1',
    date: '1969-02-27',
    venueId: '1',
    archiveItemIds: ['gd1969-02-27'],
    sourceCount: 3
  },
  {
    id: '2',
    artistId: '1',
    date: '1977-05-08',
    venueId: '2',
    archiveItemIds: ['gd1977-05-08'],
    sourceCount: 5
  },
  {
    id: '3',
    artistId: '1',
    date: '1989-07-07',
    venueId: '3',
    archiveItemIds: ['gd1989-07-07'],
    sourceCount: 2
  },
  {
    id: '4',
    artistId: '1',
    date: '1974-06-28',
    venueId: '4',
    archiveItemIds: ['gd1974-06-28'],
    sourceCount: 4
  }
];

export const mockSongs: Song[] = [
  {
    id: '1',
    artistId: '1',
    title: 'Scarlet Begonias',
    altTitles: ['Scarlet Begonias', 'Scarlet'],
    slug: 'scarlet-begonias'
  },
  {
    id: '2',
    artistId: '1',
    title: 'Fire on the Mountain',
    altTitles: ['Fire on the Mountain', 'Fire'],
    slug: 'fire-on-the-mountain'
  },
  {
    id: '3',
    artistId: '1',
    title: 'Dark Star',
    altTitles: ['Dark Star'],
    slug: 'dark-star'
  },
  {
    id: '4',
    artistId: '1',
    title: 'Truckin\'',
    altTitles: ['Truckin\'', 'Truckin'],
    slug: 'truckin'
  },
  {
    id: '5',
    artistId: '1',
    title: 'Casey Jones',
    altTitles: ['Casey Jones'],
    slug: 'casey-jones'
  }
];

export const mockPerformances: Performance[] = [
  {
    id: '1',
    showId: '1',
    songId: '1',
    setNumber: 1,
    positionInSet: 3,
    isOpener: false,
    isCloser: false,
    isEncore: false
  },
  {
    id: '2',
    showId: '1',
    songId: '2',
    setNumber: 1,
    positionInSet: 4,
    isOpener: false,
    isCloser: false,
    isEncore: false
  },
  {
    id: '3',
    showId: '2',
    songId: '1',
    setNumber: 1,
    positionInSet: 1,
    isOpener: true,
    isCloser: false,
    isEncore: false
  },
  {
    id: '4',
    showId: '2',
    songId: '2',
    setNumber: 1,
    positionInSet: 2,
    isOpener: false,
    isCloser: false,
    isEncore: false
  }
];

export const mockRecordings: Recording[] = [
  {
    id: '1',
    showId: '1',
    archiveIdentifier: 'gd1969-02-27',
    sourceType: 'SBD',
    format: 'FLAC',
    trackMap: {
      'Scarlet Begonias': 'gd1969-02-27_sbd_01',
      'Fire on the Mountain': 'gd1969-02-27_sbd_02'
    },
    durationMap: {
      'Scarlet Begonias': 420000, // 7 minutes
      'Fire on the Mountain': 480000 // 8 minutes
    }
  },
  {
    id: '2',
    showId: '2',
    archiveIdentifier: 'gd1977-05-08',
    sourceType: 'SBD',
    format: 'FLAC',
    trackMap: {
      'Scarlet Begonias': 'gd1977-05-08_sbd_01',
      'Fire on the Mountain': 'gd1977-05-08_sbd_02'
    },
    durationMap: {
      'Scarlet Begonias': 450000, // 7.5 minutes
      'Fire on the Mountain': 510000 // 8.5 minutes
    }
  }
];

export const eraLabels: EraLabel[] = [
  {
    year: '1965-1967',
    label: 'Primal',
    description: 'The early days of the Grateful Dead, featuring the original lineup with Pigpen on vocals and harmonica.'
  },
  {
    year: '1968-1970',
    label: 'Pigpen Peak',
    description: 'Pigpen\'s golden era, with blues-heavy setlists and extended jams.'
  },
  {
    year: '1971-1972',
    label: 'Europe \'72',
    description: 'The legendary European tour that captured the Dead at their most adventurous.'
  },
  {
    year: '1973-1974',
    label: 'Wall of Sound',
    description: 'The massive Wall of Sound era, featuring some of the most technically advanced live sound systems ever built.'
  },
  {
    year: '1976-1978',
    label: 'Return + \'77',
    description: 'The return from hiatus and the legendary 1977 tour, considered by many to be the Dead\'s peak year.'
  },
  {
    year: '1979-1986',
    label: 'Brent (early)',
    description: 'The early Brent Mydland years, bringing new energy and keyboard textures to the band.'
  },
  {
    year: '1987-1990',
    label: 'Brent (late)',
    description: 'The later Brent years, with more polished arrangements and expanded song repertoire.'
  },
  {
    year: '1991-1995',
    label: 'Vince',
    description: 'The Vince Welnick era, the final chapter of the Grateful Dead with a more modern sound.'
  }
];
