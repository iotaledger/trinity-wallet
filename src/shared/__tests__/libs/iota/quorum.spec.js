import { expect } from 'chai';
import sinon from 'sinon';
import { findSyncedNodes, fallbackToSafeResult, determineQuorumResult } from '../../../libs/iota/quorum';
import * as extendedApis from '../../../libs/iota/extendedApi';
import { EMPTY_HASH_TRYTES } from '../../../libs/iota/utils';

describe('libs: iota/quorum', () => {
    describe('#determineQuorumResult', () => {
        describe('when method is wereAddressesSpentFrom', () => {
            describe('when frequency is greater than 67 percent', () => {
                it('should return most frequently occurring status', () => {
                    const args = [true, true, true, true, false, true, true];

                    const result = determineQuorumResult(args, args.length)('wereAddressesSpentFrom', 67);
                    expect(result).to.equal(true);
                });
            });

            describe('when frequency is less than 67 percent', () => {
                it('should return true as a fallback status', () => {
                    const args = [true, true, false, false, false, false, true];

                    const result = determineQuorumResult(args, args.length)('wereAddressesSpentFrom', 67);
                    expect(result).to.equal(true);
                });
            });
        });

        describe('when method is getInclusionStates', () => {
            describe('when frequency is greater than 67 percent', () => {
                it('should return most frequently occurring status', () => {
                    const args = [true, true, true, true, false, true, true];

                    const result = determineQuorumResult(args, args.length)('getInclusionStates', 67);
                    expect(result).to.equal(true);
                });
            });

            describe('when frequency is less than 67 percent', () => {
                it('should return false as a fallback status', () => {
                    const args = [true, true, false, false, false, false, true];

                    const result = determineQuorumResult(args, args.length)('getInclusionStates', 67);
                    expect(result).to.equal(false);
                });
            });
        });

        describe('when method is getBalances:balances', () => {
            describe('when frequency is greater than 67 percent', () => {
                it('should return most frequently occurring balance', () => {
                    const args = ['10', '10', '10', '10', '0', '10', '10'];

                    const result = determineQuorumResult(args, args.length)('getBalances:balances', 67);
                    expect(result).to.equal('10');
                });
            });

            describe('when frequency is less than 67 percent', () => {
                it('should return "0" as a fallback balance', () => {
                    const args = ['10', '10', '0', '0', '0', '0', '10'];

                    const result = determineQuorumResult(args, args.length)('getBalances:balances', 67);
                    expect(result).to.equal('0');
                });
            });
        });

        describe('when method is getNodeInfo:latestSolidSubtangleMilestone', () => {
            describe('when frequency is greater than 67 percent', () => {
                it('should return most frequently occurring latestSolidSubtangleMilestone', () => {
                    const correctHash = 'U'.repeat(81);
                    const incorrectHash = 'X'.repeat(81);

                    const args = [
                        correctHash,
                        correctHash,
                        correctHash,
                        correctHash,
                        incorrectHash,
                        correctHash,
                        correctHash,
                    ];

                    const result = determineQuorumResult(args, args.length)(
                        'getNodeInfo:latestSolidSubtangleMilestone',
                        67,
                    );
                    expect(result).to.equal(correctHash);
                });
            });

            describe('when frequency is less than 67 percent', () => {
                it(`should return ${EMPTY_HASH_TRYTES} as a fallback latestSolidSubtangleMilestone`, () => {
                    const correctHash = 'U'.repeat(81);
                    const incorrectHash = 'X'.repeat(81);

                    const args = [
                        correctHash,
                        correctHash,
                        incorrectHash,
                        incorrectHash,
                        incorrectHash,
                        incorrectHash,
                        correctHash,
                    ];

                    const result = determineQuorumResult(args, args.length)(
                        'getNodeInfo:latestSolidSubtangleMilestone',
                        67,
                    );
                    expect(result).to.equal(EMPTY_HASH_TRYTES);
                });
            });
        });
    });

    describe('#fallbackToSafeResult', () => {
        describe('when method is wereAddressesSpentFrom', () => {
            it('should return true', () => {
                expect(fallbackToSafeResult('wereAddressesSpentFrom')).to.equal(true);
            });
        });

        describe('when method is getInclusionStates', () => {
            it('should return false', () => {
                expect(fallbackToSafeResult('getInclusionStates')).to.equal(false);
            });
        });

        describe('when method is getBalances:balances', () => {
            it('should return "0"', () => {
                expect(fallbackToSafeResult('getBalances:balances')).to.equal('0');
            });
        });

        describe('when method is getNodeInfo:latestSolidSubtangleMilestone', () => {
            it(`should return ${EMPTY_HASH_TRYTES}`, () => {
                expect(fallbackToSafeResult('getNodeInfo:latestSolidSubtangleMilestone')).to.equal(EMPTY_HASH_TRYTES);
            });
        });

        describe('when method is not supported', () => {
            it('throw with an error "Method not supported for quorum."', () => {
                expect(fallbackToSafeResult.bind(null, 'foo')).to.throw('Method not supported for quorum.');
            });
        });
    });

    describe('#findSyncedNodes', () => {
        let nodes;

        before(() => {
            nodes = [
                'https://node.iotaner.org',
                'https://nodes.thetangle.one',
                'https://iota.moe',
                'https://tangle-nodes.org',
                'https://alpha.nodes.com',
                'https://node.iota.mausbeweger.de',
                'https://iota.saru.moe',
                'https://iotanode.lld.at',
                'https://iota.phibit.io',
                'https://whitey.org',
                'https://iota10.lld.at',
                'https://iota20.lld.at',
                'https://trin.fm',
                'https://iri.iota.fm',
                'https://nodes.iota.fm',
            ];
        });

        describe('when has no whitelisted nodes', () => {
            describe('when size of synced nodes is less than quorum size', () => {
                it('should throw with an error "Not enough synced nodes for quorum."', () => {
                    const blacklistedNodes = nodes.slice(0, nodes.length - 1);
                    const syncedNodes = nodes.slice(nodes.length - 1);

                    return findSyncedNodes(nodes, 7, syncedNodes, blacklistedNodes)
                        .then(() => {
                            throw new Error();
                        })
                        .catch((err) => expect(err.message).to.equal('Not enough synced nodes for quorum.'));
                });
            });

            describe('when size of synced nodes is not less than quorum size', () => {
                it('should not throw with an error "Not enough synced nodes for quorum."', () => {
                    const syncedNodes = nodes.slice(0, 7);
                    const blacklistedNodes = nodes.slice(7);

                    const stub = sinon.stub(extendedApis, 'isNodeHealthy').resolves(true);

                    return findSyncedNodes(nodes, 7, syncedNodes, blacklistedNodes).then((nodes) => {
                        expect(nodes).to.eql(syncedNodes);

                        stub.restore();
                    });
                });
            });
        });

        describe('when has whitelisted nodes', () => {
            describe('when size of synced nodes equals quorum size', () => {
                it('should recheck sync status of existing synced nodes', () => {
                    const syncedNodes = nodes.slice(0, 7);
                    const blacklistedNodes = nodes.slice(8);

                    const stub = sinon.stub(extendedApis, 'isNodeHealthy').resolves(true);

                    return findSyncedNodes(nodes, 7, syncedNodes, blacklistedNodes).then((newSyncedNodes) => {
                        expect(newSyncedNodes).to.eql(syncedNodes);

                        newSyncedNodes.forEach((node) => expect(stub.calledWith(node)).to.equal(true));

                        // Also assert that it was never called with any blacklisted node
                        blacklistedNodes.forEach((node) => expect(stub.calledWith(node)).to.equal(false));

                        stub.restore();
                    });
                });
            });

            describe('when size of synced nodes is less than quorum size', () => {
                it('should check sync status of (size(syncedNodes) - quorumSize) whitelisted nodes', () => {
                    const syncedNodes = nodes.slice(0, 6);
                    const blacklistedNodes = nodes.slice(7);
                    const whitelistedNodes = nodes.slice(6, 7);

                    const stub = sinon.stub(extendedApis, 'isNodeHealthy').resolves(true);

                    return findSyncedNodes(nodes, 7, syncedNodes, blacklistedNodes).then((newSyncedNodes) => {
                        expect(newSyncedNodes).to.eql([...syncedNodes, ...whitelistedNodes]);

                        // Check that existing synced nodes were never rechecked for sync status
                        syncedNodes.forEach((node) => expect(stub.calledWith(node)).to.equal(false));

                        // Also assert that it was never called with any blacklisted node
                        blacklistedNodes.forEach((node) => expect(stub.calledWith(node)).to.equal(false));

                        stub.restore();
                    });
                });
            });
        });
    });
});
