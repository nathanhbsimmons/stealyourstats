#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

// Debug: Check if environment variables are loaded
console.log('Environment check:');
console.log('SETLIST_FM_API_KEY:', process.env.SETLIST_FM_API_KEY ? 'SET' : 'NOT SET');
console.log('Current working directory:', process.cwd());
console.log('Env file path:', resolve(__dirname, '../.env'));

import { songIndexService } from '../src/lib/song-index';

async function main() {
  console.log('🚀 Building Grateful Dead Song Index...');
  console.log('This will crawl Setlist.fm to build a comprehensive song index.');
  console.log('This is a one-time operation that may take several minutes.\n');
  
  try {
    const startTime = Date.now();
    
    const index = await songIndexService.buildIndex();
    
    const endTime = Date.now();
    const duration = Math.round((endTime - startTime) / 1000);
    
    console.log('\n✅ Index built successfully!');
    console.log(`📊 Found ${index.songs.length} unique songs`);
    console.log(`🎭 Across ${index.totalShows} shows`);
    console.log(`⏱️  Took ${duration} seconds`);
    console.log(`🕒 Last updated: ${index.lastUpdated}`);
    
    // Show some sample songs
    console.log('\n🎵 Sample songs found:');
    index.songs.slice(0, 10).forEach(song => {
      console.log(`  • ${song.title} (${song.totalPerformances} performances)`);
    });
    
    if (index.songs.length > 10) {
      console.log(`  ... and ${index.songs.length - 10} more songs`);
    }
    
    console.log('\n🎉 Your song index is ready! Search will now be fast and reliable.');
    
  } catch (error) {
    console.error('\n❌ Failed to build index:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
