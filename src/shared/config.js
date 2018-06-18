export const DESKTOP_VERSION = '0.1.7';

export const defaultNode = 'https://trinity.iota.fm:443';

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

export const UPDATE_URL = 'https://trinity-alpha.iota.org/release';
export const NODELIST_URL = 'https://nodes.iota.works/api/ssl/live';

export const DEFAULT_DEPTH = 4;
export const DEFAULT_MIN_WEIGHT_MAGNITUDE = 14;
export const DEFAULT_TAG = 'TRINITY';
export const DEFAULT_SECURITY = 2;
export const DEFAULT_BALANCES_THRESHOLD = 100;

export const BUNDLE_OUTPUTS_THRESHOLD = 50;
