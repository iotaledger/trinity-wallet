export const __DEV__ = process.env.NODE_ENV === 'development';
export const __TEST__ = process.env.NODE_ENV === 'test';

/** Default IRI node */
export const defaultNode = __TEST__ ? 'http://localhost:14265' : 'https://trinity.iota.fm:443';

export const nodesWithPoWEnabled = [
    'https://pow1.iota.community:443',
    'https://pow2.iota.community:443',
    'https://pow3.iota.community:443',
    'https://pow4.iota.community:443',
    'https://pow5.iota.community:443',
    'https://pow6.iota.community:443',
    'https://nodes.iota.fm:443',
    'https://trinity.iota.fm:443',
    'https://iri2.iota.fm:443',
    'https://iotanode.us:443',
];

const nodesWithPoWDisabled = [
    'https://peanut.iotasalad.org:14265',
    'https://potato.iotasalad.org:14265',
    'https://tuna.iotasalad.org:14265',
    'https://durian.iotasalad.org:14265',
    'https://nodes.iota.cafe:443',
    'https://nodes.thetangle.org:443',
];

export const nodes = [...nodesWithPoWEnabled, ...nodesWithPoWDisabled];

export const NODELIST_URL = 'https://nodes.iota.works/api/ssl/live';

export const DEFAULT_DEPTH = 4;
export const DEFAULT_MIN_WEIGHT_MAGNITUDE = 14;
export const DEFAULT_TAG = 'TRINITY';
export const DEFAULT_SECURITY = 2;
export const DEFAULT_BALANCES_THRESHOLD = 100;

export const BUNDLE_OUTPUTS_THRESHOLD = 50;

export const NODE_REQUEST_TIMEOUT = 6000;

export const DEFAULT_RETRIES = 4;

export const IRI_API_VERSION = '1';
