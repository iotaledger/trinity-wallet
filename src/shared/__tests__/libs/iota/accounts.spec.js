import find from 'lodash/find';
import map from 'lodash/map';
import { expect } from 'chai';
import {
    syncAccountOnValueTransactionFailure,
    syncAccountOnSuccessfulRetryAttempt,
    syncAccountDuringSnapshotTransition,
} from '../../../libs/iota/accounts';
import mockAccounts from '../../__samples__/accounts';
import { newValueTransaction as mockValueTransactionObjects } from '../../__samples__/transactions';

describe('libs: iota/accounts', () => {
    describe('#syncAccountOnValueTransactionFailure', () => {
        let accountName;

        before(() => {
            accountName = 'TEST';
        });

        it('should mark input addresses as spent', () => {
            const accountState = mockAccounts.accountInfo[accountName];
            const inputAddress = 'ZBQWFOZVCOURPSVBNIBWOBQNRQXDBESSEJWWETTWWMGSJDUJLITMJYYBM9ZUFXTYTTPSGDTVBNIKLKXJA';

            // Assert that input address is unspent before syncAccountOnValueTransactionFailure is called
            const inputAddressDataBefore = find(accountState.addressData, { address: inputAddress });
            expect(inputAddressDataBefore.spent.local).to.equal(false);

            const result = syncAccountOnValueTransactionFailure(mockValueTransactionObjects, accountState);

            const inputAddressDataAfter = find(result.addressData, { address: inputAddress });
            expect(inputAddressDataAfter.spent.local).to.equal(true);
        });

        it('should add new transaction objects to transactions in state (with persistence & broadcasted properties as false)', () => {
            const accountState = mockAccounts.accountInfo[accountName];
            const bundle = 'J9KGYQZZTWKJDAJYSNFAUJ9PGPJGKCFJGPTXWJAHZWPGBCJEPLXQGVXAPZDP9HDVGIHZZ9IFIWAAPFRNC';

            // Assert that bundle does not exist in existing transactions

            expect(find(accountState.transactions, { bundle })).to.equal(undefined);

            const result = syncAccountOnValueTransactionFailure(mockValueTransactionObjects, accountState);

            expect(find(result.transactions, { bundle })).to.not.equal(undefined);

            expect(result.transactions).to.eql([
                ...accountState.transactions,
                ...map(mockValueTransactionObjects, (transaction) => ({
                    ...transaction,
                    persistence: false,
                    broadcasted: false,
                })),
            ]);
        });
    });

    describe('#syncAccountOnSuccessfulRetryAttempt', () => {
        let accountName;

        before(() => {
            accountName = 'TEST';
        });

        it('should set "broadcasted" property to true for newly broadcasted transactions', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                transactions: [
                    ...mockAccounts.accountInfo[accountName].transactions,
                    ...map(mockValueTransactionObjects, (transaction) => ({
                        ...transaction,
                        persistence: false,
                        broadcasted: false,
                        // Also assign a fake hash and test that it's overriden by the correct hash
                        hash: '9'.repeat(81),
                    })),
                ],
            };

            const result = syncAccountOnSuccessfulRetryAttempt(mockValueTransactionObjects, accountState);

            expect(result.transactions).to.eql([
                ...mockAccounts.accountInfo[accountName].transactions,
                ...map(mockValueTransactionObjects, (transaction) => ({
                    ...transaction,
                    persistence: false,
                    broadcasted: true,
                })),
            ]);
        });
    });

    describe('#syncAccountDuringSnapshotTransition', () => {
        let accountName;

        before(() => {
            accountName = 'TEST';
        });

        it('should assign latestAddressData param to addressData', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                addressData: [],
            };

            const latestAddressData = mockAccounts.accountInfo[accountName].addressData;

            const result = syncAccountDuringSnapshotTransition(
                mockValueTransactionObjects,
                latestAddressData,
                accountState,
            );

            expect(result.addressData).to.eql(latestAddressData);
        });

        it('should add new transaction objects to transactions in state (with persistence property false & broadcasted property true)', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                addressData: [],
            };

            const latestAddressData = mockAccounts.accountInfo[accountName].addressData;

            const result = syncAccountDuringSnapshotTransition(
                mockValueTransactionObjects,
                latestAddressData,
                accountState,
            );

            expect(result.transactions).to.eql([
                ...accountState.transactions,
                ...map(mockValueTransactionObjects, (transaction) => ({
                    ...transaction,
                    persistence: false,
                    broadcasted: true,
                })),
            ]);
        });
    });
});
