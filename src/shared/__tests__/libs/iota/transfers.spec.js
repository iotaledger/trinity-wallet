import find from 'lodash/find';
import keys from 'lodash/keys';
import { expect } from 'chai';
import {
    prepareTransferArray,
    extractTailTransferFromBundle,
    categorizeTransactionsByPersistence,
    getPendingTxTailsHashes,
    markTransfersConfirmed,
    hasNewTransfers,
    getHashesDiff,
    categorizeTransactions,
    normalizeBundle,
    mergeNewTransfers,
    categorizeBundleByInputsOutputs,
} from '../../../libs/iota/transfers';

describe('libs: iota/transfers', () => {
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

        it('should return two transfer objects if value passed as second argument is 0', () => {
            const args = ['foo', 0, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            expect(result.length).to.equal(2);
        });

        it('should return a single transfer object if value passed as second argument is not 0', () => {
            const args = ['foo', 1, 'message', 'U'.repeat(81)];
            const result = prepareTransferArray(...args);

            expect(result.length).to.equal(1);
        });

        it('should assign "firstOwnAddress" passed as fourth argument to second transfer object if value passed as second argument is 0', () => {
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

    describe('#categorizeTransactionsByPersistence', () => {
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
                expect(categorizeTransactionsByPersistence(...arg)).to.have.keys(['confirmed', 'unconfirmed']);
            });
        });

        it('should map all those transactions to "confirmed" prop array that have corresponding states true', () => {
            const transactions = [{ bundle: 'foo' }, { bundle: 'baz' }];

            const states = [true, false];

            expect(categorizeTransactionsByPersistence(transactions, states).confirmed).to.eql([{ bundle: 'foo' }]);
        });

        it('should map all those transactions to "unconfirmed" prop array that have corresponding states false', () => {
            const transactions = [{ bundle: 'foo' }, { bundle: 'baz' }];

            const states = [true, false];

            expect(categorizeTransactionsByPersistence(transactions, states).unconfirmed).to.eql([{ bundle: 'baz' }]);
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
                const normalizedTransfers = {
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

                expect(markTransfersConfirmed(normalizedTransfers, confirmedTransactionsHashes)).to.eql(result);
            });
        });
    });

    describe('#hasNewTransfers', () => {
        it('should return true if second argument size is greater than first argument size', () => {
            expect(hasNewTransfers([], [1])).to.equal(true);
        });

        it('should return false if second argument size is greater than first argument size', () => {
            expect(hasNewTransfers({}, { foo: 'bar' })).to.equal(false);
            expect(hasNewTransfers([], [])).to.equal(false);
            expect(hasNewTransfers([1], [])).to.equal(false);
            expect(hasNewTransfers(null, [])).to.equal(false);
            expect(hasNewTransfers(null, undefined)).to.equal(false);
            expect(hasNewTransfers(0, 10)).to.equal(false);
        });
    });

    describe('#getHashesDiff', () => {
        describe('when second argument size is not greater than first argument size', () => {
            let firstArgument;
            let secondArgument;

            beforeEach(() => {
                firstArgument = ['foo'];
                secondArgument = ['foo'];
            });

            describe('when fourth argument size is not greater than third argument size', () => {
                it('should return an empty array', () => {
                    expect(getHashesDiff(firstArgument, secondArgument, [], [])).to.eql([]);
                });
            });

            describe('when fourth argument size is greater than third argument size', () => {
                it('should return an array with difference of third and fourth arguments', () => {
                    expect(getHashesDiff(firstArgument, secondArgument, [], ['baz'])).to.eql(['baz']);
                });
            });
        });

        describe('when fourth argument size is not greater than third argument size', () => {
            let thirdArgument;
            let fourthArgument;

            beforeEach(() => {
                thirdArgument = ['foo'];
                fourthArgument = ['foo'];
            });

            describe('when second argument size is not greater than first argument size', () => {
                it('should return an empty array', () => {
                    expect(getHashesDiff([], [], thirdArgument, fourthArgument)).to.eql([]);
                });
            });

            describe('when second argument size is not greater than first argument size', () => {
                it('should return an array with difference of first and second arguments', () => {
                    expect(getHashesDiff([], ['baz'], thirdArgument, fourthArgument)).to.eql(['baz']);
                });
            });
        });

        describe('when second argument size is greater than first argument size', () => {
            let firstArgument;
            let secondArgument;

            beforeEach(() => {
                firstArgument = ['foo'];
                secondArgument = ['foo', 'foo', 'baz'];
            });

            describe('when fourth argument size is not greater than third argument size', () => {
                it('should return a unique array of difference between second and first argument', () => {
                    expect(getHashesDiff(firstArgument, secondArgument, [], [])).to.eql(['baz']);
                });
            });

            describe('when fourth argument size is greater than third argument size', () => {
                it('should return a unique array of difference between second and first argument and difference between fourth and third argument', () => {
                    expect(getHashesDiff(firstArgument, secondArgument, [], ['bar', 'bar'])).to.eql(['baz', 'bar']);
                });
            });
        });

        describe('when fourth argument size is greater than third argument size', () => {
            let thirdArgument;
            let fourthArgument;

            beforeEach(() => {
                thirdArgument = ['foo'];
                fourthArgument = ['foo', 'foo', 'baz'];
            });

            describe('when second argument size is not greater than first argument size', () => {
                it('should return a unique array of difference between fourth and third argument', () => {
                    expect(getHashesDiff([], [], thirdArgument, fourthArgument)).to.eql(['baz']);
                });
            });

            describe('when second argument size is greater than first argument size', () => {
                it('should return a unique array of difference between second and first argument and difference between fourth and third argument', () => {
                    expect(getHashesDiff([], ['bar'], thirdArgument, fourthArgument)).to.eql(['bar', 'baz']);
                });
            });
        });
    });

    describe('#categorizeTransactions', () => {
        it('should always return an object with props "incoming" and "outgoing"', () => {
            const args = [[undefined], [null], [], [{}], [''], [0], ['foo']];

            args.forEach((arg) => {
                expect(categorizeTransactions(...arg)).to.have.keys(['incoming', 'outgoing']);
            });
        });

        it('should categorize incoming transactions to "incoming" prop array', () => {
            const transactions = [{ incoming: true }, { incoming: false }, { incoming: false }];

            expect(categorizeTransactions(transactions).incoming).to.eql([{ incoming: true }]);
        });

        it('should categorize outgoing transactions to "outgoing" prop array', () => {
            const transactions = [{ incoming: true }, { incoming: false }];

            expect(categorizeTransactions(transactions).outgoing).to.eql([{ incoming: false }]);
        });
    });

    describe('#normalizeBundle', () => {
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
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('hash');
        });

        it('should return an object with "bundle" prop', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('bundle');
        });

        it('should return an object with "timestamp" prop', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('timestamp');
        });

        it('should return an object with "attachmentTimestamp" prop', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('attachmentTimestamp');
        });

        it('should return an object with "inputs" prop', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('inputs');
        });

        it('should return an object with "outputs" prop', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('inputs');
        });

        it('should return an object with "persistence" prop equalling fourth argument', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false).persistence).to.equal(false);
        });

        it('should return an object with "incoming" prop', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('incoming');
        });

        it('should return an object with "transferValue" prop', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('transferValue');
        });

        it('should return an object with "message" prop', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('transferValue');
        });

        it('should return an object with "tailTransactions" prop', () => {
            expect(normalizeBundle(bundle, addresses, tailTransactions, false)).to.include.keys('tailTransactions');
        });

        it('should only keep tail transactions of the same bundle', () => {
            const normalizedBundle = normalizeBundle(bundle, addresses, tailTransactions, false);

            const tailTransactionFromBundle = find(bundle, { currentIndex: 0 });
            normalizedBundle.tailTransactions.forEach((tailTransaction) =>
                expect(tailTransaction.hash).to.equal(tailTransactionFromBundle.hash),
            );
        });

        it('should only have "hash" and "attachmentTimestamp" props in each object of "tailTransactions" prop', () => {
            const normalizedBundle = normalizeBundle(bundle, addresses, tailTransactions, false);

            normalizedBundle.tailTransactions.forEach((tailTransaction) =>
                expect(keys(tailTransaction)).to.eql(['hash', 'attachmentTimestamp']),
            );
        });
    });

    describe('#mergeNewTransfers', () => {
        describe('when bundle hash of new normalized transfer exists in existing normalized transfers', () => {
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

        describe('when bundle hash of new normalized transfer does not exist in existing normalized transfers', () => {
            it('should assign new normalized transfer to the existing normalized transfers', () => {
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

    describe('#categorizeBundleByInputsOutputs', () => {
        let bundle;

        beforeEach(() => {
            bundle = [
                {
                    currentIndex: 0,
                    value: 1,
                    address: 'AWHJTOTMFXZUAVJAWHXULZJFTQNHYAIQHIDKOSTEMR9ZBHWFWDLIQYPHDKTVXYDJYRHKMXYLDUULJMMWW',
                },
                {
                    currentIndex: 1,
                    value: -2201,
                    address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                },
                {
                    currentIndex: 2,
                    value: 0,
                    address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                },
                {
                    currentIndex: 3,
                    value: 2201,
                    address: 'GEFNJWYGCACGXYEXAS999VIRYWLJSAQJNRTSTDNOKKR9SULNXGHPVHCHJQVMIKEVJNKMEQMYMFZUXZPGC',
                },
            ];
        });

        it('should categorize non-remainder transaction objects with negative value to "inputs"', () => {
            expect(categorizeBundleByInputsOutputs(bundle).inputs).to.eql([
                {
                    value: -2201,
                    address: 'JMJHGMMVBEOWEVMEUYFYWJGZK9ITVBZAIWXITUANTYYLAKSHYRCZBBN9ULEDLRYITFNQMAUPZP9WMLEHB',
                    checksum: 'MCDWJFKKC',
                },
            ]);
        });

        it('should categorize transaction objects with non-negative values to "outputs"', () => {
            expect(categorizeBundleByInputsOutputs(bundle).outputs).to.eql([
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
    });
});
