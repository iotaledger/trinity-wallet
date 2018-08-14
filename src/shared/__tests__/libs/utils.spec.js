import { expect } from 'chai';
import nock from 'nock';
import { isValidUrl, isValidHttpsUrl, rearrangeObjectKeys } from '../../libs/utils';
import { findTransactionsAsync } from '../../libs/iota/extendedApi';

const getBalances = () => findTransactionsAsync({ addresses: ['A'.repeat(81)]});

describe('libs: utils', () => {
    describe('#isValidUrl', () => {
        describe('when an invalid URL is passed', () => {
            it('should return false', () => {
                const invalidURL = 'http://exam ple.com';
                expect(isValidUrl(invalidURL)).to.equal(false);
            });
        });
        describe('when a valid URL is passed', () => {
            it('should return true', () => {
                const validURL = 'http://example.com';
                expect(isValidUrl(validURL)).to.equal(true);
            });
        });
    });

    describe('#isValidHttpsUrl', () => {
        describe('when a valid HTTP URL is passed', () => {
            it('should return false', () => {
                const httpURL = 'http://example.com';
                expect(isValidHttpsUrl(httpURL)).to.equal(false);
            });
        });
        describe('when a valid HTTPS URL is passed', () => {
            it('should return true', () => {
                const httpsURL = 'https://example.com';
                expect(isValidHttpsUrl(httpsURL)).to.equal(true);
            });
        });
    });

    describe('#rearrangeObjectKeys', () => {
        describe('when second argument passed is not a property in object passed as first argument', () => {
            it('should not rearrange object keys', () => {
                const object = {
                    foo: [],
                    baz: [],
                    bar: [],
                };

                const keysBeforeRearrange = Object.keys(object);

                const result = rearrangeObjectKeys(object, 'iota');
                expect(Object.keys(result)).to.eql(keysBeforeRearrange);
            });
        });

        describe('when second argument passed is a property in object passed as first argument', () => {
            it('should add second argument prop as the last key in object keys', () => {
                const object = {
                    foo: [],
                    baz: [],
                    bar: [],
                };

                const expectedObjectKeys = ['baz', 'bar', 'foo'];

                const keysBeforeRearrange = Object.keys(object);

                const result = rearrangeObjectKeys(object, 'foo');
                const keysAfterRearrange = Object.keys(result);

                expect(keysAfterRearrange).to.not.eql(keysBeforeRearrange);
                expect(keysAfterRearrange).to.eql(expectedObjectKeys);
            });
        });
    });

    describe.only('#test', () => {
        before(() => {
           const mocked = nock('http://localhost:24265', {
               reqheaders: {
                   'Content-Type': 'application/json',
                   'X-IOTA-API-Version': '1',
               },
           }).persist()
               .post('/', {
                   command: 'findTransactions',
                   addresses: ['A'.repeat(81)],
               })
               .reply(200, { hashes: ['H'.repeat(81)] });

        });
        it('should', () => {
            return getBalances().then(console.log).catch(console.log)
        });
    });
});
