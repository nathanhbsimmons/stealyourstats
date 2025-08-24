#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';
import { SongIndex, SongIndexEntry, ShowInfo } from '../src/types';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

// Mock data for well-known Grateful Dead songs
const mockSongs: SongIndexEntry[] = [
  {
    title: "Jack Straw",
    slug: "jack-straw",
    altTitles: ["Jack Straw", "Jack Straw from Wichita"],
    shows: [
      {
        id: "gd1977-05-08",
        date: "08-05-1977",
        venue: {
          id: "barton-hall",
          name: "Barton Hall, Cornell University",
          city: "Ithaca",
          country: "United States"
        },
        year: 1977,
        era: "Return + '77 Era"
      },
      {
        id: "gd1978-04-15",
        date: "15-04-1978",
        venue: {
          id: "capitol-theatre",
          name: "Capitol Theatre",
          city: "Passaic",
          country: "United States"
        },
        year: 1978,
        era: "Return + '77 Era"
      },
      {
        id: "gd1980-09-06",
        date: "06-09-1980",
        venue: {
          id: "red-rocks",
          name: "Red Rocks Amphitheatre",
          city: "Morrison",
          country: "United States"
        },
        year: 1980,
        era: "Brent Early Era"
      }
    ],
    totalPerformances: 3,
    firstPerformance: {
      id: "gd1977-05-08",
      date: "08-05-1977",
      venue: {
        id: "barton-hall",
        name: "Barton Hall, Cornell University",
        city: "Ithaca",
        country: "United States"
      },
      year: 1977,
      era: "Return + '77 Era"
    },
    lastPerformance: {
      id: "gd1980-09-06",
      date: "06-09-1980",
      venue: {
        id: "red-rocks",
        name: "Red Rocks Amphitheatre",
        city: "Morrison",
        country: "United States"
      },
      year: 1980,
      era: "Brent Early Era"
    }
  },
  {
    title: "China Cat Sunflower",
    slug: "china-cat-sunflower",
    altTitles: ["China Cat Sunflower", "China Cat"],
    shows: [
      {
        id: "gd1969-02-27",
        date: "27-02-1969",
        venue: {
          id: "fillmore-west",
          name: "Fillmore West",
          city: "San Francisco",
          country: "United States"
        },
        year: 1969,
        era: "Pigpen Peak Era"
      },
      {
        id: "gd1972-05-04",
        date: "04-05-1972",
        venue: {
          id: "olympia-theatre",
          name: "Olympia Theatre",
          city: "Paris",
          country: "France"
        },
        year: 1972,
        era: "Europe '72 Era"
      },
      {
        id: "gd1977-05-08",
        date: "08-05-1977",
        venue: {
          id: "barton-hall",
          name: "Barton Hall, Cornell University",
          city: "Ithaca",
          country: "United States"
        },
        year: 1977,
        era: "Return + '77 Era"
      },
      {
        id: "gd1980-09-06",
        date: "06-09-1980",
        venue: {
          id: "red-rocks",
          name: "Red Rocks Amphitheatre",
          city: "Morrison",
          country: "United States"
        },
        year: 1980,
        era: "Brent Early Era"
      }
    ],
    totalPerformances: 4,
    firstPerformance: {
      id: "gd1969-02-27",
      date: "27-02-1969",
      venue: {
        id: "fillmore-west",
        name: "Fillmore West",
        city: "San Francisco",
        country: "United States"
      },
      year: 1969,
      era: "Pigpen Peak Era"
    },
    lastPerformance: {
      id: "gd1980-09-06",
      date: "06-09-1980",
      venue: {
        id: "red-rocks",
        name: "Red Rocks Amphitheatre",
        city: "Morrison",
        country: "United States"
      },
      year: 1980,
      era: "Brent Early Era"
    }
  },
  {
    title: "Scarlet Begonias",
    slug: "scarlet-begonias",
    altTitles: ["Scarlet Begonias"],
    shows: [
      {
        id: "gd1974-06-20",
        date: "20-06-1974",
        venue: {
          id: "miami-jai-alai",
          name: "Miami Jai-Alai Fronton",
          city: "Miami",
          country: "United States"
        },
        year: 1974,
        era: "Wall of Sound Era"
      },
      {
        id: "gd1977-05-08",
        date: "08-05-1977",
        venue: {
          id: "barton-hall",
          name: "Barton Hall, Cornell University",
          city: "Ithaca",
          country: "United States"
        },
        year: 1977,
        era: "Return + '77 Era"
      }
    ],
    totalPerformances: 2,
    firstPerformance: {
      id: "gd1974-06-20",
      date: "20-06-1974",
      venue: {
        id: "miami-jai-alai",
        name: "Miami Jai-Alai Fronton",
        city: "Miami",
        country: "United States"
      },
      year: 1974,
      era: "Wall of Sound Era"
    },
    lastPerformance: {
      id: "gd1977-05-08",
      date: "08-05-1977",
      venue: {
        id: "barton-hall",
        name: "Barton Hall, Cornell University",
        city: "Ithaca",
        country: "United States"
      },
      year: 1977,
      era: "Return + '77 Era"
    }
  },
  {
    title: "Fire on the Mountain",
    slug: "fire-on-the-mountain",
    altTitles: ["Fire on the Mountain", "Fire"],
    shows: [
      {
        id: "gd1977-05-08",
        date: "08-05-1977",
        venue: {
          id: "barton-hall",
          name: "Barton Hall, Cornell University",
          city: "Ithaca",
          country: "United States"
        },
        year: 1977,
        era: "Return + '77 Era"
      },
      {
        id: "gd1980-09-06",
        date: "06-09-1980",
        venue: {
          id: "red-rocks",
          name: "Red Rocks Amphitheatre",
          city: "Morrison",
          country: "United States"
        },
        year: 1980,
        era: "Brent Early Era"
      }
    ],
    totalPerformances: 2,
    firstPerformance: {
      id: "gd1977-05-08",
      date: "08-05-1977",
      venue: {
        id: "barton-hall",
        name: "Barton Hall, Cornell University",
        city: "Ithaca",
        country: "United States"
      },
      year: 1977,
      era: "Return + '77 Era"
    },
    lastPerformance: {
      id: "gd1980-09-06",
      date: "06-09-1980",
      venue: {
        id: "red-rocks",
        name: "Red Rocks Amphitheatre",
        city: "Morrison",
        country: "United States"
      },
      year: 1980,
      era: "Brent Early Era"
    }
  },
  {
    title: "Truckin'",
    slug: "truckin",
    altTitles: ["Truckin'", "Truckin"],
    shows: [
      {
        id: "gd1970-05-02",
        date: "02-05-1970",
        venue: {
          id: "harpur-college",
          name: "Harpur College",
          city: "Binghamton",
          country: "United States"
        },
        year: 1970,
        era: "Pigpen Peak Era"
      },
      {
        id: "gd1977-05-08",
        date: "08-05-1977",
        venue: {
          id: "barton-hall",
          name: "Barton Hall, Cornell University",
          city: "Ithaca",
          country: "United States"
        },
        year: 1977,
        era: "Return + '77 Era"
      }
    ],
    totalPerformances: 2,
    firstPerformance: {
      id: "gd1970-05-02",
      date: "02-05-1970",
      venue: {
        id: "harpur-college",
        name: "Harpur College",
        city: "Binghamton",
        country: "United States"
      },
      year: 1970,
      era: "Pigpen Peak Era"
    },
    lastPerformance: {
      id: "gd1977-05-08",
      date: "08-05-1977",
      venue: {
        id: "barton-hall",
        name: "Barton Hall, Cornell University",
        city: "Ithaca",
        country: "United States"
      },
      year: 1977,
      era: "Return + '77 Era"
    }
  }
];

