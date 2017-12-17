import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import map from 'lodash/map';
import reduce from 'lodash/reduce';
import { createSelector } from 'reselect';

export const currentAccountSelector = (seedName, accountInfo) => get(accountInfo, seedName);

export const currentAccountSelectorBySeedIndex = (seedIndex, accountInfo) => {
    if (isEmpty(accountInfo) || seedIndex < 0) {
        return {};
    }

    const allAccountNames = Object.keys(accountInfo);
    // Might be good to validate first
    const currentlySelectedAccountName = allAccountNames[seedIndex];

    return accountInfo[currentlySelectedAccountName];
};

export const deduplicateTransferBundles = transfers => {
    const deduplicate = (res, transfer) => {
        const top = transfer[0];
        const bundle = top.bundle;
        const attachmentTimestamp = top.attachmentTimestamp;

        if (get(res, bundle)) {
            const timestampOnExistingTransfer = get(res[bundle], '[0].attachmentTimestamp');
            if (attachmentTimestamp > timestampOnExistingTransfer) {
                res[bundle] = transfer;
            }
        } else {
            res = { ...res, ...{ [bundle]: transfer } };
        }

        return res;
    };

    const aggregated = reduce(transfers, deduplicate, {});
    return map(aggregated, v => v);
};

export const getSelectedAccount = createSelector(currentAccountSelector, account => account);

export const getSelectedAccountViaSeedIndex = createSelector(currentAccountSelectorBySeedIndex, account => account);

export const getAddressesForSelectedAccountViaSeedIndex = createSelector(currentAccountSelectorBySeedIndex, account =>
    Object.keys(get(account, 'addresses')),
);

export const getAddressesWithBalanceForSelectedAccountViaSeedIndex = createSelector(
    currentAccountSelectorBySeedIndex,
    account => get(account, 'addresses'),
);

export const getTransfersForSelectedAccountViaSeedIndex = createSelector(currentAccountSelectorBySeedIndex, account =>
    get(account, 'transfers'),
);

export const getDeduplicatedTransfersForSelectedAccountViaSeedIndex = createSelector(
    currentAccountSelectorBySeedIndex,
    account => deduplicateTransferBundles(get(account, 'transfers')),
);
