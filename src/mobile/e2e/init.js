/* global jasmine */
import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

const detox = require('detox');
const config = require('../package.json').detox;
const adapter = require('detox/runners/jest/adapter');

configure({ adapter: new Adapter() });

jasmine.DEFAULT_TIMEOUT_INTERVAL = 120000;
jasmine.getEnv().addReporter(adapter);

beforeAll(async () => {
    await detox.init(config);
});

beforeEach(async () => {
    await adapter.beforeEach();
});

afterAll(async () => {
    await adapter.afterAll();
    await detox.cleanup();
});
