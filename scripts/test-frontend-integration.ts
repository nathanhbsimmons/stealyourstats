#!/usr/bin/env tsx

import { config } from 'dotenv';
import { resolve } from 'path';

// Load environment variables from .env file
config({ path: resolve(__dirname, '../.env') });

const BASE_URL = 'http://localhost:3001';

interface TestCase {
  name: string;
  searchQuery: string;
  expectedSongs: string[];
  expectedSongSlug?: string;
}

const testCases: TestCase[] = [
  {
    name: "Search for 'Jack Straw'",
    searchQuery: "jack straw",
    expectedSongs: ["Jack Straw"],
    expectedSongSlug: "jack-straw"
  },
  {
    name: "Search for 'China Cat'",
    searchQuery: "china cat",
    expectedSongs: ["China Cat Sunflower"],
    expectedSongSlug: "china-cat-sunflower"
  },
  {
    name: "Search for 'Scarlet'",
    searchQuery: "scarlet",
    expectedSongs: ["Scarlet Begonias"],
    expectedSongSlug: "scarlet-begonias"
  },
  {
    name: "Search for 'Fire'",
    searchQuery: "fire",
    expectedSongs: ["Fire on the Mountain"],
    expectedSongSlug: "fire-on-the-mountain"
  },
  {
    name: "Search for 'Truckin'",
    searchQuery: "truckin",
    expectedSongs: ["Truckin'"],
    expectedSongSlug: "truckin"
  }
];

async function testSearchEndpoint(testCase: TestCase): Promise<boolean> {
  try {
    console.log(`🔍 Testing: ${testCase.name}`);
    
    const response = await fetch(`${BASE_URL}/api/songs?q=${encodeURIComponent(testCase.searchQuery)}&limit=5`);
    
    if (!response.ok) {
      console.log(`❌ Search failed with status: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (data.source !== 'index') {
      console.log(`❌ Expected source 'index', got '${data.source}'`);
      return false;
    }
    
    if (!data.songs || data.songs.length === 0) {
      console.log(`❌ No songs returned for query: ${testCase.searchQuery}`);
      return false;
    }
    
    const foundSongs = data.songs.map((song: any) => song.title);
    const allExpectedFound = testCase.expectedSongs.every(expected => 
      foundSongs.some(found => found.toLowerCase().includes(expected.toLowerCase()))
    );
    
    if (!allExpectedFound) {
      console.log(`❌ Expected songs: ${testCase.expectedSongs.join(', ')}, Found: ${foundSongs.join(', ')}`);
      return false;
    }
    
    console.log(`✅ Search successful: Found ${data.songs.length} songs`);
    return true;
    
  } catch (error) {
    console.log(`❌ Search test failed:`, error);
    return false;
  }
}

async function testSongDetailEndpoint(testCase: TestCase): Promise<boolean> {
  if (!testCase.expectedSongSlug) {
    return true; // Skip if no slug expected
  }
  
  try {
    console.log(`📖 Testing song details for: ${testCase.expectedSongSlug}`);
    
    const response = await fetch(`${BASE_URL}/api/songs/${testCase.expectedSongSlug}`);
    
    if (!response.ok) {
      console.log(`❌ Song detail failed with status: ${response.status}`);
      return false;
    }
    
    const data = await response.json();
    
    if (!data.song || !data.shows) {
      console.log(`❌ Invalid song detail response structure`);
      return false;
    }
    
    if (data.song.title !== testCase.expectedSongs[0]) {
      console.log(`❌ Song title mismatch: expected '${testCase.expectedSongs[0]}', got '${data.song.title}'`);
      return false;
    }
    
    if (data.shows.length === 0) {
      console.log(`❌ No shows returned for song`);
      return false;
    }
    
    console.log(`✅ Song detail successful: ${data.shows.length} shows found`);
    return true;
    
  } catch (error) {
    console.log(`❌ Song detail test failed:`, error);
    return false;
  }
}

async function runIntegrationTests() {
  console.log('🧪 Starting Frontend Integration Tests...\n');
  
  let passedTests = 0;
  let totalTests = 0;
  
  for (const testCase of testCases) {
    totalTests += 2; // Search + Song Detail
    
    // Test search endpoint
    const searchPassed = await testSearchEndpoint(testCase);
    if (searchPassed) passedTests++;
    
    // Test song detail endpoint
    const detailPassed = await testSongDetailEndpoint(testCase);
    if (detailPassed) passedTests++;
    
    console.log(''); // Empty line for readability
  }
  
  console.log('📊 Test Results:');
  console.log(`✅ Passed: ${passedTests}/${totalTests}`);
  console.log(`❌ Failed: ${totalTests - passedTests}/${totalTests}`);
  
  if (passedTests === totalTests) {
    console.log('\n🎉 All tests passed! Frontend integration is working perfectly!');
  } else {
    console.log('\n⚠️  Some tests failed. Check the logs above for details.');
  }
}

// Check if dev server is running
async function checkDevServer() {
  try {
    const response = await fetch(`${BASE_URL}/api/songs?q=test&limit=1`);
    return response.ok;
  } catch {
    return false;
  }
}

async function main() {
  console.log('🚀 Frontend Integration Test Suite');
  console.log('=====================================\n');
  
  // Check if dev server is running
  console.log('🔍 Checking if dev server is running...');
  const serverRunning = await checkDevServer();
  
  if (!serverRunning) {
    console.log('❌ Dev server is not running on port 3001');
    console.log('Please start the dev server with: npm run dev');
    process.exit(1);
  }
  
  console.log('✅ Dev server is running on port 3001\n');
  
  // Run the integration tests
  await runIntegrationTests();
}

if (require.main === module) {
  main().catch(console.error);
}
