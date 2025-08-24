// Test setup file for Vitest
import { vi } from 'vitest';

// Mock console methods to reduce noise in tests
global.console = {
  ...console,
  log: vi.fn(),
  debug: vi.fn(),
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
};

// Mock window object for browser APIs
Object.defineProperty(global, 'window', {
  value: {
    AudioContext: vi.fn(),
    MediaElementAudioSourceNode: vi.fn(),
    ScriptProcessorNode: vi.fn(),
  },
  writable: true,
});

// Mock Web Audio API
Object.defineProperty(global, 'AudioContext', {
  value: vi.fn().mockImplementation(() => ({
    createMediaElementSource: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
    }),
    createScriptProcessor: vi.fn().mockReturnValue({
      connect: vi.fn(),
      disconnect: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    }),
    sampleRate: 44100,
    state: 'running',
    resume: vi.fn(),
    suspend: vi.fn(),
    close: vi.fn(),
  })),
  writable: true,
});

// Mock HTMLAudioElement
Object.defineProperty(global, 'HTMLAudioElement', {
  value: vi.fn().mockImplementation(() => ({
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    play: vi.fn().mockResolvedValue(undefined),
    pause: vi.fn(),
    currentTime: 0,
    duration: 300,
    volume: 0.7,
  })),
  writable: true,
});

// Mock ResizeObserver
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock IntersectionObserver
global.IntersectionObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

// Mock matchMedia
Object.defineProperty(global, 'matchMedia', {
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
  writable: true,
});

// Mock requestAnimationFrame
global.requestAnimationFrame = vi.fn().mockImplementation((callback) => {
  setTimeout(callback, 0);
  return 1;
});

global.cancelAnimationFrame = vi.fn();

// Mock performance API
Object.defineProperty(global, 'performance', {
  value: {
    now: vi.fn(() => Date.now()),
    mark: vi.fn(),
    measure: vi.fn(),
    getEntriesByType: vi.fn(() => []),
    getEntriesByName: vi.fn(() => []),
    clearMarks: vi.fn(),
    clearMeasures: vi.fn(),
    timeOrigin: Date.now(),
  },
  writable: true,
});

// Mock URL API
Object.defineProperty(global, 'URL', {
  value: vi.fn().mockImplementation((url, base) => ({
    href: url,
    origin: 'http://localhost',
    protocol: 'http:',
    host: 'localhost',
    hostname: 'localhost',
    port: '',
    pathname: '/',
    search: '',
    searchParams: new URLSearchParams(),
    hash: '',
    username: '',
    password: '',
    toString: () => url,
  })),
  writable: true,
});

// Mock URLSearchParams
Object.defineProperty(global, 'URLSearchParams', {
  value: vi.fn().mockImplementation((init) => ({
    get: vi.fn(),
    getAll: vi.fn(),
    has: vi.fn(),
    set: vi.fn(),
    append: vi.fn(),
    delete: vi.fn(),
    toString: vi.fn(() => ''),
    forEach: vi.fn(),
    keys: vi.fn(() => []),
    values: vi.fn(() => []),
    entries: vi.fn(() => []),
  })),
  writable: true,
});

// Mock AbortController
Object.defineProperty(global, 'AbortController', {
  value: vi.fn().mockImplementation(() => ({
    signal: {
      aborted: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      // Add the properties that ky expects
      [Symbol.toStringTag]: 'AbortSignal',
    },
    abort: vi.fn(),
  })),
  writable: true,
});

// Mock AbortSignal
Object.defineProperty(global, 'AbortSignal', {
  value: vi.fn().mockImplementation(() => ({
    aborted: false,
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    // Add the properties that ky expects
    [Symbol.toStringTag]: 'AbortSignal',
  })),
  writable: true,
});

// Mock TextEncoder/TextDecoder
Object.defineProperty(global, 'TextEncoder', {
  value: vi.fn().mockImplementation(() => ({
    encode: vi.fn((input) => Buffer.from(input, 'utf8')),
    encodeInto: vi.fn(),
  })),
  writable: true,
});

Object.defineProperty(global, 'TextDecoder', {
  value: vi.fn().mockImplementation(() => ({
    decode: vi.fn((input) => Buffer.from(input).toString('utf8')),
  })),
  writable: true,
});

// Mock crypto API
Object.defineProperty(global, 'crypto', {
  value: {
    getRandomValues: vi.fn((array) => {
      for (let i = 0; i < array.length; i++) {
        array[i] = Math.floor(Math.random() * 256);
      }
      return array;
    }),
    randomUUID: vi.fn(() => 'mock-uuid'),
  },
  writable: true,
});
