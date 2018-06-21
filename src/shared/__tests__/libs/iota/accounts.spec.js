import map from 'lodash/map';
import { expect } from 'chai';
import {
    syncAccountOnValueTransactionFailure,
    syncAccountOnSuccessfulRetryAttempt,
    syncAccountDuringSnapshotTransition,
} from '../../../libs/iota/accounts';
import mockAccounts from '../../__samples__/accounts';

describe('libs: iota/accounts', () => {
    let transactionObjects;
    before(() => {
        transactionObjects = [
            {
                address: 'YPVQNKQTFKIZPDPMU9HYUT9YDVHITGAD9CNINJK9HWOSZYBZZFXVET9NRNUSVWWVWOHP9LQIUXBKMMRXW',
                attachmentTimestampLowerBound: 0,
                attachmentTimestampUpperBound: 3812798742493,
                branchTransaction: 'LKWWJXN9EHMUGKTZMEASER9AQHUVQFXYEMGKWQCXQVQVAUUFHZD9PN9UMNXVCTR9OGE9TUWMWCXE99999',
                bundle: 'VHMDWDTBGJLEWVESYLBOISSUIKROXZVWZE9EFKTDGLJGJEKJJAWLGFBBSCZGKXIPCHAJDTTQLHFAQCCDY',
                currentIndex: 0,
                hash: 'LTIIFRUPLKCUNUB9YDN9NSIVHIQXGNWUXSWTKVHBYFVQYYIQZUTBRQREQ9ZIZUXRVUKYWPH9TRVB99999',
                lastIndex: 2,
                nonce: 'ZEZGPA999999999999999999999',
                obsoleteTag: 'STINITY99999999999999999999',
                signatureMessageFragment: '9'.repeat(2187),
                value: 2,
                tag: 'TRINITY99999999999999999999',
                timestamp: 1528875229,
                attachmentTimestamp: 1528875232150,
                trunkTransaction: 'QQGYXVMROZNKYOSIQGKDEZINGYJCUGBABWRJAGKVSYFDVFEYBNJZZE9QRGLIKPYGTQOBTF9XMGX9Z9999',
            },
            {
                address: 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                attachmentTimestampLowerBound: 0,
                attachmentTimestampUpperBound: 3812798742493,
                branchTransaction: 'LKWWJXN9EHMUGKTZMEASER9AQHUVQFXYEMGKWQCXQVQVAUUFHZD9PN9UMNXVCTR9OGE9TUWMWCXE99999',
                bundle: 'VHMDWDTBGJLEWVESYLBOISSUIKROXZVWZE9EFKTDGLJGJEKJJAWLGFBBSCZGKXIPCHAJDTTQLHFAQCCDY',
                currentIndex: 1,
                hash: 'QQGYXVMROZNKYOSIQGKDEZINGYJCUGBABWRJAGKVSYFDVFEYBNJZZE9QRGLIKPYGTQOBTF9XMGX9Z9999',
                lastIndex: 2,
                nonce: 'SGLUI9999999999999999999999',
                obsoleteTag: 'STINITY99999999999999999999',
                signatureMessageFragment: '9'.repeat(2187),
                value: -10,
                tag: 'TRINITY99999999999999999999',
                timestamp: 1528875229,
                attachmentTimestamp: 1528875232150,
                trunkTransaction: 'USUTETYIDHYU9LVMECMITNIXLOWIYXLEUYAZZFPUOJVGYENCEDZSXYYTOLTCAZMKKOAQYOHAYUYMA9999',
            },
            {
                address: 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                attachmentTimestampLowerBound: 0,
                attachmentTimestampUpperBound: 3812798742493,
                branchTransaction: 'JCAPOFKNTIG9SOIXXSITDIR9WHM9SVWZRTXJQDPUHOKE9HSNPUMTTLAPAOYRNOJC9ZZRSNVKCPO9A9999',
                bundle: 'VHMDWDTBGJLEWVESYLBOISSUIKROXZVWZE9EFKTDGLJGJEKJJAWLGFBBSCZGKXIPCHAJDTTQLHFAQCCDY',
                currentIndex: 2,
                hash: 'USUTETYIDHYU9LVMECMITNIXLOWIYXLEUYAZZFPUOJVGYENCEDZSXYYTOLTCAZMKKOAQYOHAYUYMA9999',
                lastIndex: 2,
                nonce: 'QSFQG9999999999999999999999',
                obsoleteTag: 'STINITY99999999999999999999',
                signatureMessageFragment: '9'.repeat(2187),
                value: 0,
                tag: 'TRINITY99999999999999999999',
                timestamp: 1528875229,
                attachmentTimestamp: 1528875232150,
                trunkTransaction: 'LKWWJXN9EHMUGKTZMEASER9AQHUVQFXYEMGKWQCXQVQVAUUFHZD9PN9UMNXVCTR9OGE9TUWMWCXE99999',
            },
        ];
    });

    describe('#syncAccountOnValueTransactionFailure', () => {
        let accountName;

        before(() => {
            accountName = 'TEST';
        });

        it('should mark input addresses as spent', () => {
            const accountState = mockAccounts.accountInfo[accountName];
            const inputAddress = 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW';
            expect(accountState.addresses[inputAddress].spent).to.equal(false);

            const result = syncAccountOnValueTransactionFailure(transactionObjects, accountState);

            expect(result.newState.addresses[inputAddress].spent).to.equal(true);
        });

        it('should assign normalised transfer to existing transfers', () => {
            const accountState = mockAccounts.accountInfo[accountName];
            const bundle = 'VHMDWDTBGJLEWVESYLBOISSUIKROXZVWZE9EFKTDGLJGJEKJJAWLGFBBSCZGKXIPCHAJDTTQLHFAQCCDY';

            expect(bundle in accountState.transfers).to.equal(false);

            const result = syncAccountOnValueTransactionFailure(transactionObjects, accountState);

            const normalisedTransfer = {
                hash: 'LTIIFRUPLKCUNUB9YDN9NSIVHIQXGNWUXSWTKVHBYFVQYYIQZUTBRQREQ9ZIZUXRVUKYWPH9TRVB99999',
                bundle: 'VHMDWDTBGJLEWVESYLBOISSUIKROXZVWZE9EFKTDGLJGJEKJJAWLGFBBSCZGKXIPCHAJDTTQLHFAQCCDY',
                timestamp: 1528875229,
                attachmentTimestamp: 1528875232150,
                inputs: [
                    {
                        address: 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                        value: -10,
                        hash: 'QQGYXVMROZNKYOSIQGKDEZINGYJCUGBABWRJAGKVSYFDVFEYBNJZZE9QRGLIKPYGTQOBTF9XMGX9Z9999',
                        checksum: 'GDMMKORSW',
                    },
                ],
                outputs: [
                    {
                        address: 'YPVQNKQTFKIZPDPMU9HYUT9YDVHITGAD9CNINJK9HWOSZYBZZFXVET9NRNUSVWWVWOHP9LQIUXBKMMRXW',
                        value: 2,
                        hash: 'LTIIFRUPLKCUNUB9YDN9NSIVHIQXGNWUXSWTKVHBYFVQYYIQZUTBRQREQ9ZIZUXRVUKYWPH9TRVB99999',
                        checksum: 'KWHYM9THA',
                    },
                    {
                        address: 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                        value: 0,
                        hash: 'USUTETYIDHYU9LVMECMITNIXLOWIYXLEUYAZZFPUOJVGYENCEDZSXYYTOLTCAZMKKOAQYOHAYUYMA9999',
                        checksum: 'GDMMKORSW',
                    },
                ],
                persistence: false,
                incoming: false,
                transferValue: 2,
                message: 'Empty',
                tailTransactions: [
                    {
                        hash: 'LTIIFRUPLKCUNUB9YDN9NSIVHIQXGNWUXSWTKVHBYFVQYYIQZUTBRQREQ9ZIZUXRVUKYWPH9TRVB99999',
                        attachmentTimestamp: 1528875232150,
                    },
                ],
            };
            expect(bundle in result.newState.transfers).to.equal(true);
            expect(result.newState.transfers[bundle]).to.eql(normalisedTransfer);
        });
    });

    describe('#syncAccountOnSuccessfulRetryAttempt', () => {
        let accountName;

        before(() => {
            accountName = 'TEST';
        });

        it('should mark input addresses as spent', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                ...mockAccounts.unconfirmedBundleTails,
                hashes: [],
            };

            const inputAddress = 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW';
            expect(accountState.addresses[inputAddress].spent).to.equal(false);

            const result = syncAccountOnSuccessfulRetryAttempt(accountName, transactionObjects, accountState);

            expect(result.newState.addresses[inputAddress].spent).to.equal(true);
        });

        it('should merge normalised transfer to existing transfers', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                ...mockAccounts.unconfirmedBundleTails,
                hashes: [],
            };
            const bundle = 'VHMDWDTBGJLEWVESYLBOISSUIKROXZVWZE9EFKTDGLJGJEKJJAWLGFBBSCZGKXIPCHAJDTTQLHFAQCCDY';

            const result = syncAccountOnSuccessfulRetryAttempt(
                accountName,
                map(transactionObjects, (tx) => ({ ...tx, hash: '9'.repeat(81) })),
                accountState,
            );

            const normalisedTransfer = {
                hash: '9'.repeat(81),
                bundle: 'VHMDWDTBGJLEWVESYLBOISSUIKROXZVWZE9EFKTDGLJGJEKJJAWLGFBBSCZGKXIPCHAJDTTQLHFAQCCDY',
                timestamp: 1528875229,
                attachmentTimestamp: 1528875232150,
                inputs: [
                    {
                        address: 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                        value: -10,
                        hash: '9'.repeat(81),
                        checksum: 'GDMMKORSW',
                    },
                ],
                outputs: [
                    {
                        address: 'YPVQNKQTFKIZPDPMU9HYUT9YDVHITGAD9CNINJK9HWOSZYBZZFXVET9NRNUSVWWVWOHP9LQIUXBKMMRXW',
                        value: 2,
                        hash: '9'.repeat(81),
                        checksum: 'KWHYM9THA',
                    },
                    {
                        address: 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                        value: 0,
                        hash: '9'.repeat(81),
                        checksum: 'GDMMKORSW',
                    },
                ],
                persistence: false,
                incoming: false,
                transferValue: 2,
                message: 'Empty',
                tailTransactions: [
                    {
                        hash: '9'.repeat(81),
                        attachmentTimestamp: 1528875232150,
                    },
                ],
            };

            expect(result.newState.transfers[bundle]).to.eql(normalisedTransfer);
        });

        it('should concat new transaction hashes for own addresses', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                ...mockAccounts.unconfirmedBundleTails,
                hashes: [],
            };

            const result = syncAccountOnSuccessfulRetryAttempt(accountName, transactionObjects, accountState);

            expect(result.newState.hashes).to.eql([
                'QQGYXVMROZNKYOSIQGKDEZINGYJCUGBABWRJAGKVSYFDVFEYBNJZZE9QRGLIKPYGTQOBTF9XMGX9Z9999',
                'USUTETYIDHYU9LVMECMITNIXLOWIYXLEUYAZZFPUOJVGYENCEDZSXYYTOLTCAZMKKOAQYOHAYUYMA9999',
            ]);
        });

        it('should merge bundle hash to "unconfirmedBundleTails"', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                ...mockAccounts.unconfirmedBundleTails,
                hashes: [],
            };

            const result = syncAccountOnSuccessfulRetryAttempt(accountName, transactionObjects, accountState);

            expect(result.newState.unconfirmedBundleTails).to.eql({
                VHMDWDTBGJLEWVESYLBOISSUIKROXZVWZE9EFKTDGLJGJEKJJAWLGFBBSCZGKXIPCHAJDTTQLHFAQCCDY: [
                    {
                        account: 'TEST',
                        attachmentTimestamp: 1528875232150,
                        hash: 'LTIIFRUPLKCUNUB9YDN9NSIVHIQXGNWUXSWTKVHBYFVQYYIQZUTBRQREQ9ZIZUXRVUKYWPH9TRVB99999',
                    },
                ],
            });
        });
    });

    describe('#syncAccountDuringSnapshotTransition', () => {
        let accountName;

        before(() => {
            accountName = 'TEST';
        });

        it('should merge addressData into existing addressData', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                ...mockAccounts.unconfirmedBundleTails,
                hashes: [],
            };

            const addressData = {
                ['9'.repeat(81)]: {
                    balance: 0,
                    index: 10,
                    checksum: 'FAKECHECKSUM',
                    spent: false,
                },
            };

            const { newState } = syncAccountDuringSnapshotTransition(transactionObjects, addressData, accountState);

            const expectedResult = { ...mockAccounts.accountInfo[accountName].addresses, ...addressData };
            expect(newState.addresses).to.eql(expectedResult);
        });

        it('should merge normalised transfer to existing transfers', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                ...mockAccounts.unconfirmedBundleTails,
                hashes: [],
            };

            const result = syncAccountDuringSnapshotTransition(
                map(transactionObjects, (tx) => ({ ...tx, hash: '9'.repeat(81) })),
                {},
                accountState,
            );

            const bundle = 'VHMDWDTBGJLEWVESYLBOISSUIKROXZVWZE9EFKTDGLJGJEKJJAWLGFBBSCZGKXIPCHAJDTTQLHFAQCCDY';

            const normalisedTransfer = {
                hash: '9'.repeat(81),
                bundle,
                timestamp: 1528875229,
                attachmentTimestamp: 1528875232150,
                inputs: [
                    {
                        address: 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                        value: -10,
                        hash: '9'.repeat(81),
                        checksum: 'GDMMKORSW',
                    },
                ],
                outputs: [
                    {
                        address: 'YPVQNKQTFKIZPDPMU9HYUT9YDVHITGAD9CNINJK9HWOSZYBZZFXVET9NRNUSVWWVWOHP9LQIUXBKMMRXW',
                        value: 2,
                        hash: '9'.repeat(81),
                        checksum: 'KWHYM9THA',
                    },
                    {
                        address: 'MVVQANCKCPSDGEHFEVT9RVYJWOPPEGZSAVLIZ9MGNRPJPUORYFOTP9FNCLBFMQKUXMHNRGZDTWUI9UDHW',
                        value: 0,
                        hash: '9'.repeat(81),
                        checksum: 'GDMMKORSW',
                    },
                ],
                persistence: false,
                incoming: false,
                transferValue: 2,
                message: 'Empty',
                tailTransactions: [
                    {
                        hash: '9'.repeat(81),
                        attachmentTimestamp: 1528875232150,
                    },
                ],
            };

            expect(result.newState.transfers[bundle]).to.eql(normalisedTransfer);
        });

        it('should concat new transaction hashes for all addresses in transaction', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                ...mockAccounts.unconfirmedBundleTails,
                hashes: [],
            };

            const result = syncAccountDuringSnapshotTransition(transactionObjects, {}, accountState);

            expect(result.newState.hashes).to.eql([
                'LTIIFRUPLKCUNUB9YDN9NSIVHIQXGNWUXSWTKVHBYFVQYYIQZUTBRQREQ9ZIZUXRVUKYWPH9TRVB99999',
                'QQGYXVMROZNKYOSIQGKDEZINGYJCUGBABWRJAGKVSYFDVFEYBNJZZE9QRGLIKPYGTQOBTF9XMGX9Z9999',
                'USUTETYIDHYU9LVMECMITNIXLOWIYXLEUYAZZFPUOJVGYENCEDZSXYYTOLTCAZMKKOAQYOHAYUYMA9999',
            ]);
        });

        it('should accumulate balance on new address data', () => {
            const accountState = {
                ...mockAccounts.accountInfo[accountName],
                ...mockAccounts.unconfirmedBundleTails,
                hashes: [],
            };

            const addressData = {
                ['9'.repeat(81)]: {
                    balance: 200,
                    index: 10,
                    checksum: 'FAKECHECKSUM',
                    spent: false,
                },
            };

            expect(accountState.balance).to.equal(110);

            const result = syncAccountDuringSnapshotTransition(transactionObjects, addressData, accountState);

            expect(result.newState.balance).to.equal(310);
        });
    });
});
