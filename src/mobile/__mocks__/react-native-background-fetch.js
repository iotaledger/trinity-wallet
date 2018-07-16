jest.mock('react-native-background-fetch', () => ({
    stop: jest.fn(),
    configure: jest.fn(),
    finish: jest.fn(),
    status: jest.fn(() => Promise.resolve(2)),
}));
