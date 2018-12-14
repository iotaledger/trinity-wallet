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
    CANNOT_SWEEP_TO_SAME_ADDRESS: 'Cannot sweep to same address.',
    BALANCE_MISMATCH: 'Balance mismatch.',
    PROMOTIONS_LIMIT_REACHED: 'Promotions limit reached.',
    EMPTY_BUNDLE_PROVIDED: 'Empty bundle provided.',
    DETECTED_INPUT_WITH_ZERO_BALANCE: 'Detected input with zero balance.',
    MAX_INPUTS_EXCEEDED: (count, max) => `Can't process transactions with ${count} inputs. The limit is ${max}.`,
    LEDGER_ZERO_VALUE: 'Cannot send 0 value transfers with a Ledger device',
    LEDGER_DISCONNECTED: 'Ledger device disconnected',
    LEDGER_CANCELLED: 'Ledger transaction cancelled',
    LEDGER_DENIED: 'Ledger transaction denied by user',
    LEDGER_INVALID_INDEX: 'Incorrect Ledger device or changed mnemonic',
};
