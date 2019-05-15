export const __DEV__ = process.env.NODE_ENV === 'development';
export const __TEST__ = process.env.NODE_ENV === 'test';
export const __MOBILE__ = typeof navigator !== 'undefined' && navigator.product === 'ReactNative';

/** Default IRI node */
export const defaultNode = __TEST__ ? 'http://localhost:14265' : 'https://nodes.iota.org';

export const nodesWithPowDisabled = ['https://trinity.iota-tangle.io:14265', 'https://node.iota-tangle.io:14265'];

export const nodesWithPowEnabled = [
    'https://nodes.iota.org',
    'https://nodes.thetangle.org:443',
    'https://iotanode.us:443',
    'https://pool.trytes.eu',
    'https://pow.iota.community:443',
];

export const nodes = [...nodesWithPowEnabled, ...nodesWithPowDisabled];

export const NODELIST_URL = 'https://nodes.iota.works/api/ssl/live';

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
export const WERE_ADDRESSES_SPENT_FROM_REQUEST_TIMEOUT = 4000;
export const ATTACH_TO_TANGLE_REQUEST_TIMEOUT = 25000;
export const GET_TRANSACTIONS_TO_APPROVE_REQUEST_TIMEOUT = 40000;

export const DEFAULT_RETRIES = 4;

export const IRI_API_VERSION = '1';

export const QUORUM_THRESHOLD = 67;
export const QUORUM_SIZE = 4;
export const QUORUM_SYNC_CHECK_INTERVAL = 120;
export const MINIMUM_QUORUM_SIZE = 2;

/** Maximum milestone fallbehind threshold for node sync checks */
export const MAX_MILESTONE_FALLBEHIND = 2;
