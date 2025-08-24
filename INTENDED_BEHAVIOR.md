# INTENDED_BEHAVIOR.md
Steal Your Stats (a Grateful Dead Song Lookup Tool) — Intended Behavior, Functionality, and Requirements

## 1) Scope (MVP)
The application enables users to look up a Grateful Dead song and retrieve:
- First show it was played
- Last show it was played
- Shows that opened/closed/encored with the song
- Longest and shortest known performances (by duration)
- Highest and lowest measured BPM (when available)
- Playable recordings in-browser (streaming)
- Era context for the show date (single-paragraph blurb keyed to era band)

Out of scope for MVP: user accounts, playlists/favorites, mobile apps, multi-artist support (assume Grateful Dead only), offline caching of audio, crowd-sourced edits.

## 2) Primary User Stories (MVP)
1. **Song search**  
   - As a user, I can search for a song title and see matching results with canonical and alternate titles.
2. **Song summary**  
   - As a user, I can open a song detail page and see debut show, last show, longest/shortest performance, highest/lowest BPM (if known), counts (openers/closers/encores), and a chart or table of average duration by year.
3. **Performance list**  
   - As a user, I can list all performances of a song, filter by year, and sort by date, duration, or BPM.
4. **Show detail**  
   - As a user, I can open a specific show and see venue metadata, the full setlist in order (with segues), and available recordings with streamable tracks.
5. **Playback**  
   - As a user, I can play a track in-browser (HTML5 audio), scrub the timeline, and see the current timestamp.
6. **BPM estimation (optional per track)**  
   - As a user, I can click “Estimate BPM,” which computes and stores BPM for that specific recording/performance. If BPM exists already, I see it immediately with a confidence indicator.
7. **Era context**  
   - As a user, I see a short era blurb associated with the show year (e.g., “Wall of Sound ’74”).

## 3) Functional Requirements

### 3.1 Search
- Fuzzy, case-insensitive search on song titles and alt titles.
- Returns ≤ 10 results per query.
- Debounce client queries by ~250ms.

**Acceptance**  
- Given `“scar”`, when I search, then “Scarlet Begonias” appears as a result if present in DB.  
- Given mixed case input, results match regardless of case.

### 3.2 Song Detail Summary
- Returns canonical `song` object (title, slug, altTitles[]).
- Returns:
  - `debutShow` (id, ISO date, venue summary)
  - `lastShow` (same)
  - `longest`, `shortest` performances (include durationMs + show metadata)
  - `highestBpm`, `lowestBpm` (include bpm + confidence + show metadata) — may be `null` if not computed
  - `counts`: openers, closers, encores (integers)
  - `sampling.avgDurationByYear`: `{ [year]: milliseconds }`
  - `eraHints`: array of `{ year, label }` indicating mapped era label(s)

**Acceptance**  
- When a song has at least one performance, `debutShow` and `lastShow` are non-null and `debutShow.date <= lastShow.date`.  
- When there is at least one known recording duration, `longest.durationMs >= shortest.durationMs`.  
- If no BPM is stored, `highestBpm` and `lowestBpm` return `null`.

### 3.3 Performances Listing
- Query params: `sort=duration|date|bpm`, `order=asc|desc`, optional `year=YYYY`, cursor-based pagination.
- Each item includes `{ show, performance, bestRecording?, analysis? }`.
- `bestRecording` is a heuristic pick (prefer SBD over AUD, non-broken stream, has duration).

**Acceptance**  
- Given `sort=duration&order=desc`, the first page contains the longest-known versions first.  
- Given `year=1977`, only 1977 shows appear.  
- Cursor returns `nextCursor` until exhausted.

### 3.4 Show Detail
- Returns `show` (id, date, venue, archiveItemIds[]), `venue` (name, city, state, country).
- Returns ordered `setlist` as an array of `{ setNumber, positionInSet, songTitle, segueToSongTitle? }`.
- Returns `recordings[]` with `sourceType (SBD/AUD/Matrix)`, `format`, `streamable: boolean`.

**Acceptance**  
- Setlist preserves order; the first item of set 1 is recognized as an opener.  
- If archive items exist, `recordings` >= 1; otherwise `recordings` may be empty.

### 3.5 Recording Streams
- Returns a normalized list of `{ title, url, durationMs? }` where `url` is a direct, streamable HTTP link (no authentication).
- Do **not** copy audio; only link/stream from source.

**Acceptance**  
- When clicking a track, the browser can play the audio without downloading a full file first (Range requests OK).  
- Broken/unavailable tracks are filtered out or clearly surfaced as non-playable.

### 3.6 BPM Estimation
- Client-side estimation loads a 60–120s slice (configurable) and runs a Web Audio–based estimator.
- Result posts back and is stored as an `Analysis` row with `bpm`, `bpmConfidence`, `recordingId`, `performanceId`.
- If multiple BPMs exist for a performance, display the highest-confidence one; show min/max across performances at the song level.

