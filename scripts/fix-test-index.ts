#!/usr/bin/env tsx

import * as fs from 'fs';
import { resolve } from 'path';

async function fixTestIndex() {
  try {
    console.log('🔧 Fixing test index with real Cornell \'77 identifier...');
    
    const indexPath = resolve(__dirname, '../data/test-index.json');
    const testIndex = JSON.parse(fs.readFileSync(indexPath, 'utf8'));
    
    // Replace the old Cornell '77 identifier with the real one
    const oldId = 'gd1977-05-08.rolfe.miller.28591.sbeok.flac16';
    const newId = 'gd1977-05-08.137571.mtx-2aud.dusborne.flac24';
    
    let updatedCount = 0;
    
    testIndex.songs.forEach((song: any) => {
      song.shows.forEach((show: any) => {
        if (show.id === oldId) {
          show.id = newId;
          updatedCount++;
        }
      });
      
      if (song.firstPerformance.id === oldId) {
        song.firstPerformance.id = newId;
      }
      if (song.lastPerformance.id === oldId) {
        song.lastPerformance.id = newId;
      }
    });
    
    // Write the updated index back to file
    fs.writeFileSync(indexPath, JSON.stringify(testIndex, null, 2));
    
    console.log(`✅ Successfully updated ${updatedCount} show identifiers!`);
    console.log(`   ${oldId} → ${newId}`);
    console.log('📁 Updated test index saved to:', indexPath);
    
  } catch (error) {
    console.error('❌ Failed to fix test index:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  fixTestIndex();
}
