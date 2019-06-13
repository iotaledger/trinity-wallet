import merge from 'lodash/merge';
import { expect } from 'chai';
import {
    getNodesFromState,
    getSelectedNodeFromState,
    getSeedIndexFromState,
    getThemeNameFromState,
    getThemeFromState,
    getCustomNodesFromState,
    nodesConfigurationFactory,
} from '../../selectors/global';
import Themes from '../../themes/themes';
import { DEFAULT_NODE } from '../../config';

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
                expect(getSelectedNodeFromState({ settings: {} })).to.eql(DEFAULT_NODE);
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

    describe('#nodesConfigurationFactory', () => {
        let state;

        beforeEach(() => {
            state = {
                settings: {
                    customNodes: [
                        {
                            url: 'https://custom-01',
                            pow: false,
                        },
                        {
                            url: 'https://custom-02',
                            pow: false,
                        },
                    ],
                    nodes: [
                        {
                            url: 'https://node-01',
                            pow: true,
                        },
                        {
                            url: 'https://node-02',
                            pow: false,
                        },
                    ],
                    autoNodeList: false,
                    node: 'https://node-01',
                    nodeAutoSwitch: false,
                    quorum: {
                        size: 4,
                        enabled: false,
                    },
                },
            };
        });

        describe('when "overrides" param is undefined', () => {
            describe('when settings.autoNodeList is false', () => {
                it('should return a config object with prop "nodes" containing only custom nodes', () => {
                    const config = nodesConfigurationFactory()(state);

                    const expectedNodes = [
                        {
                            url: 'https://custom-01',
                            pow: false,
                        },
                        {
                            url: 'https://custom-02',
                            pow: false,
                        },
                    ];

                    expect(config.nodes).to.eql(expectedNodes);
                });
            });

            describe('when settings.autoNodeList is true', () => {
                it('should return a config object with prop "nodes" containing both nodes & custom nodes', () => {
                    const config = nodesConfigurationFactory()(
                        merge({}, state, {
                            settings: {
                                autoNodeList: true,
                            },
                        }),
                    );

                    const expectedNodes = [
                        {
                            url: 'https://node-01',
                            pow: true,
                        },
                        {
                            url: 'https://node-02',
                            pow: false,
                        },
                        {
                            url: 'https://custom-01',
                            pow: false,
                        },
                        {
                            url: 'https://custom-02',
                            pow: false,
                        },
                    ];

                    expect(config.nodes).to.eql(expectedNodes);
                });
            });
        });

        describe('when "overrides" param is defined', () => {
            describe('when override.quorum exists', () => {
                describe('when state.settings.quorum.enabled is true', () => {
                    it('should override quorum config', () => {
                        const config = nodesConfigurationFactory({ quorum: false })(
                            merge({}, state, {
                                settings: {
                                    quorum: {
                                        enabled: true,
                                    },
                                },
                            }),
                        );

                        const expectedQuorumConfig = {
                            enabled: false,
                            size: 4,
                        };

                        expect(config.quorum).to.eql(expectedQuorumConfig);
                    });
                });

                describe('when state.settings.quorum.enabled is false', () => {
                    it('should not override quorum config', () => {
                        const config = nodesConfigurationFactory({ quorum: true })(state);

                        const expectedQuorumConfig = {
                            enabled: false,
                            size: 4,
                        };

                        expect(config.quorum).to.eql(expectedQuorumConfig);
                    });
                });
            });
        });
    });
});
