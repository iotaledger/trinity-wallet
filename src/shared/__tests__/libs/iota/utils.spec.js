import map from 'lodash/map';
import sinon from 'sinon';
import { expect } from 'chai';
import * as extendedApis from '../../../libs/iota/extendedApi';
import {
    convertFromTrytes,
    getRandomNodes,
    withRetriesOnDifferentNodes,
    throwIfNodeNotHealthy,
    isLastTritZero,
    getChecksum,
    parseDeepLink,
} from '../../../libs/iota/utils';
import { latestAddressWithoutChecksum, latestAddressChecksum } from '../../__samples__/addresses';
import { trytesToTrits, tritsToChars } from '../../../libs/iota/converter';

describe('libs: iota/utils', () => {
    describe('#isLastTritZero', () => {
        describe('when the last trit is 0', () => {
            it('should return true', () => {
                expect(isLastTritZero('D'.repeat(81))).to.equal(true);
            });
        });
        describe('when the last trit is not 0', () => {
            it('should return false', () => {
                expect(isLastTritZero('E'.repeat(81))).to.equal(false);
            });
        });
    });

    describe('#convertFromTrytes', () => {
        describe('when trytes passed as an argument contains all nines', () => {
            it('should return a string "Empty"', () => {
                const messageFragment = '9'.repeat(2187);
                expect(convertFromTrytes(messageFragment)).to.equal('Empty');
            });
        });

        describe('when conversion from trytes returns null', () => {
            it('should return a string "Empty"', () => {
                // fromTrytes would return null if the message length is odd
                // https://github.com/iotaledger/iota.lib.js/blob/master/lib/utils/asciiToTrytes.js#L74
                const messageFragment = `FOO${'9'.repeat(2184)}`;
                expect(convertFromTrytes(messageFragment)).to.equal('Empty');
            });
        });

        describe('when conversion from trytes returns a string with non-ascii characters', () => {
            it('should return a string "Empty"', () => {
                // iota.utils.fromTrytes returns non-ascii characters for these fragments
                const messageFragment =
                    'KGCSMUIHVSUAXNCVTARBBIWM9RRPVGYUPDXBZWIPIRCNV9ZTWPBGHPXVLYOFWGPQUJTXAEJIYJSBLPBUZCO9JVHDFIXXCWTEENJDO9HNWMNZCYMJUAMRIGWBKRJZKDWKKMTQCLCCHRTM9SXESGKPANDYNHGRSHE9GCZJZAFICSZOGFGDYHMJCHGR9W9FJHJG9TXXFKLLFBKSJEPZLPJQFHWWLYUCHT9EHRVRRESKOKHVJLXPBUZIJGCAXLNAXNBNAHGXPUNCOGRTZLVVSUGIBTKEFNXLIKQXKFWXWMCBAIM9NOBACGZLLILDNKWNDEJHGO9CCQVSNRWSRGPF9REHOOWNUMTCEUDHYGWDTPOPALFVJVNDBNDUHWDTUPKOZBU9CNSJNHPUNHSKPBIFRXQXYSDWEFYCORKUBDKEMKJONKSAFIWUSYGZOTKGZSUCYCOGQVJOHDHICRSMTNUQDKUUREHREBLAWPSFCMJCZCHOIUQQNQTAFBOCGWWUKTZKAAMSUTOZFKUIMRREYQEPGIYGNKAGMYPHEUZCWHBBUAKDFVCPWJCTBAFXLRWDJIZNPEDAPUYRHAEMDMDSU9UGCRPSNBMROSRKLTXNTADEGPKZNHRRFVFAFXBWCIDCCUAQSJFCRIKWEXRXNCNZRLEWA9PVVVOVCRPIJMVHS9GEFJRYRTPSWHYPBILTZGSUQRWFHSPNZOTSFVEPDULNXLTMAOHYEIHJAVMAHXANEGTITMQWGKPFJWODUFVEJSZYYCLMCJOGI9OJFGEWJCOCIQNPSZIBHQ9GMVQF9GVRSRKYUXKHZXGODLSENITEJHMAHD9XNWJZTWBOSNBCIBVXYKDFYPVIZTXPONSYCCHUFUONLTWHU9NBDOQA9QKMAOTICXCLIZAMUHZDQZNCDSQZLIWOOUVMPMF9KTOMOFAYHEIPMGTQYVG9ZGIXLXOBJNJYVSNZXDBQYH9CGOFYZEUYTWTBMSOILROMCAFQYSMLAKJENQLLTEHLVQLRITQVMGLYUWEGZJFLLOPWRJW9JIOHDCKQJILTPBOMZHTECEOMSVHUFJKSIXKAUXMZXIQZWOESGPA9NF99REQNJJPJYAORQKOOZMTEIFJXWYKK9AGMQEGBQHQVGIBLZWDVHOSXGWRTRHAGMF9DRAEWKBRRMYPD9SXQMQHZKXZMPEVHNBMRLD9SNQQMDEPEQTDHFDYLYMTTGYDFALYYCMKELVDQVRDAXXRVA9DWQMBPPMTZPBFWFUOUG9CAKAM9ICJHEZPXLNHRDNBIHHDDXWN9RIHT9STKDNYWPFHWXZFWZHZZMWXYOBZNOBXSJTKY9HWCTQOFSAVFCLOTUDJLZBOWJCVNEXXXMXGK9EPFDNCD9NOFFRPEWENMUZPKSCCHCDXSOSLO9KDKEKZMKQBEIEFHFE9XWF9OSSPTHOTI9SJNAFW99CEDPIYRFFFYWMNPTIKLNBPVU9EXNGLBPEFHGROLQASLYOKUEUKJVTHMGUJUUFUWMYJVGDAFSJEAYIBORELDBVVEPHFEMZCMDTVOHQ9PYISUYWEWOV9XZQPWXJQR9UCZHGV9YWVLQIYIXBISWWAWEZRLLPPZALXURMSEDOUATVTWTCKPVLCHTPW9ZZYSWDLHKZNLIFVQFLLRLQZFHKISVWDAMO9ZCVEHBAKIXQGCKUDMHZYCVSKEMPSCIEMZANPUGCOP9BAO9HPSPYSHXZOH9EHOALCFQDOAG9ECNAMRPILS9GESRFKARDWZWCNCLGXGBABDE9VRAI9ONFVDNMGHEPWWJCHUOVUADFONRUIHSYABPLLTAMRSTKGDEKGIUEFLBOTFJM9AHLDJT9TCJEVVDUPXPOAFSRRKGRJUIJMNLU9WFUTEUEJHKKL9WAEDRPHUBR9GGGFHDXGADBVTJYSUBGBIYZTFUMQERZJNLGKZTIWTGFFSSPHZTUOSRQBD9ETCCXQKQXPICJLQTVTHEWAWEAWACDONAFNOHXBOOP9VNPSHFDAMCALBZZNYYF9WIYIBGREYSLDPSKCQXRHECILTCVKFSPKZMGGJZABUDNBBZLVQHNKFLLFXTSUNWOVWQUPMEWORDIRDDCARYIBRLTOFHYHBG9CQOYMYCBZWZK9RVPSJLWZIHPLDNC9DHKNYGNQROMGLVFMXBJXRCGXBEEEFPKTCUYCXK9MVDTRFZZWYL9PSRE9';
                expect(convertFromTrytes(messageFragment)).to.equal('Empty');
            });
        });

        describe('when conversion from trytes does not return null', () => {
            it('should return a string converted from trytes', () => {
                const messageFragment = `CCACSBXBSBCCHC${'9'.repeat(2173)}`;
                expect(convertFromTrytes(messageFragment)).to.equal('TRINITY');
            });
        });
    });

    describe('#withRetriesOnDifferentNodes', () => {
        it('should return a function', () => {
            const returnValue = withRetriesOnDifferentNodes(['provider']);
            expect(typeof returnValue).to.equal('function');
        });

        it('should throw an error "No nodes are available to retry the request."', () => {
            const result = withRetriesOnDifferentNodes([]);

            return result(() => Promise.resolve())('foo').catch((err) => {
                expect(err.message).to.equal('No nodes are available to retry the request.');
            });
        });

        it('should throw if no promise gets resolved during retry', () => {
            const stub = sinon.stub();
            stub.onCall(0).rejects();
            stub.onCall(1).rejects();
            stub.onCall(2).rejects();

            const result = withRetriesOnDifferentNodes(
                Array(3)
                    .fill()
                    .map((_, index) => index),
            );

            return result(() => stub)('foo').catch(() => {
                expect(stub.calledThrice).to.equal(true);
            });
        });

        it('should not throw if any promise gets resolved during retry', () => {
            const stub = sinon.stub();
            stub.onCall(0).rejects();
            stub.onCall(1).resolves();
            stub.onCall(2).rejects();

            const result = withRetriesOnDifferentNodes(
                Array(3)
                    .fill()
                    .map((_, index) => index),
            );

            return result(() => stub)('foo').then(() => {
                expect(stub.calledTwice).to.equal(true);
            });
        });

        it('should trigger callback on each failure if callback is passed as an array of functions', () => {
            const stub = sinon.stub();

            const nodes = Array(3)
                .fill()
                .map((_, index) => index);
            const result = withRetriesOnDifferentNodes(
                nodes,
                map(nodes, () => stub),
            );

            return result(() => () => Promise.reject())('foo').catch(() => {
                expect(stub.calledThrice).to.equal(true);
            });
        });

        it('should trigger callback once if callback is passed as a function', () => {
            const stub = sinon.stub();

            const nodes = Array(3)
                .fill()
                .map((_, index) => index);
            const result = withRetriesOnDifferentNodes(nodes, stub);

            return result(() => () => Promise.reject())('foo').catch(() => {
                expect(stub.calledOnce).to.equal(true);
            });
        });
    });

    describe('#getRandomNodes', () => {
        let nodes;
        let size;
        before(() => {
            nodes = Array(6)
                .fill()
                .map((_, index) => index);
            size = 3;
        });

        it('should not choose blacklisted nodes', () => {
            const blacklisted = [3, 5];
            const result = getRandomNodes(nodes, size, blacklisted);

            expect(result).to.not.include([3, 5]);
        });
    });

    describe('#throwIfNodeNotHealthy', () => {
        describe('when node is synced', () => {
            it('should return true', () => {
                const stub = sinon.stub(extendedApis, 'isNodeHealthy').resolves(true);

                return throwIfNodeNotHealthy('foo').then((isSynced) => {
                    expect(isSynced).to.equal(true);
                    stub.restore();
                });
            });
        });

        describe('when node is not synced', () => {
            it('should return throw an error with message "The selected node is out of sync. Its view of the Tangle may be innacurate."', () => {
                const stub = sinon.stub(extendedApis, 'isNodeHealthy').resolves(false);

                return throwIfNodeNotHealthy('foo')
                    .then(() => {
                        throw new Error();
                    })
                    .catch((error) => {
                        expect(error.message).to.equal(
                            'The selected node is out of sync. Its view of the Tangle may be innacurate.',
                        );
                        stub.restore();
                    });
            });
        });
    });

    describe('#getSeedChecksum', () => {
        describe('when seed is in trytes', () => {
            describe('when length is provided', () => {
                it('should return checksum in trytes with provided length', () => {
                    const checksum = getChecksum(latestAddressWithoutChecksum, 9);

                    expect(checksum).to.equal(latestAddressChecksum);
                });
            });

            describe('when length is not provided', () => {
                it('should return checksum in trytes with default length', () => {
                    const checksum = getChecksum(latestAddressWithoutChecksum);

                    expect(checksum).to.equal(latestAddressChecksum.slice(-3));
                });
            });
        });

        describe('when seed is in trits', () => {
            describe('when length is provided', () => {
                it('should return checksum in trits with provided length', () => {
                    const checksum = getChecksum(trytesToTrits(latestAddressWithoutChecksum), 27);

                    expect(tritsToChars(checksum)).to.eql(latestAddressChecksum);
                });
            });

            describe('when length is not provided', () => {
                it('should return checksum in trits with default length', () => {
                    const checksum = getChecksum(trytesToTrits(latestAddressWithoutChecksum));

                    expect(tritsToChars(checksum)).to.equal(latestAddressChecksum.slice(-3));
                });
            });
        });
    });

    describe('#parseDeepLink', () => {
        describe('when only an address is in the deep link', () => {
            it('should return a parsed URL with the given address, an empty message, and an amount of 0', () => {
                const deepLink =
                    'iota://XNGPUCURQLLJFGXNDCMROGYNWAZP9AFWSVEUAIWIESOSPYDUPWSPSREEBWJPD9ZWZPAJKBHPLG99DJWJCZUHWTQTDD';
                const expectedParsedURL = {
                    address:
                        'XNGPUCURQLLJFGXNDCMROGYNWAZP9AFWSVEUAIWIESOSPYDUPWSPSREEBWJPD9ZWZPAJKBHPLG99DJWJCZUHWTQTDD',
                    message: '',
                    amount: '0',
                };
                expect(parseDeepLink(deepLink)).to.eql(expectedParsedURL);
            });
        });

        describe('when only an address and an amount are in the deep link', () => {
            it('should return a parsed URL with the given address, empty message, and given amount', () => {
                const deepLink =
                    'iota://XNGPUCURQLLJFGXNDCMROGYNWAZP9AFWSVEUAIWIESOSPYDUPWSPSREEBWJPD9ZWZPAJKBHPLG99DJWJCZUHWTQTDD/?amount=1000000';
                const expectedParsedURL = {
                    address:
                        'XNGPUCURQLLJFGXNDCMROGYNWAZP9AFWSVEUAIWIESOSPYDUPWSPSREEBWJPD9ZWZPAJKBHPLG99DJWJCZUHWTQTDD',
                    message: '',
                    amount: '1000000',
                };
                expect(parseDeepLink(deepLink)).to.eql(expectedParsedURL);
            });
        });

        describe('when only an address and a message are in the deep link', () => {
            it('should return a parsed URL with the given address and message and amount of 0', () => {
                const deepLink =
                    'iota://XNGPUCURQLLJFGXNDCMROGYNWAZP9AFWSVEUAIWIESOSPYDUPWSPSREEBWJPD9ZWZPAJKBHPLG99DJWJCZUHWTQTDD/?message=hello';
                const expectedParsedURL = {
                    address:
                        'XNGPUCURQLLJFGXNDCMROGYNWAZP9AFWSVEUAIWIESOSPYDUPWSPSREEBWJPD9ZWZPAJKBHPLG99DJWJCZUHWTQTDD',
                    message: 'hello',
                    amount: '0',
                };
                expect(parseDeepLink(deepLink)).to.eql(expectedParsedURL);
            });
        });

        describe('when an address, message, a amount are in the deep link', () => {
            it('should return a parsed URL with the given address, message, and amount', () => {
                const deepLink =
                    'iota://XNGPUCURQLLJFGXNDCMROGYNWAZP9AFWSVEUAIWIESOSPYDUPWSPSREEBWJPD9ZWZPAJKBHPLG99DJWJCZUHWTQTDD/?amount=1000000&message=hello';
                const expectedParsedURL = {
                    address:
                        'XNGPUCURQLLJFGXNDCMROGYNWAZP9AFWSVEUAIWIESOSPYDUPWSPSREEBWJPD9ZWZPAJKBHPLG99DJWJCZUHWTQTDD',
                    message: 'hello',
                    amount: '1000000',
                };
                expect(parseDeepLink(deepLink)).to.eql(expectedParsedURL);
            });
        });
    });
});
