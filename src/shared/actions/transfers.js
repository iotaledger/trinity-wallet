import { broadcastBundleAsync } from '../libs/iota/extendedApi';
import { selectedAccountStateFactory } from '../selectors/account';
import { getTailTransactionForBundle } from '../libs/iota/transfers';

export const ActionTypes = {
    BROADCAST_BUNDLE_REQUEST: 'IOTA/TRANSFERS/BROADCAST_BUNDLE_REQUEST',
    BROADCAST_BUNDLE_SUCCESS: 'IOTA/TRANSFERS/BROADCAST_BUNDLE_SUCCESS',
    BROADCAST_BUNDLE_ERROR: 'IOTA/TRANSFERS/BROADCAST_BUNDLE_ERROR',
};

const broadcastBundleRequest = () => ({
    type: ActionTypes.BROADCAST_BUNDLE_REQUEST,
});

const broadcastBundleSuccess = () => ({
    type: ActionTypes.BROADCAST_BUNDLE_SUCCESS,
});

const broadcastBundleError = () => ({
    type: ActionTypes.BROADCAST_BUNDLE_ERROR,
});

export const broadcastBundle = (bundleHash, accountName) => (dispatch, getState) => {
    dispatch(broadcastBundleRequest());

    const accountState = selectedAccountStateFactory(accountName)(getState());
    const tailTransaction = getTailTransactionForBundle(bundleHash, accountState.transfers);

    return broadcastBundleAsync(tailTransaction.hash)
        .then(() => dispatch(broadcastBundleSuccess()))
        .catch(() => dispatch(broadcastBundleError()));
};
