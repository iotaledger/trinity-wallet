import assign from 'lodash/assign';
import find from 'lodash/find';
import keys from 'lodash/keys';
import includes from 'lodash/includes';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import omit from 'lodash/omit';
import map from 'lodash/map';
import { expect } from 'chai';
import sinon from 'sinon';
import nock from 'nock';
import {
    prepareTransferArray,
    categoriseTransactionsByPersistence,
    getPendingTxTailsHashes,
    markTransfersConfirmed,
    getTransactionsDiff,
    categoriseTransactions,
    normaliseBundle,
    mergeNewTransfers,
    categoriseBundleByInputsOutputs,
    performPow,
    filterInvalidPendingTransactions,
    getBundleHashesForNewlyConfirmedTransactions,
    constructNormalisedBundles,
    prepareForAutoPromotion,
    getOwnTransactionHashes,
    pickNewTailTransactions,
    retryFailedTransaction,
    sortTransactionTrytesArray,
    getTransferValue,
    computeTransactionMessage,
    isValidTransfer,
    isFundedBundle,
    categoriseInclusionStatesByBundleHash,
} from '../../../libs/iota/transfers';
import { iota, SwitchingConfig, quorum } from '../../../libs/iota/index';
import trytes from '../../__samples__/trytes';
import * as mockTransactions from '../../__samples__/transactions';
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

    describe('#categoriseTransactionsByPersistence', () => {
        it('should always return an object with props "unconfirmed" and "confirmed"', () => {
            const args = [
                [undefined, undefined],
                [undefined, null],
                [null, null],
                [[], []],
                [{}, {}],
                ['', undefined],
                [0, 0],
                ['foo', undefined],
            ];

            args.forEach((arg) => {
                expect(categoriseTransactionsByPersistence(...arg)).to.have.keys(['confirmed', 'unconfirmed']);
            });
        });

        it('should map all those transactions to "confirmed" prop array that have corresponding states true', () => {
            const transactions = [{ bundle: 'foo' }, { bundle: 'baz' }];

            const states = [true, false];

            expect(categoriseTransactionsByPersistence(transactions, states).confirmed).to.eql([{ bundle: 'foo' }]);
        });

        it('should map all those transactions to "unconfirmed" prop array that have corresponding states false', () => {
            const transactions = [{ bundle: 'foo' }, { bundle: 'baz' }];

            const states = [true, false];

            expect(categoriseTransactionsByPersistence(transactions, states).unconfirmed).to.eql([{ bundle: 'baz' }]);
        });
    });

    describe('#getPendingTxTailsHashes', () => {
        describe('when argument passed is empty, null or undefined', () => {
            it('should return an empty array', () => {
                expect(getPendingTxTailsHashes([])).to.eql([]);
                expect(getPendingTxTailsHashes(undefined)).to.eql([]);
                expect(getPendingTxTailsHashes(null)).to.eql([]);
            });
        });

        describe('when argument passed is an object', () => {
            it('should return an empty array if no values have persistence false', () => {
                const args = { bundleOne: {}, bundleTwo: {} };

                expect(getPendingTxTailsHashes(args)).to.eql([]);
            });

            it('should return an array with hashes for elements with persistence false', () => {
                const args = {
                    bundleOne: { tailTransactions: [{ hash: '999' }, { hash: 'UUU' }], value: 100, persistence: false },
                    bundleTwo: { tailTransactions: [{ hash: 'XXX' }, { hash: 'YYY' }], value: 100, persistence: true },
                };

                expect(getPendingTxTailsHashes(args)).to.eql(['999', 'UUU']);
            });
        });
    });

    describe('#markTransfersConfirmed', () => {
        describe('when second argument passed is empty, null or undefined', () => {
            it('should return first argument', () => {
                expect(markTransfersConfirmed({}, null)).to.eql({});
                expect(markTransfersConfirmed({}, undefined)).to.eql({});
                expect(markTransfersConfirmed({}, [])).to.eql({});
            });
        });

        describe('when second argument passed is not an empty array', () => {
            it('should assign persistence true to those objects that have any tail transaction hash in second argument array', () => {
                const normalisedTransfers = {
                    bundleHashOne: {
                        persistence: false,
                        tailTransactions: [{ hash: 'UUU' }],
                    },
                    bundleHashTwo: {
                        persistence: false,
                        tailTransactions: [{ hash: 'XXX' }],
                    },
                };

                const confirmedTransactionsHashes = ['XXX'];

                const result = {
                    bundleHashOne: { persistence: false, tailTransactions: [{ hash: 'UUU' }] },
                    bundleHashTwo: { persistence: true, tailTransactions: [{ hash: 'XXX' }] },
                };

                expect(markTransfersConfirmed(normalisedTransfers, confirmedTransactionsHashes)).to.eql(result);
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

    describe('#mergeNewTransfers', () => {
        describe('when bundle hash of new normalised transfer exists in existing normalised transfers', () => {
            it('should add tail transactions of new tranfers to tail transactions in existing transfer', () => {
                const existingNormalizedTransfers = {
                    bundleHashOne: {
                        tailTransactions: [
                            {
                                hash: 'YYY',
                            },
                            {
                                hash: 'ZZZ',
                            },
                        ],
                        bundle: 'bundleHashOne',
                    },
                    bundleHashTwo: {
                        tailTransactions: [
                            {
                                hash: 'AAA',
                            },
                            {
                                hash: 'FFF',
                            },
                        ],
                        bundle: 'bundleHashTwo',
                    },
                };

                const newNormalizedTransfers = {
                    bundleHashTwo: {
                        tailTransactions: [
                            {
                                hash: 'CCC',
                            },
                        ],
                        bundle: 'bundleHashTwo',
                    },
                };

                const mergedTransfers = {
                    bundleHashOne: {
                        tailTransactions: [
                            {
                                hash: 'YYY',
                            },
                            {
                                hash: 'ZZZ',
                            },
                        ],
                        bundle: 'bundleHashOne',
                    },
                    bundleHashTwo: {
                        tailTransactions: [
                            {
                                hash: 'AAA',
                            },
                            {
                                hash: 'FFF',
                            },
                            {
                                hash: 'CCC',
                            },
                        ],
                        bundle: 'bundleHashTwo',
                    },
                };

                expect(mergeNewTransfers(newNormalizedTransfers, existingNormalizedTransfers)).to.eql(mergedTransfers);
            });

            it('should keep unique hash values of tail transactions', () => {
                const existingNormalizedTransfers = {
                    bundleHashOne: {
                        tailTransactions: [
                            {
                                hash: 'YYY',
                            },
                            {
                                hash: 'ZZZ',
                            },
                        ],
                        bundle: 'bundleHashOne',
                    },
                    bundleHashTwo: {
                        tailTransactions: [
                            {
                                hash: 'AAA',
                            },
                            {
                                hash: 'FFF',
                            },
                        ],
                        bundle: 'bundleHashTwo',
                    },
                };

                const newNormalizedTransfers = {
                    bundleHashTwo: {
                        tailTransactions: [
                            {
                                hash: 'FFF',
                            },
                        ],
                        bundle: 'bundleHashTwo',
                    },
                };

                const mergedTransfers = {
                    bundleHashOne: {
                        tailTransactions: [
                            {
                                hash: 'YYY',
                            },
                            {
                                hash: 'ZZZ',
                            },
                        ],
                        bundle: 'bundleHashOne',
                    },
                    bundleHashTwo: {
                        tailTransactions: [
                            {
                                hash: 'AAA',
                            },
                            {
                                hash: 'FFF',
                            },
                        ],
                        bundle: 'bundleHashTwo',
                    },
                };

                expect(mergeNewTransfers(newNormalizedTransfers, existingNormalizedTransfers)).to.eql(mergedTransfers);
            });
        });

        describe('when bundle hash of new normalised transfer does not exist in existing normalised transfers', () => {
            it('should assign new normalised transfer to the existing normalised transfers', () => {
                const existingNormalizedTransfers = {
                    bundleHashOne: {
                        tailTransactions: [
                            {
                                hash: 'YYY',
                            },
                            {
                                hash: 'ZZZ',
                            },
                        ],
                        bundle: 'bundleHashOne',
                    },
                    bundleHashTwo: {
                        tailTransactions: [
                            {
                                hash: 'AAA',
                            },
                            {
                                hash: 'FFF',
                            },
                        ],
                        bundle: 'bundleHashTwo',
                    },
                };

                const newNormalizedTransfers = {
                    bundleHashThree: {
                        tailTransactions: [
                            {
                                hash: 'CCC',
                            },
                        ],
                        bundle: 'bundleHashThree',
                    },
                    bundleHashFour: {
                        tailTransactions: [
                            {
                                hash: 'DDD',
                            },
                        ],
                        bundle: 'bundleHashFour',
                    },
                };

                const mergedTransfers = {
                    bundleHashOne: {
                        tailTransactions: [
                            {
                                hash: 'YYY',
                            },
                            {
                                hash: 'ZZZ',
                            },
                        ],
                        bundle: 'bundleHashOne',
                    },
                    bundleHashTwo: {
                        tailTransactions: [
                            {
                                hash: 'AAA',
                            },
                            {
                                hash: 'FFF',
                            },
                        ],
                        bundle: 'bundleHashTwo',
                    },
                    bundleHashThree: {
                        tailTransactions: [
                            {
                                hash: 'CCC',
                            },
                        ],
                        bundle: 'bundleHashThree',
                    },
                    bundleHashFour: {
                        tailTransactions: [
                            {
                                hash: 'DDD',
                            },
                        ],
                        bundle: 'bundleHashFour',
                    },
                };

                expect(mergeNewTransfers(newNormalizedTransfers, existingNormalizedTransfers)).to.eql(mergedTransfers);
            });
        });
    });

    describe('#categoriseBundleByInputsOutputs', () => {
        let bundlesMap;

        beforeEach(() => {
            bundlesMap = {
                valueTransactionsWithNoRemainder: {
                    bundle: [
                        {
                            hash: 'KAQIKFPVUXRDXHHKYQHGMSMANNCANDWEJWZSDHVODXZJOEYFBXAAEXUKYUVYK9GFDOPPCXTYQLSUA9999',
                            signatureMessageFragment:
                                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 100,
                            obsoleteTag: 'WC9999999999999999999999999',
                            timestamp: 1540803186,
                            currentIndex: 0,
                            lastIndex: 1,
                            bundle: 'EOVVVSCLYEGBCO9HEUEBJLVBAQQDZLKEIUZXRZPFKESTSC9JNEVTVALLXUGRAZGTLFPFERSQHZWGLTQKW',
                            trunkTransaction:
                                'RMUAFMTJGHXCOEJDEKRWWXIVYHTLRXQZITACPRGQJPSRQ9QBBOMBTXEKRGDCEXZLNWSSCG9LBWIMZ9999',
                            branchTransaction:
                                'MHOMYGDAUPMHXVOZYBALXQKKWVUINYM9AMAP9WTJVHVHCXISQOGMMTAERKSWZQYHEGCUJA9HUZLBA9999',
                            tag: 'WC9999999999999999999999999',
                            attachmentTimestamp: 1540803203768,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'IDYW9HSKDJWSKORKXPTKSYAMTMG',
                        },
                        {
                            hash: 'RMUAFMTJGHXCOEJDEKRWWXIVYHTLRXQZITACPRGQJPSRQ9QBBOMBTXEKRGDCEXZLNWSSCG9LBWIMZ9999',
                            signatureMessageFragment:
                                'MREUITP9DQMWAXXXWBGRDDHJVBMXRDEODKYVLTBHQARMRJYA9O9ZKLRRCVIBVBYGFRMENELIWCHGRWHDWC9IYSUXRGSZPLSNXECOWLGOUVBM9E9UGPB9HGHJRQHNEEBQEZ9IHGZLLBTZHTYNQTLGSTSBGZYKPWFWPAECXYVUML9AAJ9EHJDMSUYYBXLSWEIOGOYMJJBFPAHSMUGTXTSVWMJZKPETJXDUIECVVEAKVOEOIGBOBZCZZYMYSYCOCRJK9QJHPUMCNUDMSBWJJGDDFEIAKPERCLOHCHDFDZGQXX9GYWLOUIOPYILDTVFFOXKQY9BBQWMN9CDQTEPOIQEQABRLDIUEKMIOYFNAEGIXVAICYYYWNX9M9NO9GFAHHW9FR9QCERUHQQMIJOKXDPXOBOAYOAMXSZ9ZO9MEWACERFE9RQVBHKVJML9LBYLTORUADKIBREPZCKBVFQACWFVSSUICNSMGANTYAYXJFZAC9ROVGCUBYZBNRSURFWDLQMPZXJNEUJKXWSKNB9OCCI9BLHNUZWREJGGXQBEBNMHRHTNABQB9OBOWHBWKNJQDXJSTGPSJE9CZMRPFYFSPXHWTWSPXCFODLUZPHUTORUQZJKQHXPHYGMJTREMGPDDGAPGMJVTTDECDOUIDQVCJSQFSDWDRK9ITIEPQKFXQZHAXUIAIIITXZTLZDATGJC9AFEAMLTZAKXXYZYSVBRVQXJ9MSIRZBDMQQBXYIGXNQKONJHUUDAJLROAQPS9SCQNDIGSDYFGRWXDQHOISHSRZUSRRCXORVOUQMCNQJJETK9IBIWERKTSFAHXZWEIYQBOTYGYQYYB9KXZSNYFMAETOSIHLZLFXAIIEDERA9UHFHTJIBPNPXSKCMLC9ACPORY9VDKRIWJPEYE9NYCJPKDTMASMJPXU9WEBYZNKHXVXU9QP9DSEGIUGFQJTFFUHYZZNVYTNGPDQJALDQDKJZZJLISGFYQAEJARGKRYSGOBYKYHRYJJMNDVGHLGYXXSGULPAUF9VAMZCFBYLSZWDYFKZX99SDTWIKHTNSDMKGUGMTVWJZRUTTXLHSWEAMMYDKC9JEIYUJDSSQCSCWUACHPYSOLGRWKOYW9NTUQBERDOWNWYGONHHRNWYZKYOQVX9XTTYRZAUIXNAIRCCHWHVOTSYZNTOIZXNUGJQZUBIXPVMHJGHXNCTWZRYOBNAZOOWFGIVYUJWVGBWRVCOILQGRIGABMON9QJZEUNFRDOROAV9DRBDXBHQYWWZHQDLRJAX9IJJTTGRFBVZIEFYVICXQFPYYCUJBHWZETE9VAPJLPJFODTMNEXUKAUUBTLQTWQFIROOUTBZFNNJ9QOIJPXRCJDCOZPIQLQQDYTGKDHUJWQPNYXVKJX9MQUTTEDFJWBQYKQMZLYU9HUKXI9DA9TIOCBTCFUMPOIGBAJDSMUXKDLN9DLXXJJDOKYYMSWUICIGOTEPQPCUNTZHDXUVGRFQLUYZFOTG9VQBNIYVKGENLYNDUEZVHRTSSVWLWPIUJJXCAOMBFQIEYWEBXSNEYGFNBRRAE9V9OOIZJRONIUHJCZUIVPNCWCGKEFKGDDEJWGVOKTDLKYKNMGZYYGOSBVWLJDSVRQAFCELYJROLAKHBD9CG9HIROCZSPWLTA9EUQLPZTM9BWQPA9XQOMDZWZOQQUKODQEOKVNHNSI9DTWNNVCFQCXDGSPBXWAYYMPMDE9IDZIRBN9JOYBDPSYLMMCUZIHCWKRJYMRCSNMZEEIHMPC9SAQFTSHRGNJB9BFSJLPZY9VQEXUNSDW9FOZ9JLEUONFSXJJJFWJTPSTFHNRJPIEVSUYLOTEWWRVFVZZPTBLMLHRKTMYQPSIXSX9GWSXZIPTUMXAPWAVWNUYAVNBGQVSHWYHA9WQXWXGXWDMIGWAQOPUNTRKVTZLMGSLWALLBDLVFE9KJQRHBDZMLSQOGAFUFCDKGPJJOEBQDNFK9HPVTUWMWFOCXZVOACFSKY9PBBFBOXRGTRKJQUWP9EFDRFCFNRZEZOMBALU9GNFUAGWMKRJXYAFJIZEVUKWJYGSMCSRCJCV9ZBOURCCO9KMNFMRROPQMVYSRRYIZLOEDYBKMAVOYANVJWLNJQLXPVVFTBDCRV9CPZUQJNNJYLOWCXJAGJDWNDCGNYVJEJVGDRV9CFQKBKEY9PFGHCAIHYKAPDX',
                            address:
                                'CHXVJOOIIBCZHEYXHEUMGBNONVA9UOGNEXWIUOUGFMVVWDMWPBXFQEBMIKWOKNFRHQOISWRCRFGUDVZAZ',
                            value: -100,
                            obsoleteTag: '999999999999999999999999999',
                            timestamp: 1540803186,
                            currentIndex: 1,
                            lastIndex: 1,
                            bundle: 'EOVVVSCLYEGBCO9HEUEBJLVBAQQDZLKEIUZXRZPFKESTSC9JNEVTVALLXUGRAZGTLFPFERSQHZWGLTQKW',
                            trunkTransaction:
                                'MHOMYGDAUPMHXVOZYBALXQKKWVUINYM9AMAP9WTJVHVHCXISQOGMMTAERKSWZQYHEGCUJA9HUZLBA9999',
                            branchTransaction:
                                'JQPGGGY9CXUGFUG9KQJOBJCNBWO9BVRGQOGHALZEFFDJWEMZVWFXBGJULIALYCOQRDCAA9JRGGAXZ9999',
                            tag: '999999999999999999999999999',
                            attachmentTimestamp: 1540803191223,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: '9XKCYTYWAQYVJJCI9ACUBOEAT9H',
                        },
                    ],
                    inputs: [
                        {
                            address:
                                'CHXVJOOIIBCZHEYXHEUMGBNONVA9UOGNEXWIUOUGFMVVWDMWPBXFQEBMIKWOKNFRHQOISWRCRFGUDVZAZ',
                            value: -100,
                            hash: 'RMUAFMTJGHXCOEJDEKRWWXIVYHTLRXQZITACPRGQJPSRQ9QBBOMBTXEKRGDCEXZLNWSSCG9LBWIMZ9999',
                            currentIndex: 1,
                            lastIndex: 1,
                            checksum: 'NMSVFUQPW',
                        },
                    ],
                    outputs: [
                        {
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 100,
                            hash: 'KAQIKFPVUXRDXHHKYQHGMSMANNCANDWEJWZSDHVODXZJOEYFBXAAEXUKYUVYK9GFDOPPCXTYQLSUA9999',
                            currentIndex: 0,
                            lastIndex: 1,
                            checksum: 'GI9KMCCEC',
                        },
                    ],
                },
                zeroValueTransactions: {
                    bundle: [
                        {
                            hash: 'WNFESDTEFDS9CCVAERQNJXPZJWPRQTJJQAC9ITFQXRFSLVLBKJEOGVHQ9QBJZITFLGXNRA9QMJNEA9999',
                            signatureMessageFragment:
                                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 0,
                            obsoleteTag: 'XE9999999999999999999999999',
                            timestamp: 1540803317,
                            currentIndex: 0,
                            lastIndex: 0,
                            bundle: 'BBI99KUREFBJXE9SFBECRPBQQYIBLLWLKZ9KDASSACTJBPFDXQJVZUUD9UUBXSHBV9FRJJFKLTUEAHPBW',
                            trunkTransaction:
                                'BTL9BMLUYGNLODQCQWTYKVLVYCPYZBCURCROIVUQWTSLJTAVKAEEWMZQFJDXUWLQX99K9RUMGNZQZ9999',
                            branchTransaction:
                                'OCVRFBRUDUUYXMSTQRGHLUHWBPHVTGNAOOBBMHUOUWBUFJJKXDKGJCGYSPFOCFAFR9VMETXVZVGBZ9999',
                            tag: 'XE9999999999999999999999999',
                            attachmentTimestamp: 1540803321789,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'ZMJNGH9M9RMLZKRUPXBOTZPPSCA',
                        },
                    ],
                    inputs: [],
                    outputs: [
                        {
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 0,
                            hash: 'WNFESDTEFDS9CCVAERQNJXPZJWPRQTJJQAC9ITFQXRFSLVLBKJEOGVHQ9QBJZITFLGXNRA9QMJNEA9999',
                            currentIndex: 0,
                            lastIndex: 0,
                            checksum: 'GI9KMCCEC',
                        },
                    ],
                },
                valueTransactionsWithRemainder: {
                    bundle: [
                        {
                            hash: 'EHFGMUTRBYTU9IFAABLEUQYJJAFBERNPUCVIJEXGOHCBQAIZLWTGJOBVDGLPUEPSG9AGQSZLUOQO99999',
                            signatureMessageFragment:
                                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 10,
                            obsoleteTag: 'SA9999999999999999999999999',
                            timestamp: 1540803385,
                            currentIndex: 0,
                            lastIndex: 2,
                            bundle: 'KZFCIHDYQJYQSHBDKPROBJDQTFHAJEDEIPKUWQDUNLXIT9YKLXQSVHNCP9QBGXGADVOITZGHJFZGUEFSW',
                            trunkTransaction:
                                'QNNSDQQHDKCQQXJNSINYPKNVZXE9OPADCJCIHAVCWJHKWCZIZE9IVNUYW9CFZGKLQPKMJBIRCJYFZ9999',
                            branchTransaction:
                                'HHJWORCLFPUYCHOAPCUKKUBRQG9GJUBKEHSBCCERREXFHUGJUNNWWBFQRAYCTVLOTBNOLZADCYNU99999',
                            tag: 'SA9999999999999999999999999',
                            attachmentTimestamp: 1540803394274,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'PFZMLBKWXIPLFFSMSTU9CUIWUXC',
                        },
                        {
                            hash: 'QNNSDQQHDKCQQXJNSINYPKNVZXE9OPADCJCIHAVCWJHKWCZIZE9IVNUYW9CFZGKLQPKMJBIRCJYFZ9999',
                            signatureMessageFragment:
                                'XFVWFVDSKVVNLDOVDECSNRLJZQRYFPGXWAUDSDKMTGNXLMKP9DXLUCKZEISULSLUCRDODPFWXFQMGCKMZRND9NTO9JQDSBQCCSQOTJEYWJXYHWFQACUXNTPHBZSZCKEROTDJKOEMONALAVRWV9SUUHWMNKUQOVMGQYFVHPYRZYTWTFQPOCQUNRECUZBKYMEMOLUIOGP9JBFGALEPZDEYMCUCYALC9PYLOKVFYFMJJWIJ9LUGOAYVFAABTSQQOLWUQYKKRHFSRATHR9XGQDJNBYFSLNENNVRYLJHRPNZJXPMUSXYGJVZJHJEFQBOCJBWYTBLXVFFEHNMPZQDJUGCFWEJXRJBZKQKZW9HLRV9VZDLCV9DYKDWXWXZJEILMOECZKJLLHISWYNDFLEOSCEHQWRQWKZOHEIRBCJOEWDAWUPNVHYFQPDSZXGLXGGFQI9JEKIY9KHQOMAOHVDYPGVQLZUUTMGNOBCKKB9JCTDQUSCHAMKPHXJDMXKIXKRBFTMTOMYVPRILSYTFRECJAFVSULZQQSZRMPBNGFOGCSMXDWYSNRQIUQL9ZOTAYNUYGICJOIFPQOQCSBDEHJZLSLRAOIU9ZMTKWHREOTKSGEOUGTVUQBV9SHSAUQ9UGRHIENULXUQCMPQXDLLLBAJHJIMVSZ9XTAWEHWMLLIVHYAIKWQFY9GEXGPR9RNDTIDFDNVGJZGGYBTLXMUPMDQG9PWIFNIOHHYPQSEXIOFKBNHPSOBTYNYPSDAUPSBKILOA9GECKZQYTJO9SZFTSVRLLGPOBEDNRKZPBZEPWTKTSCADTGJDRYWFVOAG9IEJQORZPPPMGCBAHKUHADDRKMSUVQS9QAQJDDZAZLGVRY9PQWRJMWASUAMLGEZLLSYTYYAODVAOMHEERESXFMQZNVKEITQSZQUILQOXPBSBRVHMMLIPRPLUNJZONTLDWCTADHRFWEBIUWTIEBNISGFJKDBGJ9DDULEKXMFI9BDWOSCLWODMUVQOJKFMBCWMMVJ9YCALQLCQPPDNWD9VBMBDJEOCUIVOWRRFLATDKEBDXITIMYCMGWIWGZDTLBQBSTPNCDZZXFCHNADJDQETWMPABDDTOQFBVTJBAWSRJZVBHRCCJOQHBJDGJE9ZZREQQZUQEOOVAQJKJILFTUQXTXIKQADEHNGGSGONTLGMGN9KYOMAVDVYSSCGPT9QTZTVF9VLFNKJDEFQWTZTLV9ZZRNOIN9OQZHJHFIOZXYKMPLXNNSUEOQFU9FPUAADCEFHBAA9QHLIDQG9V9HSLMZYIJXVJNJ9M9CJBCKQKOFGCLNYDZ9YLB9GYDT9QELNVPBQFESBJTWBWKVVUNHOSIPNXHTMBBN9JCMSRWPFT9LBOCSQXACLSMDTELCWQUXFKIXNOWMRKIDIUDATBPUMFILVWRVOPALPALREQKKSREIJFSWLTPDOXEYSCGZUZ9IEAHPXCWGUVANEG9VYUQQORYFMEMGVDIURCNRCCACMOIL9LAZUYLXWILEHZOPLJRBWFKATUKFRGDNGTYIGFCZJDUGXPYUHUDHPGFSVUSEYDQJUJCPUSBJGJIWOKHGYOOIX99IRWCJXLBAUPZVISTDAUASWFNMFUPIGIWURFCXPKOIDTX9MQOSTGCCRJCYIWIVZHSVRI9PIXTLYKBJZGSLAKVTXMQSOLGFDEUPYFDEDCDTPJHHSJFMINQXBQBASKKWOXIDZVGTOYJXAOFVPYPIJX9QRJDVFTKRFMDDDRJNUJAISRNGS9CXZJFCEIDHEJONLMJAAYWE9LPWAI9QQHHP9YIIVVKOYYMHNUZFYOVHEDGLYZUEUHWUZKWY9FOA9WDLIHZHLWZRIWEUYRXSRXIAVPSWDDMMAOQARUWXYWRCMINHSYEIKRJQRWWAHLFTINSNQHRAHSVLUGRYHPRYKLKRXYJUCQGSFRQFFEMVLRCKAAD9NSGOUYRYPXYWLFNXSNLXFZA9NQPAL9YOWMPOOQCTQLSJXMWCUQSDIU9AZSUVFMKWNRNXCHHQXOOLHUFDQNNINSWZDWYVKTECEZ9INRPHVHTQIHTUEEKNWFLLDVSOXIVVV9LDFEJHBKONGAWO9VHGACHSILXVJFJMDWSLZXVJZYEFGKJILYX9LAPCUXMBIHZYISWDGLUAGEWOSSNYNPEWYGSKVFZXGO9MXDVFIHSANVJKJKVBXW',
                            address:
                                'CHXVJOOIIBCZHEYXHEUMGBNONVA9UOGNEXWIUOUGFMVVWDMWPBXFQEBMIKWOKNFRHQOISWRCRFGUDVZAZ',
                            value: -100,
                            obsoleteTag: '999999999999999999999999999',
                            timestamp: 1540803385,
                            currentIndex: 1,
                            lastIndex: 2,
                            bundle: 'KZFCIHDYQJYQSHBDKPROBJDQTFHAJEDEIPKUWQDUNLXIT9YKLXQSVHNCP9QBGXGADVOITZGHJFZGUEFSW',
                            trunkTransaction:
                                'JHNCOZT9REWJSNHEPYRYXYG9LYVXHDYAPWQYIFVRC9VTOJABFKHLNTSHL9TQO9NZUXYISGQRUWAIZ9999',
                            branchTransaction:
                                'HHJWORCLFPUYCHOAPCUKKUBRQG9GJUBKEHSBCCERREXFHUGJUNNWWBFQRAYCTVLOTBNOLZADCYNU99999',
                            tag: '999999999999999999999999999',
                            attachmentTimestamp: 1540803393849,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'ZJ9XPSMFEDMDVJCIVMVULRKY9ZX',
                        },
                        {
                            hash: 'JHNCOZT9REWJSNHEPYRYXYG9LYVXHDYAPWQYIFVRC9VTOJABFKHLNTSHL9TQO9NZUXYISGQRUWAIZ9999',
                            signatureMessageFragment:
                                '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            address:
                                'DLROEFFXYWCBKDEIWRQSWYHMFLFTVRARPGASBRQWYKEYHTALBJUVZYPFKYOXSOF9NKGAMGPMGUZBOVQCX',
                            value: 90,
                            obsoleteTag: '999999999999999999999999999',
                            timestamp: 1540803385,
                            currentIndex: 2,
                            lastIndex: 2,
                            bundle: 'KZFCIHDYQJYQSHBDKPROBJDQTFHAJEDEIPKUWQDUNLXIT9YKLXQSVHNCP9QBGXGADVOITZGHJFZGUEFSW',
                            trunkTransaction:
                                'HHJWORCLFPUYCHOAPCUKKUBRQG9GJUBKEHSBCCERREXFHUGJUNNWWBFQRAYCTVLOTBNOLZADCYNU99999',
                            branchTransaction:
                                'PU9KWOIEMHWEVWIDUJFCYOEACKVECOSMSOODZ9VKMHMRMRXSUMIFVKNIJZAQOYOVCYYLCGWPBPVUZ9999',
                            tag: '999999999999999999999999999',
                            attachmentTimestamp: 1540803390126,
                            attachmentTimestampLowerBound: 0,
                            attachmentTimestampUpperBound: 3812798742493,
                            nonce: 'EV9GTWIUSUCXQJBCQMEKPYREQHZ',
                        },
                    ],
                    inputs: [
                        {
                            address:
                                'CHXVJOOIIBCZHEYXHEUMGBNONVA9UOGNEXWIUOUGFMVVWDMWPBXFQEBMIKWOKNFRHQOISWRCRFGUDVZAZ',
                            value: -100,
                            hash: 'QNNSDQQHDKCQQXJNSINYPKNVZXE9OPADCJCIHAVCWJHKWCZIZE9IVNUYW9CFZGKLQPKMJBIRCJYFZ9999',
                            currentIndex: 1,
                            lastIndex: 2,
                            checksum: 'NMSVFUQPW',
                        },
                    ],
                    outputs: [
                        {
                            address:
                                '9SXPXDOWACCKWWDB9SVXJHFWEPMEHDAWIBHWQVBWLHZAYLFRGFEYFUSIGXFLFTMKIHFOYVBNWFRVCR9JA',
                            value: 10,
                            hash: 'EHFGMUTRBYTU9IFAABLEUQYJJAFBERNPUCVIJEXGOHCBQAIZLWTGJOBVDGLPUEPSG9AGQSZLUOQO99999',
                            currentIndex: 0,
                            lastIndex: 2,
                            checksum: 'GI9KMCCEC',
                        },
                        {
                            address:
                                'DLROEFFXYWCBKDEIWRQSWYHMFLFTVRARPGASBRQWYKEYHTALBJUVZYPFKYOXSOF9NKGAMGPMGUZBOVQCX',
                            value: 90,
                            hash: 'JHNCOZT9REWJSNHEPYRYXYG9LYVXHDYAPWQYIFVRC9VTOJABFKHLNTSHL9TQO9NZUXYISGQRUWAIZ9999',
                            currentIndex: 2,
                            lastIndex: 2,
                            checksum: 'LMGZQSHFB',
                        },
                    ],
                },
            };
        });

        describe('when transaction object has a negative value', () => {
            it('should categorise as "inputs"', () => {
                for (const prop in bundlesMap) {
                    const result = categoriseBundleByInputsOutputs(bundlesMap[prop].bundle, [], 1);

                    expect(result.inputs).to.eql(bundlesMap[prop].inputs);
                }
            });
        });

        describe('when transaction object has a non-negative value', () => {
            describe('when outputs size is less than outputs threshold', () => {
                it('should categorise as "outputs"', () => {
                    const outputsThreshold = 4;

                    for (const prop in bundlesMap) {
                        const result = categoriseBundleByInputsOutputs(bundlesMap[prop].bundle, [], outputsThreshold);

                        expect(result.outputs).to.eql(bundlesMap[prop].outputs);
                    }
                });
            });

            describe('when outputs size is greater than outputs threshold', () => {
                it('should filter outputs with unknown addresses', () => {
                    const { valueTransactionsWithNoRemainder: { bundle } } = bundlesMap;
                    const result = categoriseBundleByInputsOutputs(bundle, [], 0);

                    expect(result.outputs).to.eql([]);
                });

                it('should not filter remainder outputs', () => {
                    const { valueTransactionsWithRemainder: { bundle } } = bundlesMap;
                    const result = categoriseBundleByInputsOutputs(bundle, [], 0);

                    expect(result.outputs).to.eql([
                        {
                            address:
                                'DLROEFFXYWCBKDEIWRQSWYHMFLFTVRARPGASBRQWYKEYHTALBJUVZYPFKYOXSOF9NKGAMGPMGUZBOVQCX',
                            value: 90,
                            hash: 'JHNCOZT9REWJSNHEPYRYXYG9LYVXHDYAPWQYIFVRC9VTOJABFKHLNTSHL9TQO9NZUXYISGQRUWAIZ9999',
                            currentIndex: 2,
                            lastIndex: 2,
                            checksum: 'LMGZQSHFB',
                        },
                    ]);
                });
            });
        });
    });

    describe('#performPow', () => {
        let powFn;
        let digestFn;
        let trunkTransaction;
        let branchTransaction;

        const nonces = [
            'N9UIMZQVDYWLXWGHLELNRCUUPMP',
            'SLSJJSDPDTDSKEVCBVPMWDNOLAH',
            'K9JXMYPREJZGUFFSANKRNPOMAGR',
            'CAIYIYWLTPMFZOABIHTXOPWCZNQ',
        ];

        beforeEach(() => {
            powFn = () => {
                let calledTimes = 0;

                return () => {
                    const promise = Promise.resolve(nonces[calledTimes]);
                    calledTimes += 1;

                    return promise;
                };
            };

            digestFn = (trytes) => Promise.resolve(iota.utils.transactionObject(trytes).hash);

            trunkTransaction = 'LLJWVVZFXF9ZGFSBSHPCD9HOIFBCLXGRV9XWSQDTGOMSRGQQIVFVZKHLKTJJVFMXQTZVPNRNAQEPA9999';
            branchTransaction = 'GSHUHUWAUUGQHHNAPRDPDJRKZFJNIAPFNTVAHZPUNDJWRHZSZASOERZURXZVEHN9OJVS9QNRGSJE99999';
        });

        it('should sort transaction objects in ascending order by currentIndex', () => {
            const fn = performPow(
                powFn(),
                digestFn,
                trytes.value.slice().reverse(),
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
                digestFn,
                trytes.value.slice().reverse(),
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
                digestFn,
                trytes.value.slice().reverse(),
                trunkTransaction,
                branchTransaction,
                14,
            );

            return fn.then(({ transactionObjects }) => {
                expect(transactionObjects[0].trunkTransaction).to.equal(transactionObjects[1].hash);
                expect(transactionObjects[0].branchTransaction).to.equal(trunkTransaction);

                expect(transactionObjects[1].trunkTransaction).to.equal(transactionObjects[2].hash);
                expect(transactionObjects[1].branchTransaction).to.equal(trunkTransaction);

                expect(transactionObjects[2].trunkTransaction).to.equal(transactionObjects[3].hash);
                expect(transactionObjects[2].branchTransaction).to.equal(trunkTransaction);

                expect(transactionObjects[3].trunkTransaction).to.equal(trunkTransaction);
                expect(transactionObjects[3].branchTransaction).to.equal(branchTransaction);
            });
        });
    });

    describe('#filterInvalidPendingTransactions', () => {
        let sandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when there are no pending transactions', () => {
            it('should return an empty array', () => {
                const transactions = Array.from(new Array(5), () => ({ persistence: true }));

                const promise = filterInvalidPendingTransactions()(transactions, {});

                return promise.then((transactions) => {
                    expect(transactions).to.eql([]);
                });
            });
        });

        describe('when there are incoming pending transfers', () => {
            it('should filter transaction if input addresses do not have enough balance', () => {
                const getBalances = sinon.stub(quorum, 'getBalances').resolves({ balances: ['0'] });
                const addressData = {
                    ['U'.repeat(81)]: { spent: true },
                    ['V'.repeat(81)]: { spent: false },
                };

                const transactions = [
                    {
                        incoming: true,
                        persistence: false,
                        inputs: [{ address: 'A'.repeat(81), value: 10 }],
                    },
                ];

                const promise = filterInvalidPendingTransactions()(transactions, addressData);
                return promise.then((txs) => {
                    expect(txs).to.eql([]);
                    getBalances.restore();
                });
            });

            it('should not filter transaction if input addresses still have enough balance', () => {
                const getBalances = sinon.stub(quorum, 'getBalances').resolves({ balances: ['10'] });
                const addressData = {
                    ['U'.repeat(81)]: { spent: true },
                    ['V'.repeat(81)]: { spent: false },
                };

                const transactions = [
                    {
                        incoming: true,
                        persistence: false,
                        inputs: [{ address: 'A'.repeat(81), value: 10 }],
                    },
                ];

                const promise = filterInvalidPendingTransactions()(transactions, addressData);
                return promise.then((txs) => {
                    expect(txs).to.eql(transactions);
                    getBalances.restore();
                });
            });
        });

        describe('when there are outgoing pending transfers', () => {
            it('should filter transaction if input addresses do not have enough balance', () => {
                const getBalances = sinon.stub(quorum, 'getBalances').resolves({ balances: ['0'] });
                const addressData = {
                    ['U'.repeat(81)]: { spent: true },
                    ['V'.repeat(81)]: { spent: false },
                };

                const transactions = [
                    {
                        incoming: true,
                        persistence: false,
                        inputs: [{ address: 'U'.repeat(81), value: -10 }],
                    },
                ];

                const promise = filterInvalidPendingTransactions()(transactions, addressData);
                return promise.then((txs) => {
                    expect(txs).to.eql([]);
                    getBalances.restore();
                });
            });

            it('should not filter transaction if input addresses still have enough balance', () => {
                const getBalances = sinon.stub(quorum, 'getBalances').resolves({ balances: ['10'] });
                const addressData = {
                    ['U'.repeat(81)]: { spent: true },
                    ['V'.repeat(81)]: { spent: false },
                };

                const transactions = [
                    {
                        incoming: true,
                        persistence: false,
                        inputs: [{ address: 'U'.repeat(81), value: -10 }],
                    },
                ];

                const promise = filterInvalidPendingTransactions()(transactions, addressData);
                return promise.then((txs) => {
                    expect(txs).to.eql(transactions);
                    getBalances.restore();
                });
            });
        });
    });

    describe('#getBundleHashesForNewlyConfirmedTransactions', () => {
        it('should always return an array', () => {
            const args = [[undefined, undefined], [null, undefined], [], [{}, {}], ['', ''], [0, 0]];

            args.forEach((arg) => {
                expect(isArray(getBundleHashesForNewlyConfirmedTransactions(...arg))).to.equal(true);
            });
        });

        it('should return bundle hashes with any tail transaction existing in confirmed transaction hashes', () => {
            const unconfirmedBundleTails = {
                firstBundleHash: [{ hash: 'foo' }, { hash: 'baz' }],
                secondBundleHash: [{ hash: 'bar' }],
            };

            const confirmedTransactionsHashes = ['baz'];

            expect(
                getBundleHashesForNewlyConfirmedTransactions(unconfirmedBundleTails, confirmedTransactionsHashes),
            ).to.eql(['firstBundleHash']);
        });
    });

    describe('#constructNormalisedBundles', () => {
        it('should always return an object', () => {
            const args = [[undefined, undefined, undefined, undefined], [null, undefined, null, null], [], [{}, {}]];

            args.forEach((arg) => {
                expect(isObject(constructNormalisedBundles(...arg))).to.equal(true);
            });
        });

        it('should return normalized bundles', () => {
            expect(
                constructNormalisedBundles(
                    mockTransactions.tailTransactions,
                    mockTransactions.transactionObjects,
                    [false, true, false],
                    [
                        'WUOTVAPXBUWZYNN9WZXGDNAFOWNQPJLHJJDMUCLMPONEEMVNGEH9XIYAPB9LMXTAHOLZQNZFSHSIJAIID',
                        'ATOKJBNU9UVOETMNVGENWMLBKCIIMIQBPOGHJWMFEUJNXVUPQABEYIETRKPTQRT9AYOOMMYGX9OMTZAJX',
                    ],
                ),
            ).to.eql(mockTransactions.normalizedBundles);
        });

        it('should not return invalid bundles', () => {
            const invalidTransactionObjects = mockTransactions.transactionObjects.map((tx) =>
                omit(tx, 'signatureMessageFragment'),
            );
            expect(
                constructNormalisedBundles(
                    mockTransactions.tailTransactions,
                    invalidTransactionObjects,
                    [false, true, false],
                    [
                        'WUOTVAPXBUWZYNN9WZXGDNAFOWNQPJLHJJDMUCLMPONEEMVNGEH9XIYAPB9LMXTAHOLZQNZFSHSIJAIID',
                        'ATOKJBNU9UVOETMNVGENWMLBKCIIMIQBPOGHJWMFEUJNXVUPQABEYIETRKPTQRT9AYOOMMYGX9OMTZAJX',
                    ],
                ),
            ).to.eql({});
        });
    });

    describe('#prepareForAutoPromotion', () => {
        let sandbox;

        beforeEach(() => {
            sandbox = sinon.sandbox.create();

            sandbox.stub(iota.api, 'getNodeInfo').yields(null, {});
        });

        afterEach(() => {
            sandbox.restore();
        });

        describe('when there are no pending transfers', () => {
            it('should resolve an empty array', () => {
                return prepareForAutoPromotion()([{ persistence: true }, { persistence: true }], {}, 'TEST').then(
                    (result) => expect(result).to.eql({}),
                );
            });
        });

        describe('when there are valid pending transfers', () => {
            it('should transform transfers by bundle', () => {
                const transactions = map(mockTransactions.normalizedBundles, (tx) => tx);
                const getBalances = sinon.stub(quorum, 'getBalances').resolves({ balances: ['100'] });

                return prepareForAutoPromotion()(
                    transactions,
                    {
                        WUOTVAPXBUWZYNN9WZXGDNAFOWNQPJLHJJDMUCLMPONEEMVNGEH9XIYAPB9LMXTAHOLZQNZFSHSIJAIID: {},
                        ATOKJBNU9UVOETMNVGENWMLBKCIIMIQBPOGHJWMFEUJNXVUPQABEYIETRKPTQRT9AYOOMMYGX9OMTZAJX: {},
                    },
                    'TEST',
                ).then((result) => {
                    expect(result).to.eql({
                        BHA9U99WJWBADGCDLLZSNRXNS9C9HCEDODDVACLZIGGTUDODOJQGJRGXNRBJCWKTLRXSAJLAGLYZQZXIA: [
                            {
                                hash:
                                    'KIYCLXKBYIIBRSZDZZTZZZ9WMSINGIWWOZBEYDCYTSREFRCMYJBJZ9NOXCJ9ORDXKVHJKCUBDLIDZ9999',
                                attachmentTimestamp: 1524573605144,
                                account: 'TEST',
                            },
                        ],
                    });

                    getBalances.restore();
                });
            });
        });

        describe('when there are invalid pending transfers', () => {
            it('should not include them in transformed bundles', () => {
                const transactions = map(mockTransactions.normalizedBundles, (tx) => tx);
                const getBalances = sinon.stub(quorum, 'getBalances').resolves({ balances: ['0'] });

                return prepareForAutoPromotion()(
                    transactions,
                    {
                        WUOTVAPXBUWZYNN9WZXGDNAFOWNQPJLHJJDMUCLMPONEEMVNGEH9XIYAPB9LMXTAHOLZQNZFSHSIJAIID: {},
                        ATOKJBNU9UVOETMNVGENWMLBKCIIMIQBPOGHJWMFEUJNXVUPQABEYIETRKPTQRT9AYOOMMYGX9OMTZAJX: {},
                    },
                    'TEST',
                ).then((result) => {
                    expect(result).to.eql({});

                    getBalances.restore();
                });
            });
        });
    });

    describe('#getOwnTransactionHashes', () => {
        it('should return transaction hashes for own addresses', () => {
            const bundles = keys(mockTransactions.normalizedBundles);

            const addressData = {
                SRWJECVJMNGLRTRNUBRBWOFWKXHWFOWXSZIARUSCAGQRMQNDOFJKJYRUIBCMQWIUTHSMQEYW9ZK9QBXAC: {},
                ATOKJBNU9UVOETMNVGENWMLBKCIIMIQBPOGHJWMFEUJNXVUPQABEYIETRKPTQRT9AYOOMMYGX9OMTZAJX: {},
            };

            const results = [
                [
                    'HGT9QOBW9KKRQY9G9AWXAKDUIICKRUWVQ9MOWLX9YLXJMTNWX9L9RUMDHIHNJD9MYXIECZTFATOEA9999',
                    'RXPWGHVYSRKQWRONOWMPAQJUMBZCUTXGAPAOKAFCTDUNNBN9VKUUJQOGZGNUYBFCJABFZWFCHBMKA9999',
                    'HW9YVRZRJAUMWI9BMIYCRFPXMNBG9ACAKZFWCTRNTJHKZHPXK9RDGKQGJHMNMUYWSIQBIEWKLOOEA9999',
                ],
                [],
            ];

            bundles.forEach((bundle, idx) => {
                const result = getOwnTransactionHashes(mockTransactions.normalizedBundles[bundle], addressData);

                expect(result).to.eql(results[idx]);
            });
        });
    });

    describe('#pickNewTailTransactions', () => {
        let tailTransactionFromUnseenBundle;
        let transactionObjects;

        before(() => {
            tailTransactionFromUnseenBundle = {
                currentIndex: 0,
                bundle: 'U'.repeat(81),
                hash: '9'.repeat(81),
            };

            transactionObjects = [
                tailTransactionFromUnseenBundle,
                {
                    currentIndex: 1,
                    bundle: 'U'.repeat(81),
                    hash: 'A'.repeat(81),
                },
                {
                    currentIndex: 2,
                    bundle: 'U'.repeat(81),
                    hash: 'B'.repeat(81),
                },
            ];
        });

        describe('when tail transaction object is from an unseen bundle', () => {
            it('should return tail transaction', () => {
                expect(pickNewTailTransactions(transactionObjects, mockTransactions.normalizedBundles)).to.eql([
                    tailTransactionFromUnseenBundle,
                ]);
            });
        });

        describe('when tail transaction object is from a seen bundle', () => {
            it('should only return new (unseen) tail transaction', () => {
                const newTailTransactionForSeenBundle = {
                    currentIndex: 0,
                    bundle: 'HAXVESTQCJHLGZYTEG9DGBXHWNURRIAUXJEW9LGDQKJEFEXAWLSEOOMNATDGXGVDAIAAKLOPZHLLXPNTZ',
                    hash: 'R'.repeat(81),
                };

                const oldTailTransactionForSeenBundle = {
                    currentIndex: 0,
                    bundle: 'HAXVESTQCJHLGZYTEG9DGBXHWNURRIAUXJEW9LGDQKJEFEXAWLSEOOMNATDGXGVDAIAAKLOPZHLLXPNTZ',
                    hash: 'RXPWGHVYSRKQWRONOWMPAQJUMBZCUTXGAPAOKAFCTDUNNBN9VKUUJQOGZGNUYBFCJABFZWFCHBMKA9999',
                };

                expect(
                    pickNewTailTransactions(
                        [newTailTransactionForSeenBundle, oldTailTransactionForSeenBundle],
                        mockTransactions.normalizedBundles,
                    ),
                ).to.eql([newTailTransactionForSeenBundle]);
            });
        });
    });

    describe('#retryFailedTransaction', () => {
        let transactionObjects;
        let seedStore;

        before(() => {
            transactionObjects = map(trytes.value, iota.utils.transactionObject);
            seedStore = {
                performPow: (trytes) =>
                    Promise.resolve({
                        trytes,
                        transactionObjects: map(trytes, iota.utils.transactionObject),
                    }),
                getDigest: (trytes) => Promise.resolve(iota.utils.transactionObject(trytes).hash),
            };
        });

        describe('when all transaction objects have valid hash', () => {
            it('should not perform proof of work', () => {
                sinon.stub(seedStore, 'performPow');
                const storeAndBroadcast = sinon.stub(iota.api, 'storeAndBroadcast').yields(null, []);

                // Mock value trytes have a valid transaction hash
                return retryFailedTransaction()(transactionObjects, seedStore).then(() => {
                    expect(seedStore.performPow.callCount).to.equal(0);

                    seedStore.performPow.restore();
                    storeAndBroadcast.restore();
                });
            });
        });

        describe('when any transaction object has an invalid hash', () => {
            it('should perform proof of work', () => {
                sinon.stub(seedStore, 'performPow').resolves({
                    trytes: trytes.value,
                    transactionObjects: transactionObjects.slice().reverse(),
                });

                const storeAndBroadcast = sinon.stub(iota.api, 'storeAndBroadcast').yields(null, []);
                const getTransactionToApprove = sinon.stub(iota.api, 'getTransactionsToApprove').yields(null, {
                    trunkTransaction: 'R'.repeat(81),
                    branchTransaction: 'A'.repeat(81),
                });

                return retryFailedTransaction()(
                    map(
                        transactionObjects,
                        (tx, idx) => (idx % 2 === 0 ? tx : Object.assign({}, tx, { hash: 'U'.repeat(81) })),
                    ),
                    seedStore,
                ).then(() => {
                    expect(seedStore.performPow.callCount).to.equal(1);

                    seedStore.performPow.restore();
                    storeAndBroadcast.restore();
                    getTransactionToApprove.restore();
                });
            });
        });

        describe('when any transaction object has an empty hash', () => {
            it('should perform proof of work', () => {
                sinon.stub(seedStore, 'performPow').resolves({
                    trytes: trytes.value,
                    transactionObjects: transactionObjects.slice().reverse(),
                });

                const storeAndBroadcast = sinon.stub(iota.api, 'storeAndBroadcast').yields(null, []);
                const getTransactionToApprove = sinon.stub(iota.api, 'getTransactionsToApprove').yields(null, {
                    trunkTransaction: 'R'.repeat(81),
                    branchTransaction: 'A'.repeat(81),
                });

                return retryFailedTransaction()(
                    map(
                        transactionObjects,
                        (tx, idx) => (idx % 2 === 0 ? tx : Object.assign({}, tx, { hash: EMPTY_HASH_TRYTES })),
                    ),
                    seedStore,
                ).then(() => {
                    expect(seedStore.performPow.callCount).to.equal(1);

                    seedStore.performPow.restore();
                    storeAndBroadcast.restore();
                    getTransactionToApprove.restore();
                });
            });
        });
    });

    describe('#sortTransactionTrytesArray', () => {
        it('should sort transaction trytes in ascending order', () => {
            // trytes.value is is ordered as descending by default
            const result = sortTransactionTrytesArray(trytes.value, 'currentIndex', 'asc');

            expect(result).to.not.eql(trytes.value);
            expect(result).to.eql(trytes.value.slice().reverse());
            expect(iota.utils.transactionObject(result[0], EMPTY_TRANSACTION_TRYTES).currentIndex).to.equal(0);
        });

        it('should sort transaction trytes in descending order', () => {
            const result = sortTransactionTrytesArray(trytes.value.slice().reverse());

            expect(result).to.eql(trytes.value);
            expect(iota.utils.transactionObject(result[0], EMPTY_TRANSACTION_TRYTES).currentIndex).to.equal(3);
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
                    const {
                        LATEST_MILESTONE,
                        LATEST_SOLID_SUBTANGLE_MILESTONE,
                        LATEST_MILESTONE_INDEX,
                        LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                    } = mockTransactions;

                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                        filteringScope: () => true,
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const resultMap = {
                                getBalances: { balances: ['3'] },
                                getNodeInfo: {
                                    appVersion: '1',
                                    latestMilestone: LATEST_MILESTONE,
                                    latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                                    latestMilestoneIndex: LATEST_MILESTONE_INDEX,
                                    latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                                },
                                getTrytes: {
                                    trytes: includes(body.hashes, LATEST_MILESTONE)
                                        ? [trytes.milestone]
                                        : map(body.hashes, () => EMPTY_TRANSACTION_TRYTES),
                                },
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
                    const {
                        LATEST_MILESTONE,
                        LATEST_SOLID_SUBTANGLE_MILESTONE,
                        LATEST_MILESTONE_INDEX,
                        LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                    } = mockTransactions;

                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                        filteringScope: () => true,
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const resultMap = {
                                getBalances: { balances: ['10'] },
                                getNodeInfo: {
                                    appVersion: '1',
                                    latestMilestone: LATEST_MILESTONE,
                                    latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                                    latestMilestoneIndex: LATEST_MILESTONE_INDEX,
                                    latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                                },
                                getTrytes: {
                                    trytes: includes(body.hashes, LATEST_MILESTONE)
                                        ? [trytes.milestone]
                                        : map(body.hashes, () => EMPTY_TRANSACTION_TRYTES),
                                },
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
                    const {
                        LATEST_MILESTONE,
                        LATEST_SOLID_SUBTANGLE_MILESTONE,
                        LATEST_MILESTONE_INDEX,
                        LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                    } = mockTransactions;

                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                        filteringScope: () => true,
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const resultMap = {
                                getBalances: { balances: ['20'] },
                                getNodeInfo: {
                                    appVersion: '1',
                                    latestMilestone: LATEST_MILESTONE,
                                    latestSolidSubtangleMilestone: LATEST_SOLID_SUBTANGLE_MILESTONE,
                                    latestMilestoneIndex: LATEST_MILESTONE_INDEX,
                                    latestSolidSubtangleMilestoneIndex: LATEST_SOLID_SUBTANGLE_MILESTONE_INDEX,
                                },
                                getTrytes: {
                                    trytes: includes(body.hashes, LATEST_MILESTONE)
                                        ? [trytes.milestone]
                                        : map(body.hashes, () => EMPTY_TRANSACTION_TRYTES),
                                },
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
        describe('when transactions provided (passed as first param) is empty', () => {
            it('should return an empty object', () => {
                const result = categoriseInclusionStatesByBundleHash([], [false, false]);
                expect(result).to.eql({});
            });
        });

        describe('when transactions provided (passed as first param) is not empty', () => {
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