**Acceptance**  
- Clicking “Estimate BPM” creates a stored BPM within the same session (network permitting).  
- Reopening the page shows the stored BPM without recomputing.

### 3.7 Rollups
- A scheduled job materializes `SongRollup` for O(1) fetch of summary stats.
- Rollups recompute nightly or when new data arrives (ingest completes).

**Acceptance**  
- After ingest completes, `/api/songs/:slug` returns updated debut/last/longest/shortest/hi/lo BPM without heavy queries.

### 3.8 Era Labeling
- Fixed bands (edit via config):  
  - 1965–1967 Primal  
  - 1968–1970 Pigpen Peak  
  - 1971–1972 Europe ’72  
  - 1973–1974 Wall of Sound  
  - 1976–1978 Return + ’77  
  - 1979–1986 Brent (early)  
  - 1987–1990 Brent (late)  
  - 1991–1995 Vince
- Each show inherits the label for its year.
- UI displays a one-sentence blurb per era (static copy).

**Acceptance**  
- Given a 1974 show, era label renders “Wall of Sound”.

## 4) Data Model (concise)
- **Artist**: `id`, `name`, `musicbrainzMbid?`
- **Venue**: `id`, `name`, `city?`, `state?`, `country?`
- **Show**: `id`, `artistId`, `date`, `venueId?`, `archiveItemIds[]`, `sourceCount`
- **Song**: `id`, `artistId`, `title`, `altTitles[]`, `slug`
- **Performance**: `id`, `showId`, `songId`, `setNumber?`, `positionInSet?`, `segueToSongId?`, `isOpener`, `isCloser`, `isEncore`
- **Recording**: `id`, `showId`, `archiveIdentifier`, `sourceType?`, `format?`, `trackMap`, `durationMap`
- **Analysis**: `id`, `performanceId`, `recordingId`, `durationMs?`, `bpm?`, `bpmConfidence?`, `analyzedAt`
- **SongRollup**: `songId (unique)`, links to debut/last/longest/shortest/high/low BPM performance IDs, counts, `avgDurationByYear` JSON, `computedAt`

**Index expectations**  
- Composite: `(songId, showId)` on Performance  
- Partial: `(songId, isOpener)` on Performance  
- Btree: `Show.date`  
- Unique: `(performanceId, recordingId)` on Analysis; `(artistId, slug)` on Song

## 5) Ingestion & External Dependencies (behavioral)
- **Setlists**: source of truth for song appearances, order, and dates. Paginate and upsert; respect provider rate limits; cache raw responses 24h.
- **Archive.org**: source for recordings/streams. For each show, look up identifiers by date and creator; fetch file lists; map tracks to performances; prefer streamable formats; do not mirror audio.
- **BPM**: computed either on-demand (client) or via background workers on a prioritized set. Store results and surface best-known value by confidence.

**Non-fatal tolerances**  
- If setlist entry exists but no recording found, still show performance metadata.  
- If recordings exist but duration missing for a track, duration-linked stats skip that track.

## 6) Non-Functional Requirements
- **Performance**: Song summary endpoint must return ≤ 400ms P95 from warm cache; ≤ 1.5s P95 cold.
- **Availability**: 99.5% monthly target for public endpoints.
- **Caching**: Redis caching for song summaries (rollups) and external API response bodies.
- **Rate limiting**: Per-IP and per-route limits to protect APIs and third-party quotas.
- **Compliance**: Attribute data sources in UI; follow Archive.org streaming policy.
- **Accessibility**: WCAG 2.1 AA for core flows (search, playback controls).
- **Browser**: Evergreen Chrome/Firefox/Safari/Edge; iOS/iPadOS 16+; Android 10+.
- **Telemetry**: Basic analytics on searches, song views, play actions, BPM submissions (no PII).

## 7) Error Handling (observable behavior)
- Network/third-party failure → Show partial data with inline notices (e.g., “Recordings temporarily unavailable”).
- No matches in search → Empty state with guidance (suggest alternate titles).
- BPM estimator failure → Non-blocking toast, leave page usable.

## 8) Admin/Jobs (internal behavior)
- Nightly jobs:
  - Setlist sync per known song
  - Archive.org recording refresh for newly synced shows
  - Rollup recompute
- Manual job endpoints (protected) to re-run any of the above for a given song/show.

## 9) Definitions of Done (MVP)
- A: I can type a song name and open its detail page with debut/last/longest/shortest and era hints populated when data exists.  
- B: I can list all performances, filter by year, and sort by date/duration/BPM.  
- C: I can open a show, see the ordered setlist, and play at least one streamable track (if available for that show).  
- D: I can click “Estimate BPM” on a track and see BPM appear with a confidence score; subsequent visits reuse stored BPM.  
- E: If external data is missing or failing, the UI still renders core metadata and explains what’s unavailable.

## 10) Non-Goals (MVP)
- No editing of metadata in-app.
- No user login, likes, or comments.
- No offline downloads or mirrored audio.
- No automatic transcription/section labeling of jams.


