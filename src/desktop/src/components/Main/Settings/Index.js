import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Switch, Route } from 'react-router-dom';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { clearTempData } from 'actions/tempAccount';
import { clearSeeds } from 'actions/seeds';
import { showNotification } from 'actions/notifications';
import Template, { Content } from 'components/Main/Template';
import Confirm from 'components/UI/Confirm';

import Language from 'components/Main/Settings/Language';

import css from 'components/Main/Settings/Index.css';

import icoMode from 'images/mode-white.png';
import icoTheme from 'images/theme-white.png';
import icoCurrency from 'images/currency-white.png';
import icoLanguage from 'images/language-white.png';
import ico2fa from 'images/2fa-white.png';
import icoPassword from 'images/password-white.png';
import icoAdvanced from 'images/advanced-white.png';
import icoLogout from 'images/logout-white.png';

class Settings extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        location: PropTypes.object,
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        clearTempData: PropTypes.func.isRequired,
        clearSeeds: PropTypes.func.isRequired,
        showNotification: PropTypes.func.isRequired,
    };

    state = {
        modalLogout: false,
    };

    toggleLogout = () => {
        this.setState({
            modalLogout: !this.state.modalLogout,
        });
    };

    doLogout = () => {
        this.props.clearTempData();
        this.props.clearSeeds();
        this.props.history.push('/login');
    };

    featureUnavailable = () => {
        const { t } = this.props;

        return this.props.showNotification({
            timeout: 2000,
            title: t('global:notAvailable'),
            text: t('global:notAvailableExplanation'),
        });
    };

    render() {
        const { t, location } = this.props;
        const { modalLogout } = this.state;

        return (
            <Template>
                <Content>
                    <section>
                        <nav className={css.nav}>
                            <a onClick={this.featureUnavailable}>
                                <img src={icoMode} /> {t('settings:mode')}
                            </a>
                            <a onClick={this.featureUnavailable}>
                                <img src={icoTheme} /> {t('settings:theme')}
                            </a>
                            <a onClick={this.featureUnavailable}>
                                <img src={icoCurrency} /> {t('settings:currency')}
                            </a>
                            <NavLink to="/settings/language">
                                <img src={icoLanguage} /> {t('settings:language')}
                            </NavLink>
                            <hr />
                            <a onClick={this.featureUnavailable}>
                                <img src={ico2fa} /> {t('settings:twoFA')}
                            </a>
                            <a onClick={this.featureUnavailable}>
                                <img src={icoPassword} /> {t('settings:changePassword')}
                            </a>
                            <hr />
                            <a onClick={this.featureUnavailable}>
                                <img src={icoAdvanced} /> {t('settings:advanced')}
                            </a>
                            <a onClick={this.toggleLogout}>
                                <img src={icoLogout} /> {t('settings:logout')}
                            </a>
                        </nav>
                    </section>
                    <section>
                        <Confirm
                            isOpen={modalLogout}
                            content={{
                                title: t('logoutConfirmationModal:logoutConfirmation'),
                                confirm: t('global:yes'),
                                cancel: t('global:no'),
                            }}
                            onCancel={this.toggleLogout}
                            onConfirm={this.doLogout}
                        />
                        <Switch location={location}>
                            <Route path="/settings/language" component={Language} />
                            <Route exact path="/settings/" component={Language} />
                        </Switch>
                    </section>
                </Content>
            </Template>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    showNotification,
    clearTempData,
    clearSeeds,
};

export default translate('settings')(connect(mapStateToProps, mapDispatchToProps)(Settings));
