import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import i18next from 'libs/i18next';
import { setLocale } from 'actions/settings';

class LanguageSelect extends React.PureComponent {

    static propTypes = {
        locale: PropTypes.string,
        setLocale: PropTypes.func.isRequired,
    };

    changeHandler = (e) => {
        const { target } = e;
        const { setLocale } = this.props;
        setLocale(target.value);
        i18next.changeLanguage(target.value);
    };

    render() {

        const { locale } = this.props;

        return (
            <select defaultValue={locale} onChange={this.changeHandler}>
                <option value="en">English</option>
                <option value="es-ES">Espanol</option>
                <option value="de">Deutsch</option>
            </select>
        );

    }

}

const mapStateToProps = ((state) => ({
    locale: state.settings.locale,
}));

const mapDispatchToProps = {
    setLocale
};

export default connect(mapStateToProps, mapDispatchToProps)(LanguageSelect);
