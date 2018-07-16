import { expect } from 'chai';
import { isValidUrl, isValidHttpsUrl } from '../../libs/utils';

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
});
