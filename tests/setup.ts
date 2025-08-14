// Test setup for Chrome extension testing

// Mock Chrome extension APIs
global.chrome = {
  runtime: {
    getManifest: jest.fn(() => ({ version: '1.0.0' })),
    sendMessage: jest.fn(),
    onMessage: {
      addListener: jest.fn(),
      removeListener: jest.fn()
    }
  },
  storage: {
    local: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    },
    sync: {
      get: jest.fn(),
      set: jest.fn(),
      remove: jest.fn(),
      clear: jest.fn()
    }
  },
  tabs: {
    create: jest.fn(),
    query: jest.fn(),
    sendMessage: jest.fn()
  },
  i18n: {
    getMessage: jest.fn((key: string) => key)
  }
} as any;

// Mock performance API
Object.defineProperty(window, 'performance', {
  writable: true,
  value: {
    now: jest.fn(() => Date.now())
  }
});

// Mock crypto API
Object.defineProperty(window, 'crypto', {
  writable: true,
  value: {
    randomUUID: jest.fn(() => 'test-uuid-123')
  }
});

// Mock fetch API
global.fetch = jest.fn();

// Mock MutationObserver
global.MutationObserver = class {
  constructor(_callback: MutationCallback) {}
  observe() {}
  disconnect() {}
} as any;

// Mock ResizeObserver
global.ResizeObserver = class {
  constructor(_callback: ResizeObserverCallback) {}
  observe() {}
  disconnect() {}
} as any;

// Mock IntersectionObserver
global.IntersectionObserver = class {
  constructor(_callback: IntersectionObserverCallback) {}
  observe() {}
  disconnect() {}
} as any;

// Setup console mocks for cleaner test output
const originalConsole = { ...console };
beforeAll(() => {
  console.log = jest.fn();
  console.warn = jest.fn();
  console.error = jest.fn();
});

afterAll(() => {
  console.log = originalConsole.log;
  console.warn = originalConsole.warn;
  console.error = originalConsole.error;
});
