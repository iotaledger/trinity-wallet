import { expect } from 'chai';
import { getLabelFromLocale, getLocaleFromLabel, detectLocale } from '../../libs/i18n';

describe('libs: i18n', () => {
    describe('#getLabelFromLocale', () => {
        describe('when a supported locale code is passed', () => {
            it('should return the correct label', () => {
                const locale = 'de';
                expect(getLabelFromLocale(locale)).to.equal('Deutsch - German');
            });
        });

        describe('when an unsupported locale is passed', () => {
            it('should return "English (International)"', () => {
                const locale = 'foo';
                expect(getLabelFromLocale(locale)).to.equal('English (International)');
            });
        });
    });

    describe('#getLocaleFromLabel', () => {
        describe('when a locale label is passed', () => {
            it('should return the correct locale code', () => {
                const label = 'Deutsch - German';
                expect(getLocaleFromLabel(label)).to.equal('de');
            });
        });
    });

    describe('#detectLocale', () => {
        describe('when a 2-character locale code is passed', () => {
            it('should return the same locale code', () => {
                const locale = 'de';
                expect(detectLocale(locale)).to.equal('de');
            });
        });

        describe('when a country specific locale code is passed', () => {
            it('should return a 2-character locale code for languages with 1 supported dialect', () => {
                const locale = 'de_DE';
                expect(detectLocale(locale)).to.equal('de');
            });

            it('should return the appropriate dialect for languages with more than 1 supported dialect', () => {
                const locale = 'es_MX';
                expect(detectLocale(locale)).to.equal('es_LA');
            });

            it('should return the appropriate locale for languages with more than 1 character set', () => {
                const locale = 'zh_Hant_TW';
                expect(detectLocale(locale)).to.equal('zh_TW');
            });
        });
    });
});
