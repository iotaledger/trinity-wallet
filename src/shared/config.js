export const DESKTOP_VERSION = '0.1.5';

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

export const useLegacyQuorum = true;
export const quorumPoolSize = 12;
export const quorumThreshold = 0.665;
export const quorumPollFreq = 60 * 1000;
// A list of nodes for the quorum system.
export const quorumNodes = [
    'https://potato.iotasalad.org:14265',
    'https://durian.iotasalad.org:14265',
    'https://peanut.iotasalad.org:14265',
    'https://tuna.iotasalad.org:14265',
    'https://turnip.iotasalad.org:14265',
    'https://iotanode.us:443',
    'https://iota.wiremore.io:443',
    'https://nodes.iota.cafe:443',
    'https://wallet2.iota.town:443',
    'https://wallet1.iota.town:443',
    'https://node.iota-community.org:443',
    'https://node1.iotaner.org:443',
    'https://nodes.thetangle.org:443',
    'https://node.iota.moe:443',
    'https://alpha.tangle-nodes.com:443',
    'https://beta.tangle-nodes.com:443',
    'https://node.iota.mausbeweger.de:443',
    'https://iota.saru.moe',
    'https://iotanode.jlld.at:14265',
    'https://iota-node.phibit.io:443',
    'https://whitey.whitey13.org:13500',
    'https://iotanode2.jlld.at',
    'https://fuckup.patrick-schnell.de:443',
    'https://iotanode3.jlld.at:443',
    'https://trinity.iota.fm:443',
    'https://iri2.iota.fm:443',
    'https://nodes.iota.fm:443',
    'https://field.carriota.com:443',
];
