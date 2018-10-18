import { expect } from 'chai';
import { getNodesFromState, getSelectedNodeFromState, getSeedIndexFromState } from '../../selectors/global';
import { defaultNode as DEFAULT_NODE } from '../../config';

describe('selectors: global', () => {
    describe('#getNodesFromState', () => {
        let state;

        beforeEach(() => {
            state = {
                settings: {
                    nodes: ['foo', 'baz'],
                },
            };
        });

        describe('when "nodes" prop is defined in settings reducer', () => {
            it('should return "nodes" prop', () => {
                expect(getNodesFromState(state)).to.eql(['foo', 'baz']);
            });
        });

        describe('when "nodes" prop is undefined in settings reducer', () => {
            it('should return an empty array', () => {
                expect(getNodesFromState({ settings: {} })).to.eql([]);
            });
        });
    });

    describe('#getSelectedNodeFromState', () => {
        let state;

        beforeEach(() => {
            state = {
                settings: {
                    node: 'foo',
                },
            };
        });

        describe('when "node" prop is defined in settings reducer', () => {
            it('should return "node" prop', () => {
                expect(getSelectedNodeFromState(state)).to.equal('foo');
            });
        });

        describe('when "nodes" prop is undefined in settings reducer', () => {
            it('should return wallet default node', () => {
                expect(getSelectedNodeFromState({ settings: {} })).to.equal(DEFAULT_NODE);
            });
        });
    });

    describe('#getSeedIndexFromState', () => {
        describe('when "seedIndex" prop is not defined as a nested prop under "wallet" prop in argument', () => {
            it('should return 0', () => {
                expect(getSeedIndexFromState({ wallet: { notSeedIndex: 4 } })).to.equal(0);
            });
        });

        describe('when "seedIndex" prop is defined as a nested prop under "wallet" prop in argument', () => {
            it('should return value for "seedIndex" prop', () => {
                expect(getSeedIndexFromState({ wallet: { seedIndex: 3 } })).to.equal(3);
            });
        });
    });
});
