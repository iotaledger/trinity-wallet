import isEqual from 'lodash/isEqual';
import { expect } from 'chai';
import nock from 'nock';
import { getIotaInstance, isNodeHealthy, allowsRemotePow } from '../../../libs/iota/extendedApi';
import { iota } from '../../../libs/iota/index';
import { IRI_API_VERSION } from '../../../config';

describe('libs: iota/extendedApi', () => {
    describe('#getIotaInstance', () => {
        describe('when settings object { url, token?, password? } is passed as an argument', () => {
            it('should not return global iota instance', () => {
                const instance = getIotaInstance({ url: 'http://foo.baz' });
                expect(isEqual(instance, iota)).to.equal(false);
            });
        });

        describe('when settings object { url, token?, password? } is not passed as an argument', () => {
            it('should return global iota instance', () => {
                const instance = getIotaInstance();
                expect(isEqual(instance, iota)).to.equal(true);
            });
        });
    });

    describe('#isNodeHealthy', () => {
        describe('when node runs an unsupported release', () => {
            beforeEach(() => {
                nock('http://localhost:14265', {
                    reqheaders: {
                        'Content-Type': 'application/json',
                        'X-IOTA-API-Version': IRI_API_VERSION,
                    },
                })
                    .filteringRequestBody(() => '*')
                    .persist()
                    .post('/', '*')
                    .reply(200, (_, body) => {
                        const { command } = body;

                        const resultMap = {
                            getNodeInfo: {
                                appVersion: '0.5.0-RC2',
                                appName: 'HORNET',
                            },
                        };

                        return resultMap[command] || {};
                    });
            });

            afterEach(() => {
                nock.cleanAll();
            });

            it('should throw with an error "The currently selected node uses an unsupported IRI version."', () => {
                return isNodeHealthy()
                    .then(() => {
                        throw new Error();
                    })
                    .catch((error) =>
                        expect(error.message).to.equal('The currently selected node uses an unsupported IRI version.'),
                    );
            });
        });

        describe('when "isHealthy" property is defined in the nodeInfo response', () => {
            describe('when "isHealthy" is true', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const { command } = body;

                            const resultMap = {
                                getNodeInfo: {
                                    appVersion: '0.5.0',
                                    appName: 'HORNET',
                                    isHealthy: true,
                                },
                            };

                            return resultMap[command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true', () => {
                    return isNodeHealthy().then((result) => expect(result).to.equal(true));
                });
            });

            describe('when "isHealthy" is false', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const { command } = body;

                            const resultMap = {
                                getNodeInfo: {
                                    appVersion: '0.5.0',
                                    appName: 'HORNET',
                                    isHealthy: false,
                                },
                            };

                            return resultMap[command] || {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return false', () => {
                    return isNodeHealthy().then((result) => expect(result).to.equal(false));
                });
            });
        });
    });

    describe('#allowsRemotePow', () => {
        describe('when has updated IRI version (version that has "features" prop in nodeInfo)', () => {
            describe('when has listed "RemotePOW" as a feature', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const { command } = body;

                            if (command === 'getNodeInfo') {
                                return {
                                    features: ['RemotePOW', 'zeroMessageQueue'],
                                };
                            }

                            return {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return true', () => {
                    return allowsRemotePow('http://localhost:14265').then((res) => expect(res).to.equal(true));
                });
            });

            describe('when has not listed "RemotePOW" as a feature', () => {
                beforeEach(() => {
                    nock('http://localhost:14265', {
                        reqheaders: {
                            'Content-Type': 'application/json',
                            'X-IOTA-API-Version': IRI_API_VERSION,
                        },
                    })
                        .filteringRequestBody(() => '*')
                        .persist()
                        .post('/', '*')
                        .reply(200, (_, body) => {
                            const { command } = body;

                            if (command === 'getNodeInfo') {
                                return {
                                    features: ['zeroMessageQueue'],
                                };
                            }

                            return {};
                        });
                });

                afterEach(() => {
                    nock.cleanAll();
                });

                it('should return false', () => {
                    return allowsRemotePow('http://localhost:14265').then((res) => expect(res).to.equal(false));
                });
            });
        });
    });
});
