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
    INCONSISTENT_SUBTANGLE: 'Inconsistent subtangle',
    INVALID_BUNDLE: 'Invalid bundle',
    INVALID_PARAMETERS: 'Invalid parameters',
    ALREADY_SPENT_FROM_ADDRESSES: 'Already spent from addresses',
    REFERENCE_TRANSACTION_TOO_OLD: 'reference transaction is too old',
    ADDRESS_METADATA_LENGTH_MISMATCH: 'Address metadata length mismatch.',
    SOMETHING_WENT_WRONG_DURING_INPUT_SELECTION: 'Something went wrong during input selection.',
    NO_NODE_TO_RETRY: 'No node to retry.',
};
