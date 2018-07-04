import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { I18N_LOCALE_LABELS, I18N_LOCALES } from 'libs/i18n';
import { translate } from 'react-i18next';
import Select from 'ui/components/input/Select';
import i18next from 'libs/i18next';
import { setLocale } from 'actions/settings';

/**
 * Interface locale selection component
 */
class LanguageSelect extends React.PureComponent {
    static propTypes = {
        /** Current locale */
        locale: PropTypes.string,
        /** Locale change event function
         * @param {string} locale - Target locale
         */
        setLocale: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    changeLocale = (locale) => {
        if (I18N_LOCALES.indexOf(locale) > -1) {
            this.props.setLocale(locale);
            i18next.changeLanguage(locale);
        }
    };

    render() {
        const { locale, t } = this.props;

        return (
            <Select
                label={t('languageSetup:language')}
                defaultValue={locale}
                onChange={(e) => this.changeLocale(e.target.value)}
            >
                {I18N_LOCALES.map((item, index) => (
                    <option key={item} value={item}>
                        {I18N_LOCALE_LABELS[index]}
                    </option>
                ))}
            </Select>
        );
    }
}

const mapStateToProps = (state) => ({
    locale: state.settings.locale,
});

const mapDispatchToProps = {
    setLocale,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(LanguageSelect));
