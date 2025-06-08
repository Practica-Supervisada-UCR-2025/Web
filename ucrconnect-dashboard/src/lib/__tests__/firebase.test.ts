import { initializeApp, getApps } from 'firebase/app';
import { getAuth } from 'firebase/auth';

// Clear module cache before each test
beforeEach(() => {
  jest.clearAllMocks();
  jest.resetModules();
  process.env.NEXT_PUBLIC_FIREBASE_API_KEY = 'test-api-key';
  process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID = 'test-project-id';
  process.env.NEXT_PUBLIC_FIREBASE_APP_ID = 'test-app-id';
  process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN = 'test-project-id.firebaseapp.com';
  process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET = 'test-project-id.appspot.com';
  process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID = 'test-sender-id';
});

describe('firebase', () => {
  it('initializes a new app when no apps exist', async () => {
    // Mock firebase/app directly within the test
    const mockInitializeApp = jest.fn(() => ({}));
    const mockGetApps = jest.fn(() => []);
    jest.mock('firebase/app', () => ({
      initializeApp: mockInitializeApp,
      getApps: mockGetApps,
    }));

    // Mock firebase/auth
    const mockAuthObject = {}; // Define the mock auth object
    const mockGetAuth = jest.fn(() => mockAuthObject);
    jest.mock('firebase/auth', () => ({
      getAuth: mockGetAuth,
    }));

    // Dynamically import the module after setting up mocks
    const firebaseModule = await import('../firebase');
    const { auth } = firebaseModule;

    // Verify initializeApp was called
    expect(mockInitializeApp).toHaveBeenCalledWith({
      apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
      authDomain: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.firebaseapp.com`,
      projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
      storageBucket: `${process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID}.appspot.com`,
      messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
      appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
    });
    expect(mockGetAuth).toHaveBeenCalledWith({}); // Expecting the mocked app
    expect(auth).toBe(mockAuthObject); // Check if it's the exact mocked object
  });

  it('uses existing app when one exists', async () => {
    const mockApp = {};
    // Mock firebase/app directly within the test
    const mockInitializeApp = jest.fn(() => ({}));
    const mockGetApps = jest.fn(() => [mockApp]);
    jest.mock('firebase/app', () => ({
      initializeApp: mockInitializeApp,
      getApps: mockGetApps,
    }));

    // Mock firebase/auth
    const mockAuthObject = {}; // Define the mock auth object
    const mockGetAuth = jest.fn(() => mockAuthObject);
    jest.mock('firebase/auth', () => ({
      getAuth: mockGetAuth,
    }));

    // Dynamically import the module after setting up mocks
    const firebaseModule = await import('../firebase');
    const { auth } = firebaseModule;

    // Verify initializeApp was not called
    expect(mockInitializeApp).not.toHaveBeenCalled();
    // Verify getAuth was called with the existing app
    expect(mockGetAuth).toHaveBeenCalledWith(mockApp);
    // Verify auth is exported correctly
    expect(auth).toBe(mockAuthObject); // Check if it's the exact mocked object
  });

  it('returns existing secondary app if already initialized', async () => {
  const mockSecondaryApp = { name: 'SecondaryApp' };
  const mockGetApps = jest.fn(() => [mockSecondaryApp]);
  const mockInitializeApp = jest.fn();
  const mockAuthObject = {};
  const mockGetAuth = jest.fn(() => mockAuthObject);

  jest.doMock('firebase/app', () => ({
    getApps: mockGetApps,
    initializeApp: mockInitializeApp,
  }));

  jest.doMock('firebase/auth', () => ({
    getAuth: mockGetAuth,
  }));

  const firebaseModule = await import('../firebase');
  const { getSecondaryAuth } = firebaseModule;

  const result = getSecondaryAuth();

  expect(mockInitializeApp).not.toHaveBeenCalled();
  expect(mockGetAuth).toHaveBeenCalledWith(mockSecondaryApp);
  expect(result).toEqual({ auth: mockAuthObject, app: mockSecondaryApp });
});

it('initializes secondary app if not already initialized', async () => {
  const mockSecondaryApp = { name: 'SecondaryApp' };
  const mockGetApps = jest.fn(() => []);
  const mockInitializeApp = jest.fn(() => mockSecondaryApp);
  const mockAuthObject = {};
  const mockGetAuth = jest.fn(() => mockAuthObject);

  jest.doMock('firebase/app', () => ({
    getApps: mockGetApps,
    initializeApp: mockInitializeApp,
  }));

  jest.doMock('firebase/auth', () => ({
    getAuth: mockGetAuth,
  }));

  const firebaseModule = await import('../firebase');
  const { getSecondaryAuth } = firebaseModule;

  const result = getSecondaryAuth();

  expect(mockInitializeApp).toHaveBeenCalledWith(expect.any(Object), 'SecondaryApp');
  expect(mockGetAuth).toHaveBeenCalledWith(mockSecondaryApp);
  expect(result).toEqual({ auth: mockAuthObject, app: mockSecondaryApp });
});
});