import { NextRequest, NextResponse } from 'next/server';
import { songIndexService } from '@/lib/song-index';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get('q');
  const limit = parseInt(searchParams.get('limit') || '20');

  if (!query) {
    return NextResponse.json({ songs: [], source: 'index' });
  }

  try {
    console.log(`Searching song index for: ${query}`);
    
    // Check if we need to build/rebuild the index
    if (songIndexService.shouldRebuildIndex()) {
      console.log('Building song index...');
      await songIndexService.buildIndex();
    }
    
    // Search the local index
    const results = songIndexService.searchSongs(query, limit);
    
    // Convert to the expected format
    const songs = results.map(song => ({
      id: `index-${song.slug}`,
      title: song.title,
      slug: song.slug,
      artist: { name: 'Grateful Dead' },
      altTitles: song.altTitles,
      totalPerformances: song.totalPerformances
    }));
    
    console.log(`Found ${songs.length} songs in index`);
    
    return NextResponse.json({
      songs,
      source: 'index'
    });
    
  } catch (error: any) {
    console.error('Index search failed:', error);
    return NextResponse.json({ songs: [], source: 'index' });
  }
}


