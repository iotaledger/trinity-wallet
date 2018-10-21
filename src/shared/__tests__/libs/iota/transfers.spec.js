import assign from 'lodash/assign';
import find from 'lodash/find';
import keys from 'lodash/keys';
import map from 'lodash/map';
import shuffle from 'lodash/shuffle';
import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import {
    prepareTransferArray,
    getTransactionsDiff,
    categoriseTransactions,
    normaliseBundle,
    categoriseBundleByInputsOutputs,
    performPow,
    constructBundlesFromTransactions,
    retryFailedTransaction,
    sortTransactionTrytesArray,
    getTransferValue,
    computeTransactionMessage,
    isValidTransfer,
    isFundedBundle,
    categoriseInclusionStatesByBundleHash,
} from '../../../libs/iota/transfers';
import { iota, SwitchingConfig } from '../../../libs/iota/index';
import { failedTrytesWithCorrectTransactionHashes } from '../../__samples__/trytes';
import {
    confirmedValueTransactions,
    unconfirmedValueTransactions,
    failedTransactionsWithCorrectTransactionHashes,
    failedTransactionsWithIncorrectTransactionHashes,
} from '../../__samples__/transactions';
import { EMPTY_HASH_TRYTES, EMPTY_TRANSACTION_TRYTES, EMPTY_TRANSACTION_MESSAGE } from '../../../libs/iota/utils';
import { IRI_API_VERSION } from '../../../config';

