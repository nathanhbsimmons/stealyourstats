import { NextRequest, NextResponse } from 'next/server';
import { internetArchiveService } from '@/lib/internet-archive';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const date = searchParams.get('date');
  const songTitle = searchParams.get('song');
  const showId = searchParams.get('showId');
  const venue = searchParams.get('venue');
  const city = searchParams.get('city');
  const state = searchParams.get('state');

  if (!date && !showId) {
    return NextResponse.json(
      { error: 'Date or showId parameter is required' },
      { status: 400 }
    );
  }

  try {
    if (showId) {
      // Get details for a specific show by identifier
      const showDetails = await internetArchiveService.getShowDetails(showId);
      
      if (!showDetails) {
        return NextResponse.json(
          { error: 'Show not found' },
          { status: 404 }
        );
      }

      // If song title is provided, find all available tracks
      if (songTitle) {
        const allSongTracks = await internetArchiveService.findAllSongTracks(showId, songTitle);
        return NextResponse.json({
          show: showDetails,
          songTracks: allSongTracks,
          found: allSongTracks.length > 0,
          totalTracks: allSongTracks.length
        });
      }

      return NextResponse.json({
        show: showDetails,
        songAudio: null,
        found: false
      });
    } else {
      // Search for shows using advanced search
      const searchResult = await internetArchiveService.findArchiveIdentifier({
        date,
        venue: venue || undefined,
        city: city || undefined,
        state: state || undefined
      });

      if (!searchResult.bestIdentifier || searchResult.tracks.length === 0) {
        return NextResponse.json({
          error: 'No shows found for this date',
          candidates: searchResult.candidates,
          date
        }, { status: 404 });
      }

      // Create show details from search result
      const showDetails = {
        identifier: searchResult.bestIdentifier,
        title: searchResult.candidates[0]?.title || `Grateful Dead - ${date}`,
        date: date,
        venue: searchResult.candidates[0]?.venue,
        audioFiles: searchResult.tracks,
        totalDuration: searchResult.tracks.reduce((sum, track) => sum + (track.duration || 0), 0),
        format: searchResult.tracks.some(t => t.format.toLowerCase().includes('mp3')) ? 'MP3' : 'FLAC'
      };

      // If song title is provided, find the specific track
      if (songTitle) {
        const songAudio = searchResult.tracks.find(track => {
          const trackTitle = track.title?.toLowerCase() || track.name.toLowerCase();
          const songTitleLower = songTitle.toLowerCase();
          return trackTitle.includes(songTitleLower) || songTitleLower.includes(trackTitle);
        });

        return NextResponse.json({
          show: showDetails,
          songAudio,
          found: !!songAudio,
          candidates: searchResult.candidates,
          searchInfo: {
            totalCandidates: searchResult.candidates.length,
            bestScore: searchResult.candidates[0]?.score,
            searchQuery: { date, venue, city, state }
          }
        });
      }

      return NextResponse.json({
        show: showDetails,
        songAudio: null,
        found: false,
        candidates: searchResult.candidates,
        searchInfo: {
          totalCandidates: searchResult.candidates.length,
          bestScore: searchResult.candidates[0]?.score,
          searchQuery: { date, venue, city, state }
        }
      });
    }

  } catch (error: any) {
    console.error('Audio search failed:', error);
    return NextResponse.json(
      { error: 'Audio search failed', details: error.message },
      { status: 500 }
    );
  }
}
