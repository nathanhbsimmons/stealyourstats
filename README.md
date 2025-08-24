# Steal Your Stats

A Grateful Dead song lookup tool with a retro brutalist interface, real API integration, and BPM estimation capabilities.

## Features

- **Real API Integration**: Connects to setlist.fm, Archive.org, and MusicBrainz APIs
- **Database Backend**: PostgreSQL with Prisma ORM for data persistence
- **Song Search**: Fuzzy search through Grateful Dead songs with real-time results
- **Song Details**: Comprehensive information including debut show, last show, longest/shortest performances, and era context
- **Show Information**: Complete setlists, venue details, and available recordings
- **Audio Player**: Stream recordings directly from Archive.org with BPM estimation capability
- **BPM Analysis**: Real-time BPM estimation using Web Audio API and realtime-bpm-analyzer
- **Retro Brutalist UI**: Stark black & white interface with thick borders and serif typography

## Tech Stack

- **Frontend**: Next.js 14 with App Router, TypeScript, TailwindCSS
- **Backend**: Next.js API Routes with Prisma ORM
- **Database**: PostgreSQL
- **Audio**: HTML5 Audio API with custom BPM estimation
- **Search**: Fuse.js for fuzzy search functionality
- **External APIs**: setlist.fm, Archive.org, MusicBrainz
- **Styling**: Custom CSS for authentic retro brutalist appearance

## Prerequisites

- Node.js 18+ 
- PostgreSQL database
- setlist.fm API key
- npm or yarn

## Environment Setup

Create a `.env` file in the root directory with the following variables:

```bash
# Database
DATABASE_URL="postgresql://username:password@localhost:5432/stealyourstats?schema=public"

# API Keys
SETLIST_FM_API_KEY="your_setlist_fm_api_key_here"
MUSICBRAINZ_USER_AGENT="StealYourStats/1.0.0 (stealyourstats@gmail.com)"

# Redis (for caching and job queue)
REDIS_URL="redis://localhost:6379"

# Archive.org (no API key required)
ARCHIVE_ORG_BASE_URL="https://archive.org"

# App Configuration
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

## Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd stealyourstats
```

2. Install dependencies:
```bash
npm install
```

3. Set up the database:
```bash
# Generate Prisma client
npm run db:generate

# Push schema to database (for development)
npm run db:push

# Seed with initial data
npm run db:seed
```

4. Run the development server:
```bash
npm run dev
```

5. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database Setup

The application uses PostgreSQL with the following key entities:

- **Artist**: Grateful Dead and related metadata
- **Venue**: Concert venues with location information
- **Show**: Individual concert dates and metadata
- **Song**: Song titles and alternate names
- **Performance**: Song performances within shows
- **Recording**: Audio recordings from Archive.org
- **Analysis**: BPM and duration analysis data
- **SongRollup**: Pre-computed song statistics for performance

## API Integration

### setlist.fm
- Provides song appearances, setlists, and show metadata
- Used for determining debut/last shows and performance counts

### Archive.org
- Source for live recordings and streaming audio
- Provides track lists, durations, and streamable URLs

### MusicBrainz
- Artist metadata and canonical IDs
- Used for artist resolution and validation

## BPM Estimation

The application includes real-time BPM estimation using:

- **Web Audio API**: For audio processing and analysis
- **realtime-bpm-analyzer**: Advanced BPM detection algorithms
- **Client-side processing**: Analyzes 60-second audio samples
- **Database storage**: Results are stored with confidence scores

## Data Ingestion

Use the data sync API to populate the database:

```bash
POST /api/ingest/sync
{
  "artistName": "Grateful Dead",
  "startYear": 1965,
  "endYear": 1995
}
```

This will:
1. Sync setlists from setlist.fm
2. Fetch recordings from Archive.org
3. Create database records for shows, songs, and performances
4. Update song rollups with statistics

## Development

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run db:generate` - Generate Prisma client
- `npm run db:push` - Push schema to database
- `npm run db:seed` - Seed database with sample data
- `npm run db:studio` - Open Prisma Studio

### Project Structure

```
src/
├── app/                 # Next.js app router
│   ├── api/            # API routes
│   │   ├── songs/      # Song search and details
│   │   ├── shows/      # Show information
│   │   ├── analysis/   # BPM analysis storage
│   │   └── ingest/     # Data ingestion
│   └── globals.css     # Global styles
├── components/          # React components
│   ├── Layout.tsx      # Main window layout
│   ├── Search.tsx      # Song search interface
│   ├── SongDetail.tsx  # Song information display
│   ├── ShowDetail.tsx  # Show details and setlist
│   └── AudioPlayer.tsx # Audio playback with BPM estimation
├── lib/                 # Utility libraries
│   ├── prisma.ts       # Database client
│   ├── api-clients.ts  # External API clients
│   └── bpm-estimator.ts # BPM estimation utilities
├── types/               # TypeScript type definitions
└── data/                # Mock data (for development)
```

## Production Deployment

### Database
- Use a managed PostgreSQL service (e.g., Azure Database for PostgreSQL)
- Ensure proper indexing on frequently queried fields
- Set up automated backups

### Caching
- Implement Redis for API response caching
- Cache song rollups and frequently accessed data
- Use CDN for static assets

### Monitoring
- Set up error tracking (Sentry)
- Monitor API rate limits and quotas
- Track database performance and query times

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Acknowledgments

- Grateful Dead for the music
- Archive.org for preserving live recordings
- setlist.fm for comprehensive show data
- MusicBrainz for artist metadata
- The retro brutalist design aesthetic
