import find from 'lodash/find';
import keys from 'lodash/keys';
import isArray from 'lodash/isArray';
import isObject from 'lodash/isObject';
import omit from 'lodash/omit';
import map from 'lodash/map';
import { expect } from 'chai';
import sinon from 'sinon';
import {
    prepareTransferArray,
    extractTailTransferFromBundle,
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
} from '../../../libs/iota/transfers';
import { iota, SwitchingConfig } from '../../../libs/iota/index';
import trytes from '../../__samples__/trytes';
import * as mockTransactions from '../../__samples__/transactions';

describe('libs: iota/transfers', () => {
    before(() => {
        SwitchingConfig.autoSwitch = false;
    });

    after(() => {
        SwitchingConfig.autoSwitch = true;
    });

    describe('#prepareTransferArray', () => {
        it('should return an array', () => {
            const args = ['foo', 1, 'message', 'U'.repeat(81)];
            expect(Array.isArray(prepareTransferArray(...args))).to.equal(true);
        });

        it('should only have address, value, message and tag props in any element of the array', () => {
            const args = ['foo', 0, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            // Zero value transfers return two transfer objects
            ['address', 'value', 'message', 'tag'].forEach((item) => {
                expect(item in result[0]).to.equal(true);
                expect(item in result[1]).to.equal(true);
            });

            expect(Object.keys(result[0]).length).to.equal(4);
            expect(Object.keys(result[1]).length).to.equal(4);
        });

        it('should not have any other props other than address, value, message and tag props in any element of the array', () => {
            const args = ['foo', 0, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            ['foo', 'baz'].forEach((item) => {
                expect(item in result[0]).to.equal(false);
                expect(item in result[1]).to.equal(false); // Zero value transfers return two transfer objects
            });
        });

        it('should return two transfer objects if value passed as second argument is 0 and address does not equal first own address', () => {
            const args = ['A'.repeat(81), 0, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            expect(result.length).to.equal(2);
        });

        it('should return a single transfer object if value passed as second argument is not 0', () => {
            const args = ['foo', 1, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            expect(result.length).to.equal(1);
        });

        it('should return a single transfer object if value passed as second argument is 0 but first own address equals receive address', () => {
            const args = ['U'.repeat(81), 1, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            expect(result.length).to.equal(1);
        });

        it('should assign "firstOwnAddress" passed as fourth argument to second transfer object if value passed as second argument is 0 and address does not equal first own address', () => {
            const firstOwnAddress = 'U'.repeat(81);
            const args = ['foo', 0, 'message', firstOwnAddress];
            const result = prepareTransferArray(...args);

            expect(result[1].address).to.equal(firstOwnAddress);
        });
    });

    describe('#extractTailTransferFromBundle', () => {
        describe('when not passed a valid bundle', () => {
            it('should always return an object', () => {
                const args = [undefined, null, [], {}, 'foo', 0];

                args.forEach((arg) => {
                    const result = extractTailTransferFromBundle(arg);
                    expect(typeof result).to.equal('object');
                    expect(Array.isArray(result)).to.equal(false);
                    expect(result === null).to.equal(false);
                    expect(result === undefined).to.equal(false);
                });
            });
        });

        describe('when passed a valid bundle', () => {
            it('should return an object with currentIndex prop equals 0', () => {
                const bundle = Array.from(Array(5), (x, idx) => ({ currentIndex: idx }));

                expect(extractTailTransferFromBundle(bundle)).to.eql({ currentIndex: 0 });
            });

            it('should return an empty object if there is no item with prop currentIndex 0', () => {
                const bundle = Array.from(Array(5), (x, idx) => ({ currentIndex: idx + 1 }));

                expect(extractTailTransferFromBundle(bundle)).to.eql({});
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
        it('should return an object with "hash" prop', () => {
            expect(normaliseBundle(bundle, addresses, tailTransactions, false)).to.include.keys('hash');
        });

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
                    },
                    {
                        value: 0,
                        address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                        checksum: 'MCDWJFKKC',
                    },
                    {
                        value: 2201,
                        address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                        checksum: 'RYN9LQCEC',
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
                    },
                    {
                        value: 0,
                        address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                        checksum: 'MCDWJFKKC',
                    },
                    {
                        value: 2201,
                        address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                        checksum: 'RYN9LQCEC',
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
                    },
                    {
                        value: 2201,
                        address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                        checksum: 'RYN9LQCEC',
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
                    },
                ]);
            });
        });
    });

    describe('#performPow', () => {
        let powFn;
        let result;
        let trunkTransaction;
        let branchTransaction;

        before(() => {
            result = {
                trytes: [
                    '999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999QXSRSQRKI9ATVWYFKAQSSLJZBFEUUFRWXOVUEFCXQFBPKFIZLMLDXJQZJMUVGZFBNCRLZMUPOVHVDSRYCM99999999999999999999999999TRINITY99999999999999999999ZFVOGYD99C99999999C99999999ETSWPNLGYCNUGIYRCHUBBJQKGZ9NDHNPJKZLWDURHNBVHUKLKLDCBBLBQBWVBKLWOKFRTXUXIBPFWLKJWLLJWVVZFXF9ZGFSBSHPCD9HOIFBCLXGRV9XWSQDTGOMSRGQQIVFVZKHLKTJJVFMXQTZVPNRNAQEPA9999GSHUHUWAUUGQHHNAPRDPDJRKZFJNIAPFNTVAHZPUNDJWRHZSZASOERZURXZVEHN9OJVS9QNRGSJE99999TRINITY99999999999999999999999999999999999999999999999JGUV9A999999999999999999999',
                    'U9GQBLSLSHTGIIDWWANRFHAWGNOVHOSAWLXNBPOJVPSTQRBYILRDNSGRMIBUMNSATRSMPWGMPNVBSVFIBMEVYTPJDKLPRNPWQTUBGF9WENRKVTRMILEOEOSMU9KIBEEFQJNKYRNBGCCHIIOXGCTSSEV9AIYNMPBPQAWYAKUFKHSEBHPMWQZXD9ARRGTABMHCFJPNKUWHCYHFRPZTXZZTATKAYHXHNX9QKQXYBZSIZJLHAJRTJZDPTQYTCPHIZIQN9SIOFNQUCMD9MOLYONGALHDLNAITVZJAMTBDYWUS9HRGYZKGTEMTCGWHUMNIZJOUMLDXLWHBUFHQOZJDC9EMYULMLOCBPUSIL9JMLXVIEEVYOWUF9JZYEHAVPMW9TQINYJUFIRNKDUUSFHP9VIVRXTUHNNERZBLJDQXHCILJPUXIQMIMDGFWNMTSOUGKLYR9VVAHQ9HEU9KZYROHRLVLIRTGKRSYPMAEZRXIIZSZFORDLLUNWZTLYKDCJAXGJXTSYHMLEJJLSKSLKCHJWHOFFY9N9NMHN9CXLPLVPNZODSVEHVVHHXBQPKAHPSKKMZHKMAGDDJNRMQWETZREXYRCOXWLZXDZFOPV9UQFQRCDFTLDRAFNOTOLNWKOWXQQDRCGFLSZROMYBFQMXHZCLLAEIRFZXOZXWJQXBZQTI9QRQCNRQKEAWUPZWT9VERT99XPSZSEMMXMWMMLDRGOBXVXAXTK9BCYKGHWEHXOCUAZNIYTGWXMGLNWOKTKRZHFAYTWT9A9KPTKDDEUCLDNRKXOTL9MNJAR9TOENSJWRWQDPTX9XJRMNCXDINMWGWQZJVPBTZZIOMIPLMXOBBKMQGGEXQFEABUAFNPIWTCEFAOHVQWXEHYBD9BLNONFLZDDDQVVJ9AAZKLVROWWJEVEVZOUNXNPUUNYWWGERBWCMLRUNITOTGSBDVBAFFOZQKRSRAWEUNWACFSRWFDYAHSYHU9ILSWTSOHMYHSWPTJLAPOQDJHSBIMLBGGWFBBRTOWKTTDQEXBV9IVVZPFJKHYWWBGIMNZVMUAEZADZSQJVOMBSJIPBHYUFFVEOPOOSHPAOVNFBLCV9GTHJCHJQTODOIRVQXMPDCVEPHJQDIVAKFEXZIZJFBPXEKKZFOIBGJETGLQUPVFS9BPYGLVNJVCLSEOLVDCPNIUTMYIL9HOSPPUJKADRFQYDOUMVJAPK9LIESRGJAMTDSLQTZBNMZEYPOFRLODFKOLDHDMBUQRNKEIDPDUFVHAXL9EAKL9GWZBQHE9TPJOWNUVTGCFXY9CCXKALAEKJUY9GDCTABQRKIMJVQI9DQTYMQHU9QGFOFTBUOOYYIHEJXBMDWBSHVBD9P9SFAEGO9VLRROKRDCLXCPFMEJJLTWP9EZSTFALYEORFIGLNNYELMQNRGWEGIDWEXUVSWEZ99X9BRDCBWNBKBIHZTMVXMC9XJQTUCMBEJBGWJVRPXRIJSMCMWMZHGPRXJWEXPEKLBJEIELBUGJUMFEGITVRGCELLZMSW9HTDQINUIDZXF9F9PXSFTTOQXBWUEDAADVOG9EBZP9K9YR9YDDMQWIHEYAS9YBORRYSFSGNLCZSXONBQFTQXFWST9NWMRHORJJXNZLNMOJUQBYKVPAWUBZNLPDCFYFDFOERAPQUWTSUHHONLRLSEMPKDXFKVPAJXY99SRBRXCQJNCGSIULSDADBUVCOKT9UFFPJCXULUROLPNBRIIEOCWQN9YUPTANIDNOCAJGCFTBJBZWQIGVGWTDZTDZUCOYKXOFXFCQHHWHXCDLXRBQGFFJBVOXJVX9JJAOMBQYKCHXRFRUXIVJVRIAJVYQLIQJPMPMNLCRS9ZZAYKTFKEPJJECTMRVXLGJTWXLZBFYOOPYCZIUWYQERLGHYHNJS9UGABLUIRHLAV9KQWU9HJXKTHURDDZOCECNRAMLSSTLCHOQKTXPAJGNACFQZ9QNMTOFHFOSIBABBIBHYKMEDFAXDDDKFEGHCDVIBKOTBZEEEPYIJBUKEZBC9PSOTYVXKJMURDVAXATMWYLYECURREYBRXWWIFZJTIKSOYVUKFEGNJZSPSUEYVCUQADUNZZANBITAQCCTRDKIDZQJYFKVIFHFZOJDFABTDGMITXQKLWAFJNPZQCZCBBEOMDX9JJSDYXJKWKXPBFHSMCUQUCNIEKHUU9PKUJDRPWVLDZLZMBWYVAGJALLJEJVXUJIPITTHLEVW9EPOXYGRVCF9GRMSBTAUFGLXZCBFRMPQUK9JLVJNLVBW999999999999999999999999999TRINITY99999999999999999999PFVOGYD99B99999999C99999999ETSWPNLGYCNUGIYRCHUBBJQKGZ9NDHNPJKZLWDURHNBVHUKLKLDCBBLBQBWVBKLWOKFRTXUXIBPFWLKJWV9BHRBVUAPSNTCUSJAAROAQ9ZDIDT9VDYPK9QMUBAZVYXNYNHGLAIUEVCPFPTCBIV9LSQEFOKZGEVUAMALLJWVVZFXF9ZGFSBSHPCD9HOIFBCLXGRV9XWSQDTGOMSRGQQIVFVZKHLKTJJVFMXQTZVPNRNAQEPA9999TRINITY99999999999999999999999999999999999999999999999WINKB9999999999999999999999',
                    'FLGCSHCWL9XLZTYPY9CU9JOQBA9FPMUAWPID9NBPZKZOQDX9AMHIPQKF9COHLXXUSOSMDGIQDCSGCBEOXXMTYVGLLOKTNVFUCKNRABJNZFLTRVFGEUEDVHQYYBE9NLAE99FKMWGSZKJTROQGGUHGPEHVUBIMWFFMFAOJMTEKMAPSQQWIJIHBNAPGQTYQQMQFMFRNFFSVOLTETHZMPTPLXMJZRVZRLSKBPBVHKCAXYSSATXPKMR9DIUEDIDQBVFPOTGQMNSDGNGDEPAXXOTRTOEJUPZVSXPWYMJDH9OPYEBB9EBUDZENFHTESZWEQQAYNLPLCTXOKPKVFHQJYZESQTXEBUAQPHGXWUDSXGGVNIYUFVPEFCVYQTHDTQSEVWEIZEOTJFNWSIYGBCVRIIJTVDZJZSQISAQMECCMP9LGPPGRWXMXEYZGPAHYGSWGLYPGLRTGJIPD9XFQFSFCVTWAQXQS9KPHSDMMYQMWEECKTEPPXEKXILKRQFNUTQRDHBM9NFS99CBQJIJZXDWRXLIJBJ9PCNECVTSDDSPRQQDCZYZIBW9UFFBIGXUWCNUOQQLPWATAGLDSX9HSRH9LMXLDSKAVZH9RGGR9QHMDPVSCLRCFWTTIE9DIYMYPY9QDH9WY9CSKHIXRXS9SPBGCTHTZAPHQGJWGMQSKXPALSEWDUAHKNQBTVBOWMA9TEOOTYASXFZPGJHMLCIMBDPEAHAIFAMGLSDLGIKHKGLYA9VTXBAHLJEQCOZEZPYCZJRZLRIRLSU99WBFZAROQ99SAIDSWICDABZDJZYZDFDKCZSQAZVYOELVCHDHTNRJGSEUMWYKCBWXMBJEZQMZXLM9OERTSBVCJAK9MJXOVHNGROZTUQNJNCQ9DZAVCRTHAKUSXENTNSLIOCTJ9PKFPJXFPXIZVZITVLLFXWSMAYEGEVFOLDELKPKI99EPBEOMQBIMKUBVAKC9MFGITJENPAKGFMUKWHVKLNZRVKZVCQPXEEALPTFMJFLZZCGCNGKGWSJGASNJLHJOSMZSXYWBAZGSWHHHCLRAAE9JWBBJXFUI99ICSZRVIKGNLLQACITKYCMJFHKSGNJPJVUXFQLFYAGCXYDKPZSCOZG9YSKVSRNDYBZVRSVHF9O9AGGAVQRJXNZSQINAW9KNOYYIGFFSRA9UYQ9FPZWSQALFTWNEUWIHAUWGMZIITTNVWAZHRKILBOEQ9DM9XPZAJOFXZSFWJZLFHKBQ9ECCKTGZAOPLRCATTUZAEA9MJMLKOHVHJTYTKKVRRLFLNWURWNDBRQ9XRGXLQD99JXVMRYPTBLPEFBJQLTNRKLFXWNOEUHTERBKWTIIUHYOTH9JMESTL9ZDUTNIYABAKXHXCMZJZSVNHNPXDJZUYISMLITJHULDI9S9DLZRQTNMSOLIUQH9SGIBNUUDQDE9UNCZMRMNHSFXOCTIGEQJWPV9DBUFTJY9WVPYWLTBZJATXPUDDNIUDXKYBIZVILSECSMBDQUOSR9JRATHZOE9EVUJCBSRQZULAVMJYVA9OJHCBSQTVAZGW9LKPWFPZDASZKCVM9YYPEAYQ9FKZFQXLTFTLWUZXG9OVBWGAOQ99NDWZG9DRKGFLRTLNYUONLVNQCYNGTTYEGPT9RDREJNBAF99BCJGALIEIIHLZRIPUKGEEYXFISSZIYT9NYRBGOSAGYJIFQHABHSPEBONV9NWOQ9M9ZGHYPZZKRVDLZFP9ALXSHRTFABZLYLANYNXGIETITHQKZKFTBHKWBHYKJESRJYWMRSMNSQ9JOQIZCATS9LQFHMJHOGULRICGOOQGIHCREMCMNZXAEHPHY99JFLFNUGWDRRMIAODLRPTIQX9AATAPYR9IXFCWAZMDGLYLZPVCVDLPFFMLDGUIFEDARXFYGDFJZLYPQHASRTG9MEYHWRHJZUNFMMCJ9UZLELT9CSQHBMBBNCTISWXDSVTGKESDRGAPWKH9WEGHZNRXDNTEXVRYZWHJKMHLSVZONVINACDWQ9FLKGAINXTFIHHNGOXYBMCFVPIINNK9ZWTNNGRYG9BWTMTZGDGOKVKS9YDMSHWGADBYUMWLPCMTXRCUYB9QRGUQEJMEECECNYMBVGODJCYQ9PBUNNFJOYHGDHGNDEVKUBSIKOVYNMHNYKQFROJUFHBVRUZBUQSVBVTMYGBYPTVZUCZ9NVSVXGA9CRPWVLDZLZMBWYVAGJALLJEJVXUJIPITTHLEVW9EPOXYGRVCF9GRMSBTAUFGLXZCBFRMPQUK9JLVJNLVBWLZ9999999999999999999999999TRINITY99999999999999999999PFVOGYD99A99999999C99999999ETSWPNLGYCNUGIYRCHUBBJQKGZ9NDHNPJKZLWDURHNBVHUKLKLDCBBLBQBWVBKLWOKFRTXUXIBPFWLKJWWMB9NJNAGCPIRGCNGLCXDGWLQRCEPJMJQWWY9SKTKML9GAHDJAYVKCPWGEVHTAKVBNPDKYOYSTLM9DEPCLLJWVVZFXF9ZGFSBSHPCD9HOIFBCLXGRV9XWSQDTGOMSRGQQIVFVZKHLKTJJVFMXQTZVPNRNAQEPA9999TRINITY99999999999999999999999999999999999999999999999HXHDEA999999999999999999999',
                    'TEST99999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999999B99999999999999999999999999NSINITY99999999999999999999IAVOGYD99999999999C99999999ETSWPNLGYCNUGIYRCHUBBJQKGZ9NDHNPJKZLWDURHNBVHUKLKLDCBBLBQBWVBKLWOKFRTXUXIBPFWLKJWUHCLGLAYYPIQDOQTJFBTF9OKNBICATJZBIGVIPJYBTMSZTVRTYMIXOKQVVBYVOUFJUGYZMEBKUNKIDTRNLLJWVVZFXF9ZGFSBSHPCD9HOIFBCLXGRV9XWSQDTGOMSRGQQIVFVZKHLKTJJVFMXQTZVPNRNAQEPA9999TRINITY99999999999999999999999999999999999999999999999XRGPF9999999999999999999999',
                ],
                hashes: ['HASH#03', 'HASH#02', 'HASH#01', 'HASH#00'],
            };

            powFn = () => Promise.resolve(result);

            trunkTransaction = 'LLJWVVZFXF9ZGFSBSHPCD9HOIFBCLXGRV9XWSQDTGOMSRGQQIVFVZKHLKTJJVFMXQTZVPNRNAQEPA9999';
            branchTransaction = 'GSHUHUWAUUGQHHNAPRDPDJRKZFJNIAPFNTVAHZPUNDJWRHZSZASOERZURXZVEHN9OJVS9QNRGSJE99999';
        });

        it('should sort transaction objects in ascending order by currentIndex', () => {
            const fn = performPow(powFn, trytes.value, trunkTransaction, branchTransaction, 14);

            return fn.then(({ transactionObjects }) => {
                transactionObjects.map((tx, idx) => expect(tx.currentIndex).to.equal(idx));
            });
        });

        it('should throw with an error "Proof of work function is undefined." if powFn passed as first argument is not a function', () => {
            const fn = performPow(null, trytes.value, trunkTransaction, branchTransaction, 14);

            return fn.catch((error) => expect(error.message).to.equal('Proof of work function is undefined.'));
        });

        it('should assign hash to each corresponding transaction object', () => {
            const fn = performPow(powFn, trytes.value, trunkTransaction, branchTransaction, 14);

            return fn.then(({ transactionObjects }) => {
                expect(transactionObjects[0].hash).to.equal('HASH#00');
                expect(transactionObjects[1].hash).to.equal('HASH#01');
                expect(transactionObjects[2].hash).to.equal('HASH#02');
                expect(transactionObjects[3].hash).to.equal('HASH#03');
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

                const promise = filterInvalidPendingTransactions(transactions, {});

                return promise.then((transactions) => {
                    expect(transactions).to.eql([]);
                });
            });
        });

        describe('when there are incoming pending transfers', () => {
            it('should filter transaction if input addresses do not have enough balance', () => {
                const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['0'] });
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

                const promise = filterInvalidPendingTransactions(transactions, addressData);
                return promise.then((txs) => {
                    expect(txs).to.eql([]);
                    getBalances.restore();
                });
            });

            it('should not filter transaction if input addresses still have enough balance', () => {
                const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['10'] });
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

                const promise = filterInvalidPendingTransactions(transactions, addressData);
                return promise.then((txs) => {
                    expect(txs).to.eql(transactions);
                    getBalances.restore();
                });
            });
        });

        describe('when there are outgoing pending transfers', () => {
            it('should filter transaction if input addresses do not have enough balance', () => {
                const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['0'] });
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

                const promise = filterInvalidPendingTransactions(transactions, addressData);
                return promise.then((txs) => {
                    expect(txs).to.eql([]);
                    getBalances.restore();
                });
            });

            it('should not filter transaction if input addresses still have enough balance', () => {
                const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['10'] });
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

                const promise = filterInvalidPendingTransactions(transactions, addressData);
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
                return prepareForAutoPromotion([{ persistence: true }, { persistence: true }], {}, 'TEST').then(
                    (result) => expect(result).to.eql({}),
                );
            });
        });

        describe('when there are valid pending transfers', () => {
            it('should transform transfers by bundle', () => {
                const transactions = map(mockTransactions.normalizedBundles, (tx) => tx);
                const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['100'] });

                return prepareForAutoPromotion(
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
                const getBalances = sinon.stub(iota.api, 'getBalances').yields(null, { balances: ['0'] });

                return prepareForAutoPromotion(
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
});
