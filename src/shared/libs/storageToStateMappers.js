import head from 'lodash/head';
import filter from 'lodash/filter';
import map from 'lodash/map';
import omit from 'lodash/omit';
import transform from 'lodash/transform';
import { Account, Wallet } from '../storage';
import { accumulateBalance } from './iota/addresses';
import { constructBundlesFromTransactions, normaliseBundle } from './iota/transfers';

const mapAddressDataListToObject = (addressDataList) => transform(addressDataList, (acc, data) => {
    acc[data.address] = omit(data, 'address');
}, {});

export const mapAccountToAccountInfo = (account) => {
    const { addresses, transactions, type } = account;

    const tailTransactions = filter(transactions, (tx) => tx.currentIndex === 0);
    const inclusionStates = map(tailTransactions, (tx) => tx.persistence);

    const bundles = constructBundlesFromTransactions(tailTransactions, transactions, inclusionStates);

    return {
        type,
        transfers: transform(bundles, (acc, bundle) => {
            const bundleHead = head(bundle);

            acc[bundleHead.bundle] = normaliseBundle(bundle, addresses, tailTransactions, bundleHead.persistence);
        }, {}),
        addresses: mapAddressDataListToObject(addresses),
        balance: accumulateBalance(map(addresses, (addressData) => addressData.balance)),
        hashes: map(transactions, (transaction) => transaction.hash)
    };
};

export const mapAccountToUnconfirmedBundleHashes = (account) => {
    const { transactions } = account;
    const tailTransactions = filter(transactions, (tx) => tx.currentIndex === 0);
    const inclusionStates = map(tailTransactions, (tx) => tx.persistence);

    const bundles = constructBundlesFromTransactions(tailTransactions, transactions, inclusionStates);
    const unconfirmedValueBundles = filter(bundles, (bundle) => {
        const { value, persistence } = head(bundle);

        return value > 0 && persistence === false;
    });

    return map(unconfirmedValueBundles, (bundle) => head(bundle).bundle);
};

const mapToAccount = () => {
    const accountsData = Account.getAccountsData();
    const walletData = Wallet.get();

    return {
        onboardingComplete: walletData.onboardingComplete,
        accountInfo: transform(accountsData, (acc, data) => {
            acc[data.name] = mapAccountToAccountInfo(data);
        }, {}),
    };
};

export const mapStorageToState = () => ({
   accounts: mapToAccount()
});
