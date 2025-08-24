import { describe, it, expect } from 'vitest';

describe('Simple Fetch Test', () => {
  it('should make a simple HTTP request', async () => {
    try {
      // Test with a simple HTTP request to see if the issue is with ky or the test environment
      const response = await fetch('https://httpbin.org/get');
      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toBeDefined();
      console.log('Simple fetch test successful:', data);
    } catch (error) {
      console.error('Simple fetch test failed:', error);
      throw error;
    }
  }, 10000);
});
