import { describe, it, expect } from 'vitest';
import { NextRequest } from 'next/server';
import { GET as searchHandler } from '../app/api/songs/route';

describe('Search API Debug', () => {
  it('should parse URL search params correctly', async () => {
    const url = 'http://localhost:3000/api/songs?q=test&limit=10';
    console.log('Test URL:', url);
    
    const request = new NextRequest(url);
    console.log('Request URL:', request.url);
    
    const { searchParams } = new URL(request.url);
    console.log('Search params entries:', Array.from(searchParams.entries()));
    console.log('Query param:', searchParams.get('q'));
    console.log('Limit param:', searchParams.get('limit'));
    
    // Test the handler
    try {
      const response = await searchHandler(request);
      console.log('Response status:', response.status);
      
      const data = await response.json();
      console.log('Response data:', data);
      
      // If it's an error, log the error
      if (response.status !== 200) {
        console.log('Error response:', data);
      }
    } catch (error) {
      console.error('Handler threw error:', error);
      throw error;
    }
  });
});
