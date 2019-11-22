export const __DEV__ = process.env.NODE_ENV === 'development';
export const __TEST__ = process.env.NODE_ENV === 'test';
export const __MOBILE__ = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

/** Default IRI node object */
export const DEFAULT_NODE = __TEST__
    ? {
          url: 'http://localhost:14265',
          pow: false,
          username: '',
          password: '',
      }
    : {
          url: 'https://nodes.iota.org',
          pow: false,
          username: '',
          password: '',
      };

export const NODES_WITH_POW_DISABLED = ['https://nodes.iota.org'].map((url) => ({
    url,
    pow: false,
    username: '',
    password: '',
}));

export const NODES_WITH_POW_ENABLED = [
    'https://nodes.thetangle.org:443',
    'https://iotanode.us:443',
    'https://pool.trytes.eu',
    'https://pow.iota.community:443',
].map((url) => ({
    url,
    pow: true,
    username: '',
    password: '',
}));

export const DEFAULT_NODES = [...NODES_WITH_POW_DISABLED, ...NODES_WITH_POW_ENABLED];

export const NODELIST_ENDPOINTS = [
    'https://nodes.iota.works/api/ssl/live',
    'https://iota-node-api.now.sh/api/ssl/live',
    'https://iota.dance/api/ssl/live',
];

export const MARKETDATA_ENDPOINTS = [
    'https://nodes.iota.works/api/market',
    'https://iota-node-api.now.sh/api/market',
    'https://iota.dance/api/market',
];

export const VERSIONS_URL =
    'https://raw.githubusercontent.com/iotaledger/trinity-wallet/develop/src/shared/libs/versions.json';

export const DEFAULT_DEPTH = 4;
export const DEFAULT_MIN_WEIGHT_MAGNITUDE = 14;
export const DEFAULT_TAG = 'TRINITY';
export const DEFAULT_SECURITY = 2;
export const DEFAULT_BALANCES_THRESHOLD = 100;

export const BUNDLE_OUTPUTS_THRESHOLD = 50;

export const MAX_REQUEST_TIMEOUT = 60 * 1000 * 2;

export const DEFAULT_NODE_REQUEST_TIMEOUT = 6000 * 2;
export const GET_NODE_INFO_REQUEST_TIMEOUT = 2500;
export const GET_BALANCES_REQUEST_TIMEOUT = 6000;
export const FETCH_REMOTE_NODES_REQUEST_TIMEOUT = 4000;
export const WERE_ADDRESSES_SPENT_FROM_REQUEST_TIMEOUT = 4000;
export const ATTACH_TO_TANGLE_REQUEST_TIMEOUT = 25000;
export const GET_TRANSACTIONS_TO_APPROVE_REQUEST_TIMEOUT = 40000;

export const DEFAULT_RETRIES = 4;

export const IRI_API_VERSION = '1';

export const QUORUM_THRESHOLD = 66;
export const QUORUM_SIZE = 3;
export const QUORUM_SYNC_CHECK_INTERVAL = 120;
export const MINIMUM_QUORUM_SIZE = 2;
export const MAXIMUM_QUORUM_SIZE = 7;

/** Maximum milestone fallbehind threshold for node sync checks */
export const MAX_MILESTONE_FALLBEHIND = 2;

export const SEED_VAULT_DEFAULT_TITLE = 'SeedVault';
