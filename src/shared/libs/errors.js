export default {
    CANNOT_TRANSITION_ADDRESSES_WITH_ZERO_BALANCE: 'Cannot transition addresses with zero balance.',
    ADDRESS_ALREADY_ATTACHED: 'Address already attached.',
    KEY_REUSE: 'Key reuse detected.',
    NOT_ENOUGH_BALANCE: 'Not enough balance.',
    ADDRESS_HAS_PENDING_TRANSFERS: 'Input addresses already used in a pending transfer.',
    FUNDS_AT_SPENT_ADDRESSES: 'WARNING FUNDS AT SPENT ADDRESSES.',
    CANNOT_SEND_TO_OWN_ADDRESS: 'Cannot send to an own address.',
    POW_FUNCTION_UNDEFINED: 'Proof of work function is undefined.',
    BUNDLE_NO_LONGER_VALID: 'Bundle no longer valid',
    PERSISTOR_UNDEFINED: 'Persistor is undefined.',
    ATTACH_TO_TANGLE_UNAVAILABLE: 'attachToTangle is not available',
    COMMAND_UNKNOWN: (command) => `Command ${command} is unknown`,
    TRANSACTION_ALREADY_CONFIRMED: 'Transaction already confirmed.',
    INCOMING_TRANSFERS: 'Incoming transfers to all selected inputs',
    NODE_NOT_SYNCED: 'Node not synced',
    UNSUPPORTED_NODE: 'Node version not supported',
    INVALID_BUNDLE: 'Invalid bundle',
    INVALID_BUNDLE_CONSTRUCTED_DURING_REATTACHMENT: 'Invalid bundle constructed during reattachment.',
    INVALID_PARAMETERS: 'Invalid parameters',
    ALREADY_SPENT_FROM_ADDRESSES: 'Already spent from addresses',
    TRANSACTION_IS_INCONSISTENT: 'Transaction is inconsistent.',
    ADDRESS_METADATA_LENGTH_MISMATCH: 'Address metadata length mismatch.',
    SOMETHING_WENT_WRONG_DURING_INPUT_SELECTION: 'Something went wrong during input selection.',
    NO_NODE_TO_RETRY: 'No node to retry.',
    NOT_ENOUGH_SYNCED_NODES: 'Not enough synced nodes for quorum.',
    COULD_NOT_GET_QUORUM_FOR_LATEST_SOLID_SUBTANGLE_MILESTONE:
        'Could not get quorum for latestSolidSubtangleMilestone.',
    METHOD_NOT_SUPPORTED_FOR_QUORUM: 'Method not supported for quorum.',
    NOT_ENOUGH_QUORUM_NODES: 'Not enough quorum nodes.',
    EMPTY_ADDRESS_DATA: 'Empty address data.',
    INVALID_INPUT: 'Invalid input.',
    INVALID_TRANSFER: 'Invalid transfer.',
    INVALID_ADDRESS_DATA: 'Invalid address data.',
    INVALID_LAST_TRIT: 'Last trit from the address is not 0',
    CANNOT_SWEEP_TO_SAME_ADDRESS: 'Cannot sweep to same address.',
    BALANCE_MISMATCH: 'Balance mismatch.',
    PROMOTIONS_LIMIT_REACHED: 'Promotions limit reached.',
    EMPTY_BUNDLE_PROVIDED: 'Empty bundle provided.',
    EMPTY_BUNDLES_PROVIDED: 'Empty bundles provided.',
    DETECTED_INPUT_WITH_ZERO_BALANCE: 'Detected input with zero balance.',
    NO_VALID_BUNDLES_CONSTRUCTED: 'No valid bundles constructed.',
    BUNDLE_NO_LONGER_FUNDED: 'Bundle no longer funded.',
    INVALID_BUNDLES_PROVIDED: 'Invalid bundles provided.',
    INVALID_TRANSACTIONS_PROVIDED: 'Invalid transactions provided.',
    INCLUSION_STATES_SIZE_MISMATCH: 'Inclusion states size mismatch.',
    INPUTS_THRESHOLD_CANNOT_BE_ZERO: 'Inputs threshold cannot be zero.',
    CANNOT_FIND_INPUTS_WITH_PROVIDED_LIMIT: 'Cannot find inputs with provided limit.',
    INSUFFICIENT_BALANCE: 'Insufficient balance.',
    INVALID_MAX_INPUTS_PROVIDED: 'Invalid max inputs provided.',
    NO_STORED_DATA_FOUND: 'No stored data found.',
    MAX_INPUTS_EXCEEDED: (count, max) => `Can't process transactions with ${count} inputs. The limit is ${max}.`,
    LEDGER_ZERO_VALUE: 'Cannot send 0 value transfers with a Ledger device',
    LEDGER_DISCONNECTED: 'Ledger device disconnected',
    LEDGER_CANCELLED: 'Ledger transaction cancelled',
    LEDGER_DENIED: 'Ledger transaction denied by user',
    LEDGER_INVALID_INDEX: 'Incorrect Ledger device or changed mnemonic',
};
