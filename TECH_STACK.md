# TECH_STACK.md
Steal Your Stats (a Grateful Dead Song Lookup Tool) — Recommended Tech Stack

## 1) Frontend
- **Framework**: Next.js (App Router) with TypeScript
- **UI Layer**: TailwindCSS
- **Audio Player**: Wavesurfer.js (waveforms, scrubbing, looping)
- **BPM Estimation (client)**: realtime-bpm-analyzer + Web Audio API
- **Utility**: Fuse.js (fuzzy search on client side)

## 2) Backend
- **Language**: TypeScript
- **Runtime**: Node.js 20
- **Framework**: Next.js API Routes (serverless functions)

### API Clients
- **setlist.fm API** → song appearances, setlists, debut/last show
- **Archive.org API** → recordings, track lists, durations
- **MusicBrainz API** → artist MBID resolution (Grateful Dead canonical ID)

### Background Processing
- **Job Queue**: BullMQ (Redis-backed)
- **Rate Limiting**: Bottleneck (for external API quotas)
- **Caching**: Redis (song summaries, API responses, rollup results)

## 3) Database
- **DB**: PostgreSQL
- **ORM**: Prisma
- **Schema**: Entities = Artist, Venue, Show, Song, Performance, Recording, Analysis, SongRollup

## 4) Infrastructure
- **Hosting**: Vercel (Next.js) or Azure App Service (Node 20)
- **Database Hosting**: Azure Database for PostgreSQL (Flexible Server)
- **Cache/Queue Hosting**: Azure Cache for Redis
- **File Storage**: None (all audio streams directly from Archive.org)

## 5) Dev Tooling
- **Lint/Format**: ESLint + Prettier
- **Testing**: Vitest (unit), Playwright (e2e)
- **Types**: TypeScript strict mode
- **Date/Time**: Luxon (parsing show dates)
- **HTTP Client**: Ky

## 6) Non-Functional Requirements (supporting stack)
- **Monitoring**: Sentry (errors), Datadog or Azure Monitor (infra)
- **Analytics**: Simple event logging (searches, plays, BPM estimates)
- **Accessibility**: WCAG 2.1 AA baseline (tested with axe-core)

