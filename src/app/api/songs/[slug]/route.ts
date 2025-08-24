import { NextRequest, NextResponse } from 'next/server';
import { songIndexService } from '@/lib/song-index';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ slug: string }> }
) {
  try {
    const { slug } = await params;
    console.log('Fetching song details for slug:', slug);
    
    // Check if we need to build/rebuild the index
    if (songIndexService.shouldRebuildIndex()) {
      console.log('Building song index...');
      await songIndexService.buildIndex();
    }
    
    // Get song details from the index
    const songDetails = songIndexService.getSongDetails(slug);
    
    if (!songDetails) {
      console.log(`Song not found in index: ${slug}`);
      return NextResponse.json({ error: 'Song not found' }, { status: 404 });
    }
    
    console.log(`Found song in index: ${songDetails.title} with ${songDetails.shows.length} shows`);
    
    // Sort shows by date
    const sortedShows = [...songDetails.shows].sort((a, b) => 
      new Date(a.date.split('-').reverse().join('-')).getTime() - 
      new Date(b.date.split('-').reverse().join('-')).getTime()
    );
    
    // Get first and last performance
    const firstShow = sortedShows[0];
    const lastShow = sortedShows[sortedShows.length - 1];
    
    // Calculate statistics
    const years = [...new Set(sortedShows.map(show => show.year))].sort();
    const eraHints = years.map(year => ({
      year: year.toString(),
      label: songDetails.shows.find(show => show.year === year)?.era || 'Unknown Era'
    }));
    
    // Create song detail response
    const songDetail = {
      song: {
        id: `index-${songDetails.slug}`,
        title: songDetails.title,
        slug: songDetails.slug,
        artist: { name: 'Grateful Dead' },
        altTitles: songDetails.altTitles,
        artistId: 'grateful-dead'
      },
      shows: sortedShows,
      counts: {
        total: songDetails.totalPerformances,
        openers: 0 // We don't have this info from setlist.fm
      },
      debutShow: firstShow,
      lastShow: lastShow,
      eraHints,
      sampling: {
        avgDurationByYear: {} // We don't have duration info from setlist.fm
      },
      highestBpm: null, // We don't have BPM info from setlist.fm
      lowestBpm: null,
      longest: null,
      shortest: null
    };
    
    return NextResponse.json(songDetail);
    
  } catch (error: any) {
    console.error('Error fetching song details:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
