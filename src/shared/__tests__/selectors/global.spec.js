import { expect } from 'chai';
import {
    getNodesFromState,
    getSelectedNodeFromState,
    getSeedIndexFromState,
    getThemeNameFromState,
    getThemeFromState,
    getCustomNodesFromState,
} from '../../selectors/global';
import Themes from '../../themes/themes';
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

    describe('#getThemeNameFromState', () => {
        it('should return "themeName" prop from settings reducer', () => {
            expect(getThemeNameFromState({ settings: { themeName: 'Mint' } })).to.equal('Mint');
        });
    });

    describe('#getThemeFromState', () => {
        describe('when active theme name is valid', () => {
            it('should return active theme object', () => {
                Object.keys(Themes).forEach((themeName) => {
                    expect(getThemeFromState({ settings: { themeName } })).to.eql(Themes[themeName]);
                });
            });
        });

        describe('when active theme name is invalid', () => {
            it('should return theme object for "Default" theme', () => {
                const theme = getThemeFromState({ settings: { themeName: 'invalid-theme' } });

                expect(theme).to.eql(Themes.Default);
            });
        });
    });

    describe('#getCustomNodesFromState', () => {
        let state;

        beforeEach(() => {
            state = {
                settings: {
                    customNodes: ['foo', 'baz'],
                },
            };
        });

        describe('when "customNodes" prop is defined in settings reducer', () => {
            it('should return "customNodes" prop', () => {
                expect(getCustomNodesFromState(state)).to.eql(['foo', 'baz']);
            });
        });

        describe('when "customNodes" prop is undefined in settings reducer', () => {
            it('should return an empty array', () => {
                expect(getCustomNodesFromState({ settings: {} })).to.eql([]);
            });
        });
    });
});
