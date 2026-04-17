import 'react-native-gesture-handler/jestSetup';

// Mock AsyncStorage
jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// Mock react-native-document-picker
jest.mock('react-native-document-picker', () => ({
  pick: jest.fn(),
  isCancel: jest.fn(() => false),
  types: {pdf: 'pdf', images: 'images'},
}));

// Mock react-native-fs
jest.mock('react-native-fs', () => ({
  DocumentDirectoryPath: '/mock/documents',
  readFile: jest.fn(() => Promise.resolve('base64content')),
  writeFile: jest.fn(() => Promise.resolve()),
  exists: jest.fn(() => Promise.resolve(true)),
}));

// Mock react-native-share
jest.mock('react-native-share', () => ({
  default: {
    open: jest.fn(() => Promise.resolve()),
    shareSingle: jest.fn(() => Promise.resolve()),
  },
}));

// Mock react-native-vector-icons
jest.mock('react-native-vector-icons/MaterialIcons', () => 'Icon');

// Mock Toast
jest.mock('react-native-toast-message', () => ({
  show: jest.fn(),
  hide: jest.fn(),
}));

// Mock uuid
jest.mock('react-native-uuid', () => ({
  v4: () => 'mock-uuid-1234',
}));

// Silence specific warnings
const originalWarn = console.warn;
beforeAll(() => {
  console.warn = (...args) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Animated: `useNativeDriver`')
    ) {
      return;
    }
    originalWarn.call(console, ...args);
  };
});

afterAll(() => {
  console.warn = originalWarn;
});
