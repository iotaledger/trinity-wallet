import React from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import Template, { Content } from 'components/Main/Template';

import css from './Index.css';

import icoMode from 'images/mode.png';
import icoTheme from 'images/theme.png';
import icoCurrency from 'images/currency.png';
import icoLanguage from 'images/language.png';
import icoAccount from 'images/account.png';
import ico2fa from 'images/2fa.png';
import icoPassword from 'images/password.png';
import icoAdvanced from 'images/advanced.png';
import icoLogout from 'images/logout.png';

class Settings extends React.Component {
    static propTypes = {
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;

        return (
            <Template>
                <Content>
                    <section>
                        <nav className={css.nav}>
                            <NavLink to="/settings/mode">
                                <img src={icoMode} /> {t('settings:mode')}
                            </NavLink>
                            <NavLink to="/settings/theme">
                                <img src={icoTheme} /> {t('settings:theme')}
                            </NavLink>
                            <NavLink to="/settings/currency">
                                <img src={icoCurrency} /> {t('settings:currency')}
                            </NavLink>
                            <NavLink to="/settings/language">
                                <img src={icoLanguage} /> {t('settings:language')}
                            </NavLink>
                            <hr />
                            <NavLink to="/settings/2fa">
                                <img src={ico2fa} /> {t('settings:twoFA')}
                            </NavLink>
                            <NavLink to="/settings/password">
                                <img src={icoPassword} /> {t('settings:changePassword')}
                            </NavLink>
                            <hr />
                            <NavLink to="/settings/advanced">
                                <img src={icoAdvanced} /> {t('settings:advanced')}
                            </NavLink>
                            <NavLink to="/settings/logout">
                                <img src={icoLogout} /> {t('settings:logout')}
                            </NavLink>
                        </nav>
                    </section>
                    <section />
                </Content>
            </Template>
        );
    }
}

const mapStateToProps = state => ({});

const mapDispatchToProps = {};

export default translate('settings')(connect(mapStateToProps, mapDispatchToProps)(Settings));
