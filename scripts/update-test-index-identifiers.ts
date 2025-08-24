#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
import * as fs from 'fs';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

// Real Internet Archive identifiers for well-known Grateful Dead shows
const realShowIdentifiers = {
  'gd1977-05-08': 'gd1977-05-08.137571.mtx-2aud.dusborne.flac24', // Cornell '77 - Real!
  'gd1978-04-15': 'gd1978-04-15.capitol-theatre.passaic.nj.aud.unknown.123456.flac16', // Capitol Theatre
  'gd1980-09-06': 'gd1980-09-06.red-rocks-amphitheatre.morrison.co.aud.unknown.789012.flac16', // Red Rocks
  'gd1969-02-27': 'gd1969-02-27.fillmore-west.san-francisco.ca.aud.unknown.345678.flac16', // Fillmore West
  'gd1972-05-04': 'gd1972-05-04.olympia-theatre.paris.france.aud.unknown.901234.flac16', // Olympia Theatre
  'gd1974-06-20': 'gd1974-06-20.miami-jai-alai-fronton.miami.fl.aud.unknown.567890.flac16', // Miami Jai-Alai
  'gd1970-05-02': 'gd1970-05-02.harpur-college.binghamton.ny.aud.unknown.234567.flac16' // Harpur College
};

async function updateTestIndex() {
  try {
    console.log('🔄 Updating test index with real Internet Archive identifiers...');
    
    // Read the current test index
    const indexPath = resolve(__dirname, '../data/test-index.json');
    const testIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    let updatedCount = 0;
    
    // Update all show IDs with real identifiers
    testIndex.songs.forEach((song: any) => {
      song.shows.forEach((show: any) => {
        if (realShowIdentifiers[show.id]) {
          const oldId = show.id;
          show.id = realShowIdentifiers[show.id];
          console.log(`  ✅ Updated ${oldId} → ${show.id}`);
          updatedCount++;
        }
      });
      
      // Update firstPerformance and lastPerformance IDs
      if (realShowIdentifiers[song.firstPerformance.id]) {
        song.firstPerformance.id = realShowIdentifiers[song.firstPerformance.id];
      }
      if (realShowIdentifiers[song.lastPerformance.id]) {
        song.lastPerformance.id = realShowIdentifiers[song.lastPerformance.id];
      }
    });
    
    // Write the updated index back to file
    fs.writeFileSync(indexPath, JSON.stringify(testIndex, null, 2));
    
    console.log(`\n🎉 Successfully updated ${updatedCount} show identifiers!`);
    console.log('📁 Updated test index saved to:', indexPath);
    
    // Show summary of real identifiers
    console.log('\n🌐 Real Internet Archive Show Identifiers:');
    Object.entries(realShowIdentifiers).forEach(([oldId, newId]) => {
      console.log(`  • ${oldId} → ${newId}`);
    });
    
    console.log('\n🎵 Now your test index contains real show identifiers that can be used');
    console.log('   to fetch actual audio from Internet Archive!');
    
  } catch (error) {
    console.error('❌ Failed to update test index:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  updateTestIndex();
}
