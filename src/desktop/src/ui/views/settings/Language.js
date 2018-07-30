import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { I18N_LOCALE_LABELS, I18N_LOCALES } from 'libs/i18n';
import { translate } from 'react-i18next';
import Select from 'ui/components/input/Select';
import i18next from 'libs/i18next';
import { setLocale } from 'actions/settings';

import Button from 'ui/components/Button';

/**
 * Interface locale selection component
 */
class LanguageSelect extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        locale: PropTypes.string,
        /** @ignore */
        setLocale: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        selection: null,
    };

    changeLocale = (e) => {
        e.preventDefault();

        const { selection } = this.state;

        this.props.setLocale(selection);
        i18next.changeLanguage(selection);

        this.setState({
            selection: null,
        });
    };

    render() {
        const { locale, t } = this.props;
        const { selection } = this.state;

        return (
            <form onSubmit={(e) => this.changeLocale(e)}>
                <Select
                    label={t('languageSetup:language')}
                    defaultValue={locale}
                    onChange={(e) => this.setState({ selection: e.target.value })}
                >
                    {I18N_LOCALES.map((item, index) => (
                        <option key={item} value={item}>
                            {I18N_LOCALE_LABELS[index]}
                        </option>
                    ))}
                </Select>
                <fieldset>
                    <Button type="submit" disabled={!selection || selection === locale}>
                        {t('save')}
                    </Button>
                </fieldset>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    locale: state.settings.locale,
});

const mapDispatchToProps = {
    setLocale,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(translate()(LanguageSelect));