async function main() {
  console.log('🎭 Creating Test Grateful Dead Song Index...');
  console.log('This will create a mock index with well-known songs for testing.\n');
  
  try {
    // Create the test index
    const testIndex: SongIndex = {
      songs: mockSongs,
      lastUpdated: new Date().toISOString(),
      totalShows: mockSongs.reduce((total, song) => total + song.shows.length, 0)
    };
    
    console.log('✅ Test index created successfully!');
    console.log(`📊 Found ${testIndex.songs.length} songs`);
    console.log(`🎭 Across ${testIndex.totalShows} shows`);
    console.log(`🕒 Created at: ${testIndex.lastUpdated}`);
    
    // Show the songs
    console.log('\n🎵 Songs in test index:');
    testIndex.songs.forEach(song => {
      console.log(`  • ${song.title} (${song.totalPerformances} performances)`);
      console.log(`    - First: ${song.firstPerformance.date} at ${song.firstPerformance.venue.name}`);
      console.log(`    - Last: ${song.lastPerformance.date} at ${song.lastPerformance.venue.name}`);
    });
    
    // Save to a JSON file for inspection
    const fs = require('fs');
    const path = resolve(__dirname, '../data/test-index.json');
    
    // Ensure data directory exists
    const dataDir = resolve(__dirname, '../data');
    if (!fs.existsSync(dataDir)) {
      fs.mkdirSync(dataDir, { recursive: true });
    }
    
    fs.writeFileSync(path, JSON.stringify(testIndex, null, 2));
    console.log(`\n💾 Test index saved to: ${path}`);
    
    console.log('\n🎉 Your test index is ready!');
    console.log('Now you can test the search functionality with these known songs.');
    console.log('\nTest searches to try:');
    console.log('  • "jack straw"');
    console.log('  • "china cat"');
    console.log('  • "scarlet"');
    console.log('  • "fire"');
    console.log('  • "truckin"');
    
  } catch (error) {
    console.error('\n❌ Failed to create test index:', error);
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}