describe('libs: iota/transfers', () => {
    before(() => {
        SwitchingConfig.autoSwitch = false;
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
    });

    describe('#getTransferValue', () => {
        let ownAddresses;

        before(() => {
            ownAddresses = ['A'.repeat(81), 'B'.repeat(81), 'C'.repeat(81), 'D'.repeat(81), 'E'.repeat(81)];
        });

        describe('zero value transactions', () => {
            it('should return zero', () => {
                // Zero value transactions have no inputs
                expect(
                    getTransferValue(
                        [],
                        [
                            {
                                value: 0,
                                currentIndex: 0,
                                lastIndex: 1,
                                // Own address
                                address: 'A'.repeat(81),
                            },
                            {
                                value: 0,
                                currentIndex: 1,
                                lastIndex: 1,
                                // Other address
                                address: 'Z'.repeat(81),
                            },
                        ],
                        ownAddresses,
                    ),
                ).to.equal(0);
            });
        });

        describe('value transactions', () => {
            describe('with any input address belong to user addresses', () => {
                it('should return a difference of inputs and remainder', () => {
                    expect(
                        getTransferValue(
                            [
                                {
                                    value: -10,
                                    currentIndex: 1,
                                    lastIndex: 4,
                                    address: 'A'.repeat(81),
                                },
                                {
                                    value: -1,
                                    currentIndex: 2,
                                    lastIndex: 4,
                                    address: 'B'.repeat(81),
                                },
                                {
                                    value: -40,
                                    currentIndex: 3,
                                    lastIndex: 4,
                                    address: 'C'.repeat(81),
                                },
                            ],
                            [
                                {
                                    value: 12,
                                    currentIndex: 0,
                                    lastIndex: 4,
                                    address: 'Z'.repeat(81),
                                },
                                {
                                    value: 39,
                                    currentIndex: 4,
                                    lastIndex: 4,
                                    address: 'D'.repeat(81),
                                },
                            ],
                            ownAddresses,
                        ),
                    ).to.equal(12);
                });
            });

            describe('with no input addresses belong to user addresses', () => {
                it('should return a sum of all user output addresses', () => {
                    expect(
                        getTransferValue(
                            [
                                {
                                    value: -10,
                                    currentIndex: 1,
                                    lastIndex: 4,
                                    address: 'Y'.repeat(81),
                                },
                                {
                                    value: -1,
                                    currentIndex: 2,
                                    lastIndex: 4,
                                    address: 'Z'.repeat(81),
                                },
                                {
                                    value: -40,
                                    currentIndex: 3,
                                    lastIndex: 4,
                                    address: 'U'.repeat(81),
                                },
                            ],
                            [
                                {
                                    value: 12,
                                    currentIndex: 0,
                                    lastIndex: 4,
                                    address: 'D'.repeat(81),
                                },
                                {
                                    value: 39,
                                    currentIndex: 4,
                                    lastIndex: 4,
                                    address: 'W'.repeat(81),
                                },
                            ],
                            ownAddresses,
                        ),
                    ).to.equal(12);
                });
            });
        });
    });

    describe('#computeTransactionMessage', () => {
        describe('when bundle has no transaction with a message', () => {
            it(`should return ${EMPTY_TRANSACTION_MESSAGE}`, () => {
                expect(computeTransactionMessage([{ signatureMessageFragment: '9'.repeat(2187) }])).to.equal('Empty');
            });
        });

        describe('when bundle has a transaction with message', () => {
            it('should return message', () => {
                const messageTrytes = 'CCOBBCCCEAWBOBBCBCKBQBOB';
                expect(
                    computeTransactionMessage([
                        { signatureMessageFragment: '9'.repeat(2187) },
                        { signatureMessageFragment: `${messageTrytes}${'9'.repeat(2187 - messageTrytes.length)}` },
                    ]),
                ).to.equal('TEST MESSAGE');
            });
        });
    });

    describe('#prepareTransferArray', () => {
        let addressData;

        before(() => {
            addressData = {
                ['X'.repeat(81)]: { index: 0, balance: 0, spent: { local: false, remote: false } },
                ['Y'.repeat(81)]: { index: 1, balance: 0, spent: { local: false, remote: false } },
            };
        });

        describe('when value is zero', () => {});

        describe('when value is not zero', () => {
            it('should return a single transfer object', () => {
                expect(prepareTransferArray('X'.repeat(81), 1, '', addressData, 'tag')).to.eql([
                    {
                        address: 'X'.repeat(81),
                        tag: 'tag',
                        message: '',
                        value: 1,
                    },
                ]);
            });
        });

        describe('when value is zero', () => {
            describe('when address is part of address data', () => {
                it('should return a single transfer object', () => {
                    expect(prepareTransferArray('X'.repeat(81), 0, '', addressData, 'tag')).to.eql([
                        {
                            address: 'X'.repeat(81),
                            tag: 'tag',
                            message: '',
                            value: 0,
                        },
                    ]);
                });
            });

            describe('when address is not part of address data', () => {
                it('should return two transfer objects', () => {
                    expect(prepareTransferArray('A'.repeat(81), 0, '', addressData, 'tag')).to.eql([
                        {
                            address: 'A'.repeat(81),
                            tag: 'tag',
                            message: '',
                            value: 0,
                        },
                        {
                            address: 'X'.repeat(81),
                            tag: 'tag',
                            message: '',
                            value: 0,
                        },
                    ]);
                });
            });
        });
    });

    describe('#getTransactionsDiff', () => {
        describe('when second argument size is not greater than first argument size', () => {
            let firstArgument;
            let secondArgument;

            beforeEach(() => {
                firstArgument = ['foo'];
                secondArgument = ['foo'];
            });

            it('should return an empty array', () => {
                expect(getTransactionsDiff(firstArgument, secondArgument)).to.eql([]);
            });
        });

        describe('when second argument size is greater than first argument size', () => {
            let secondArgument;
            let firstArgument;

            beforeEach(() => {
                secondArgument = ['foo', 'baz'];
                firstArgument = ['foo'];
            });

            it('should return an array with difference of first and second arguments', () => {
                expect(getTransactionsDiff(firstArgument, secondArgument)).to.eql(['baz']);
            });
        });
    });

    describe('#categoriseTransactions', () => {
        it('should always return an object with props "incoming" and "outgoing"', () => {
            const args = [[undefined], [null], [], [{}], [''], [0], ['foo']];

            args.forEach((arg) => {
                expect(categoriseTransactions(...arg)).to.have.keys(['incoming', 'outgoing']);
            });
        });

        it('should categorise incoming transactions to "incoming" prop array', () => {
            const transactions = [{ incoming: true }, { incoming: false }, { incoming: false }];

            expect(categoriseTransactions(transactions).incoming).to.eql([{ incoming: true }]);
        });

        it('should categorise outgoing transactions to "outgoing" prop array', () => {
            const transactions = [{ incoming: true }, { incoming: false }];

            expect(categoriseTransactions(transactions).outgoing).to.eql([{ incoming: false }]);
        });
    });

    describe('#normaliseBundle', () => {
        let bundle;
        let addresses;
        let tailTransactions;
        let timestamp;
        let attachmentTimestamp;

        beforeEach(() => {
            timestamp = attachmentTimestamp = Date.now();

            bundle = [
                {
                    currentIndex: 0,
                    hash: 'NGX9LKVXKGMLJDKVMSNOCZYPSSCKYVQBCWPFZUAAKMIUVORXJAFRGRJSDWOMEFIOWFBUQVORWGID99999',
                    bundle: '9DCUNBJYTSWOYRRLJC9LLPCIUCEXCIVZGPWEKOJHSDLWFZX9HOUNFNKAQZGHDYHFPBRLJFORLFHIRVVC9',
                    address: 'AWHJTOTMFXZUAVJAWHXULZJFTQNHYAIQHIDKOSTEMR9ZBHWFWDLIQYPHDKTVXYDJYRHKMXYLDUULJMMWW',
                    value: 1,
                    signatureMessageFragment: '9'.repeat(2187),
                    timestamp,
                    attachmentTimestamp,
                },
                {
                    currentIndex: 1,
                    hash: 'GAYYEUVRGFRDNEPLP9BTYLBPQGZGUHOGUFHCCAOFTPDFYOBNCGGGGAZ9JTT9AHVWMBLTRDZTBCEX99999',
                    bundle: '9DCUNBJYTSWOYRRLJC9LLPCIUCEXCIVZGPWEKOJHSDLWFZX9HOUNFNKAQZGHDYHFPBRLJFORLFHIRVVC9',
                    address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                    value: -2201,
                    signatureMessageFragment: '9'.repeat(2187),
                    timestamp,
                    attachmentTimestamp,
                },
                {
                    currentIndex: 2,
                    hash: 'SHGVLJDUPADJ9ASLTVTWNJDOVLV9AQHCGBBAK9GLIZJRNKK9CBFNPNDWRWZZU9OHPHZZSDZWSESLZ9999',
                    bundle: '9DCUNBJYTSWOYRRLJC9LLPCIUCEXCIVZGPWEKOJHSDLWFZX9HOUNFNKAQZGHDYHFPBRLJFORLFHIRVVC9',
                    address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                    value: 0,
                    signatureMessageFragment: '9'.repeat(2187),
                    timestamp,
                    attachmentTimestamp,
                },
                {
                    currentIndex: 3,
                    hash: 'XFGRJCCUXXDL9UQTKRDRKPIIJKZIONDLPOHUINXJWZ99HPGTYAFEGQDNQMLFG9VIWPKTRURTSFJH99999',
                    bundle: '9DCUNBJYTSWOYRRLJC9LLPCIUCEXCIVZGPWEKOJHSDLWFZX9HOUNFNKAQZGHDYHFPBRLJFORLFHIRVVC9',
                    address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                    value: 2201,
                    signatureMessageFragment: '9'.repeat(2187),
                    timestamp,
                    attachmentTimestamp,
                },
            ];

            addresses = [
                'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                'UTPQWLFOSBVOEXMMEDNDGCIKGOHFSRVZ9HDEFFNAOLXGDUKC9TEENGI9RAWMZSY9UTMKLHZPRUTFJDBOY',
            ];

            tailTransactions = [
                {
                    currentIndex: 0,
                    hash: 'NGX9LKVXKGMLJDKVMSNOCZYPSSCKYVQBCWPFZUAAKMIUVORXJAFRGRJSDWOMEFIOWFBUQVORWGID99999',
                    bundle: '9DCUNBJYTSWOYRRLJC9LLPCIUCEXCIVZGPWEKOJHSDLWFZX9HOUNFNKAQZGHDYHFPBRLJFORLFHIRVVC9',
                    address: 'AWHJTOTMFXZUAVJAWHXULZJFTQNHYAIQHIDKOSTEMR9ZBHWFWDLIQYPHDKTVXYDJYRHKMXYLDUULJMMWW',
                    value: 1,
                    attachmentTimestamp,
                },
                {
                    currentIndex: 0,
                    hash: 'F9AN9GUWLXFGAIWNYEHRZKGUI9GLOTEIIXNNCGNPAIMZWM9BTSXQAIELQLZPADIMXYHDXWXJPOLSA9999',
                    bundle: 'DAVBDNDIHERQQNZGRXHUBHECQFGGKPACOQCFKEFNLRZUGRRLFELDBVBQB9YOODGOXLKQXKBFSKXJIQXLA',
                    address: 'UTPQWLFOSBVOEXMMEDNDGCIKGOHFSRVZ9HDEFFNAOLXGDUKC9TEENGI9RAWMZSY9UTMKLHZPRUTFJDBOY',
                    value: 23300,
                    attachmentTimestamp,
                },
            ];
        });

        // Note: Test internally used functions separately
        it('should return an object with "bundle" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('bundle');
        });

        it('should return an object with "timestamp" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('timestamp');
        });

        it('should return an object with "attachmentTimestamp" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('attachmentTimestamp');
        });

        it('should return an object with "inputs" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('inputs');
        });

        it('should return an object with "outputs" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('inputs');
        });

        it('should return an object with "persistence" prop equalling fourth argument', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false).persistence).to.equal(false);
        });

        it('should return an object with "incoming" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('incoming');
        });

        it('should return an object with "transferValue" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('transferValue');
        });

        it('should return an object with "message" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('transferValue');
        });

        it('should return an object with "tailTransactions" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('tailTransactions');
        });

        it('should only keep tail transactions of the same bundle', () => {
            const normalisedBundle = normaliseBundle(bundle, addresses, tailTransactions, false);

            const tailTransactionFromBundle = find(bundle, { currentIndex: 0 });
            normalisedBundle.tailTransactions.forEach((tailTransaction) =>
                expect(tailTransaction.hash).to.equal(tailTransactionFromBundle.hash),
            );
        });

        it('should only have "hash" and "attachmentTimestamp" props in each object of "tailTransactions" prop', () => {
            const normalisedBundle = normaliseBundle(bundle, addresses, tailTransactions, false);

            normalisedBundle.tailTransactions.forEach((tailTransaction) =>
                expect(keys(tailTransaction)).to.eql(['hash', 'attachmentTimestamp']),
            );
        });
    });

    describe('#categoriseBundleByInputsOutputs', () => {
        let bundle;

        beforeEach(() => {
            bundle = [
                {
                    currentIndex: 0,
                    lastIndex: 3,
                    value: 1,
                    address: 'AWHJTOTMFXZUAVJAWHXULZJFTQNHYAIQHIDKOSTEMR9ZBHWFWDLIQYPHDKTVXYDJYRHKMXYLDUULJMMWW',
                },
                {
                    currentIndex: 1,
                    lastIndex: 3,
                    value: -2201,
                    address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                },
                {
                    currentIndex: 2,
                    lastIndex: 3,
                    value: 0,
                    address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                },
                {
                    currentIndex: 3,
                    lastIndex: 3,
                    value: 2201,
                    address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                },
            ];
        });

        describe('when transaction object is not remainder and has negative value', () => {
            it('should categorise as "inputs"', () => {
                expect(categoriseBundleByInputsOutputs(bundle, [], 1).inputs).to.eql([
                    {
                        value: -2201,
                        currentIndex: 1,
                        lastIndex: 3,
                        address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                        checksum: 'MCDWJFKKC',
                    },
                ]);
            });
        });

        describe('when transaction object has non-negative value', () => {
            it('should categorise transaction objects as "outputs" if outputs size is less than outputs threshold size', () => {
                const outputsThreshold = 4;
                expect(categoriseBundleByInputsOutputs(bundle, [], outputsThreshold).outputs).to.eql([
                    {
                        value: 1,
                        address: 'AWHJTOTMFXZUAVJAWHXULZJFTQNHYAIQHIDKOSTEMR9ZBHWFWDLIQYPHDKTVXYDJYRHKMXYLDUULJMMWW',
                        checksum: 'BQGLCYXGY',
                        currentIndex: 0,
                        lastIndex: 3,
                    },
                    {
                        value: 0,
                        address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                        checksum: 'MCDWJFKKC',
                        currentIndex: 2,
                        lastIndex: 3,
                    },
                    {
                        value: 2201,
                        address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                        checksum: 'RYN9LQCEC',
                        currentIndex: 3,
                        lastIndex: 3,
                    },
                ]);
            });

            it('should categorise transaction objects as "outputs" if outputs size is equal to outputs threshold size', () => {
                const outputsThreshold = 3;
                expect(categoriseBundleByInputsOutputs(bundle, [], outputsThreshold).outputs).to.eql([
                    {
                        value: 1,
                        address: 'AWHJTOTMFXZUAVJAWHXULZJFTQNHYAIQHIDKOSTEMR9ZBHWFWDLIQYPHDKTVXYDJYRHKMXYLDUULJMMWW',
                        checksum: 'BQGLCYXGY',
                        currentIndex: 0,
                        lastIndex: 3,
                    },
                    {
                        value: 0,
                        address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                        checksum: 'MCDWJFKKC',
                        currentIndex: 2,
                        lastIndex: 3,
                    },
                    {
                        value: 2201,
                        address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                        checksum: 'RYN9LQCEC',
                        currentIndex: 3,
                        lastIndex: 3,
                    },
                ]);
            });

            it('should categorise transaction objects with own addresses as "outputs" if outputs size is greater than outputs threshold size', () => {
                const outputsThreshold = 1;
                const addresses = [
                    'AWHJTOTMFXZUAVJAWHXULZJFTQNHYAIQHIDKOSTEMR9ZBHWFWDLIQYPHDKTVXYDJYRHKMXYLDUULJMMWW',
                    'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                ];

                expect(categoriseBundleByInputsOutputs(bundle, addresses, outputsThreshold).outputs).to.eql([
                    {
                        value: 1,
                        address: 'AWHJTOTMFXZUAVJAWHXULZJFTQNHYAIQHIDKOSTEMR9ZBHWFWDLIQYPHDKTVXYDJYRHKMXYLDUULJMMWW',
                        checksum: 'BQGLCYXGY',
                        currentIndex: 0,
                        lastIndex: 3,
                    },
                    {
                        value: 2201,
                        address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                        checksum: 'RYN9LQCEC',
                        currentIndex: 3,
                        lastIndex: 3,
                    },
                ]);
            });

            it('should categorise remainder transaction objects as "outputs" if outputs size is greater than outputs threshold size', () => {
                const outputsThreshold = 1;

                expect(categoriseBundleByInputsOutputs(bundle, [], outputsThreshold).outputs).to.eql([
                    {
                        value: 2201,
                        address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                        checksum: 'RYN9LQCEC',
                        currentIndex: 3,
                        lastIndex: 3,
                    },
                ]);
            });
        });
    });

    describe('#performPow', () => {
        let powFn;
        let trunkTransaction;
        let branchTransaction;

        const nonces = ['N9UIMZQVDYWLXWGHLELNRCUUPMP', 'SLSJJSDPDTDSKEVCBVPMWDNOLAH', 'K9JXMYPREJZGUFFSANKRNPOMAGR'];

        beforeEach(() => {
            powFn = () => {
                let calledTimes = 0;

                return () => {
                    const promise = Promise.resolve(nonces[calledTimes]);
                    calledTimes += 1;

                    return promise;
                };
            };

            trunkTransaction = 'LLJWVVZFXF9ZGFSBSHPCD9HOIFBCLXGRV9XWSQDTGOMSRGQQIVFVZKHLKTJJVFMXQTZVPNRNAQEPA9999';
            branchTransaction = 'GSHUHUWAUUGQHHNAPRDPDJRKZFJNIAPFNTVAHZPUNDJWRHZSZASOERZURXZVEHN9OJVS9QNRGSJE99999';
        });

        it('should sort transaction objects in ascending order by currentIndex', () => {
            const fn = performPow(
                powFn(),
                shuffle(failedTrytesWithCorrectTransactionHashes),
                trunkTransaction,
                branchTransaction,
                14,
            );

            return fn.then(({ transactionObjects }) => {
                transactionObjects.map((tx, idx) => expect(tx.currentIndex).to.equal(idx));
            });
        });

        it('should assign generated nonce', () => {
            const fn = performPow(
                powFn(),
                failedTrytesWithCorrectTransactionHashes,
                trunkTransaction,
                branchTransaction,
                14,
            );

            return fn.then(({ transactionObjects }) => {
                transactionObjects.map((tx, idx) => expect(tx.nonce).to.equal(nonces.slice().reverse()[idx]));
            });
        });

        it('should set correct bundle sequence', () => {
            const fn = performPow(
                powFn(),
                failedTrytesWithCorrectTransactionHashes,
                trunkTransaction,
                branchTransaction,
                14,
            );

            return fn.then(({ transactionObjects }) => {
                expect(transactionObjects[0].trunkTransaction).to.equal(transactionObjects[1].hash);
                expect(transactionObjects[0].branchTransaction).to.equal(trunkTransaction);

                expect(transactionObjects[1].trunkTransaction).to.equal(transactionObjects[2].hash);
                expect(transactionObjects[1].branchTransaction).to.equal(trunkTransaction);

                expect(transactionObjects[2].trunkTransaction).to.equal(trunkTransaction);
                expect(transactionObjects[2].branchTransaction).to.equal(branchTransaction);
            });
        });
    });

    describe('#constructBundlesFromTransactions', () => {
        describe('when provided argument is not an array', () => {
            it('should throw an error with message "Invalid transactions provided"', () => {
                try {
                    constructBundlesFromTransactions({});
                } catch (error) {
                    expect(error.message).to.equal('Invalid transactions provided.');
                }
            });
        });

        it('should construct bundles', () => {
            // Pass in valid transactions
            const bundles = constructBundlesFromTransactions([
                ...confirmedValueTransactions,
                ...unconfirmedValueTransactions,
            ]);

            expect(bundles.length > 0).to.equal(true);

            bundles.forEach((bundle) => expect(iota.utils.isBundle(bundle)).to.equal(true));
        });
    });

    describe('#retryFailedTransaction', () => {
        describe('when all transaction objects have valid hash', () => {
            it('should not perform proof of work', () => {
                const powFn = sinon.stub();
                const storeAndBroadcast = sinon.stub(iota.api, 'storeAndBroadcast').yields(null, []);

                return retryFailedTransaction()(failedTransactionsWithCorrectTransactionHashes, powFn).then(() => {
                    expect(powFn.callCount).to.equal(0);
                    storeAndBroadcast.restore();
                });
            });
        });

        describe('when any transaction object has an invalid hash', () => {
            it('should perform proof of work', () => {
                const powFn = sinon.stub().resolves('R'.repeat(27));
                const storeAndBroadcast = sinon.stub(iota.api, 'storeAndBroadcast').yields(null, []);
                const getTransactionToApprove = sinon.stub(iota.api, 'getTransactionsToApprove').yields(null, {
                    trunkTransaction: 'R'.repeat(81),
                    branchTransaction: 'A'.repeat(81),
                });

                return retryFailedTransaction()(failedTransactionsWithIncorrectTransactionHashes, powFn, false).then(
                    () => {
                        expect(powFn.callCount).to.equal(failedTransactionsWithIncorrectTransactionHashes.length);
                        storeAndBroadcast.restore();
                        getTransactionToApprove.restore();
                    },
                );
            });
        });

        describe('when any transaction object has an empty hash', () => {
            it('should perform proof of work', () => {
                const powFn = sinon.stub().resolves('R'.repeat(27));
                const storeAndBroadcast = sinon.stub(iota.api, 'storeAndBroadcast').yields(null, []);
                const getTransactionToApprove = sinon.stub(iota.api, 'getTransactionsToApprove').yields(null, {
                    trunkTransaction: 'R'.repeat(81),
                    branchTransaction: 'A'.repeat(81),
                });

                return retryFailedTransaction()(
                    map(
                        failedTransactionsWithCorrectTransactionHashes,
                        (tx, idx) => (idx % 2 === 0 ? tx : Object.assign({}, tx, { hash: EMPTY_HASH_TRYTES })),
                    ),
                    powFn,
                    false,
                ).then(() => {
                    expect(powFn.callCount).to.equal(failedTransactionsWithCorrectTransactionHashes.length);
                    storeAndBroadcast.restore();
                    getTransactionToApprove.restore();
                });
            });
        });
    });

    describe('#sortTransactionTrytesArray', () => {
        it('should sort transaction trytes in ascending order', () => {
            // failedTrytesWithCorrectTransactionHashes is in ascending order by default
            const trytes = shuffle(failedTrytesWithCorrectTransactionHashes);
            const result = sortTransactionTrytesArray(trytes, 'currentIndex', 'asc');

            expect(result).to.not.eql(trytes);
            expect(result).to.eql(failedTrytesWithCorrectTransactionHashes);
            expect(iota.utils.transactionObject(result[0], EMPTY_TRANSACTION_TRYTES).currentIndex).to.equal(0);
        });

        it('should sort transaction trytes in descending order', () => {
            const trytes = shuffle(failedTrytesWithCorrectTransactionHashes);
            const result = sortTransactionTrytesArray(trytes);

            // failedTrytesWithCorrectTransactionHashes is in ascending order by default to assert with a reversed list
            expect(result).to.eql(failedTrytesWithCorrectTransactionHashes.slice().reverse());
            expect(iota.utils.transactionObject(result[0], EMPTY_TRANSACTION_TRYTES).currentIndex).to.equal(2);
        });
    });

    describe('#isValidTransfer', () => {
        let validTransfer;

        before(() => {
            validTransfer = {
                address: 'U'.repeat(81),
                value: 10,
            };
        });

        describe('when transfer is not an object', () => {
            it('should return false', () => {
                [[], 0.1, 1, undefined, null, ''].forEach((item) => {
                    expect(isValidTransfer(item)).to.eql(false);
                });
            });
        });

        describe('when input is an object', () => {
            describe('when "address" is invalid is not valid trytes', () => {
                it('should return false', () => {
                    const invalidAddress = `a${'U'.repeat(80)}`;

                    expect(isValidTransfer(assign({}, validTransfer, { address: invalidAddress }))).to.eql(false);
                });
            });

            describe('when "value" is not a number', () => {
                it('should return false', () => {
                    expect(isValidTransfer(assign({}, validTransfer, { value: undefined }))).to.eql(false);
                });
            });

            describe('when "value" is number and address is valid trytes', () => {
                it('should return true', () => {
                    expect(isValidTransfer(validTransfer)).to.eql(true);
                });
            });
        });
    });

    describe('#isFundedBundle', () => {
        describe('when provided bundle is empty', () => {
            it('should throw with an error "Empty bundle provided"', () => {
                return isFundedBundle()([]).catch((err) => {
                    expect(err.message).to.equal('Empty bundle provided.');
                });
            });
        });

        describe('when provided bundle is not empty', () => {
            let bundle;

            before(() => {
                bundle = [
                    { address: 'A'.repeat(81), value: -10 },
                    { address: 'B'.repeat(81), value: 5 },
                    { address: 'C'.repeat(81), value: 5 },
                ];
            });

            describe('when total balance of bundle inputs is greater than latest balance on input addresses', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                    })
                        .filteringRequestBody(() => '*')
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const resultMap = {
                                getBalances: { balances: ['3'] },
                            };

                            return resultMap[body.command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return false', () => {
                    return isFundedBundle()(bundle).then((isFunded) => {
                        expect(isFunded).to.equal(false);
                    });
                });
            });

            describe('when total balance of bundle inputs is equal to latest balance on input addresses', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                    })
                        .filteringRequestBody(() => '*')
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const resultMap = {
                                getBalances: { balances: ['10'] },
                            };

                            return resultMap[body.command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true', () => {
                    return isFundedBundle()(bundle).then((isFunded) => {
                        expect(isFunded).to.equal(true);
                    });
                });
            });

            describe('when total balance of bundle inputs is less than latest balance on input addresses', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                    })
                        .filteringRequestBody(() => '*')
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const resultMap = {
                                getBalances: { balances: ['20'] },
                            };

                            return resultMap[body.command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true', () => {
                    return isFundedBundle()(bundle).then((isFunded) => {
                        expect(isFunded).to.equal(true);
                    });
                });
            });
        });
    });

    describe('#categoriseInclusionStatesByBundleHash', () => {
        describe('when size of first param does not equal size of second param', () => {
            it('should throw an error with message "Inclusion states size mismatch."', () => {
                try {
                    categoriseInclusionStatesByBundleHash([], [false, false]);
                } catch (error) {
                    expect(error.message).to.eql('Inclusion states size mismatch.');
                }
            });
        });

        describe('when size of first param equals size of second param', () => {
            it('should categorise inclusion states (passed as second param) by bundle hashes', () => {
                const tailTransactions = [
                    { bundle: 'A'.repeat(81) },
                    { bundle: 'A'.repeat(81) },
                    { bundle: 'B'.repeat(81) },
                    { bundle: 'C'.repeat(81) },
                    { bundle: 'A'.repeat(81) },
                    { bundle: 'B'.repeat(81) },
                ];

                const inclusionStates = [
                    false, // AAA
                    false, // AAA
                    false, // BBB
                    false, // CCC
                    true, // AAA
                    false, // BBB
                ];

                const result = categoriseInclusionStatesByBundleHash(tailTransactions, inclusionStates);
                expect(result).to.eql({
                    ['A'.repeat(81)]: true,
                    ['B'.repeat(81)]: false,
                    ['C'.repeat(81)]: false,
                });
            });
        });
    });
});
