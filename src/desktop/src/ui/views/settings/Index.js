import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { showNotification } from 'actions/notifications';
import Template, { Content } from 'components/Main/Template';
import Confirm from 'ui/components/modal/Confirm';
import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';

import Language from 'ui/views/settings/Language';
import Theme from 'ui/views/settings/Theme';
import SetNode from 'ui/views/settings/Node';
import Currency from 'ui/views/settings/Currency';
import Password from 'ui/views/settings/Password';
import Advanced from 'ui/views/settings/Advanced';

import css from 'ui/views/settings/index.css';

import icoMode from 'images/mode-white.png';
import icoNode from 'images/node-white.png';
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
        tempAccount: PropTypes.object,
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

    renderSettings = () => {
        const { t, location, tempAccount, history } = this.props;
        const { modalLogout } = this.state;
        return (
            <Content>
                <section>
                    <nav className={css.nav}>
                        <NavLink to="/settings/language">
                            <Icon icon="language" size={16} /> {t('settings:language')}
                        </NavLink>
                        <NavLink to="/settings/node">
                            <Icon icon="node" size={16} /> {t('global:node')}
                        </NavLink>
                        <NavLink to="/settings/theme">
                            <Icon icon="theme" size={16} /> {t('settings:theme')}
                        </NavLink>
                        <NavLink to="/settings/currency">
                            <Icon icon="currency" size={16} /> {t('settings:currency')}
                        </NavLink>
                        <a onClick={this.featureUnavailable}>
                            <Icon icon="mode" size={16} /> {t('settings:mode')}
                        </a>
                        {tempAccount && tempAccount.ready ? (
                            <div>
                                <hr />

                                <a onClick={this.featureUnavailable}>
                                    <Icon icon="twoFA" size={16} /> {t('settings:twoFA')}
                                </a>
                                <NavLink to="/settings/password">
                                    <Icon icon="password" size={16} /> {t('settings:changePassword')}
                                </NavLink>
                                <hr />
                                <NavLink to="/settings/advanced">
                                    <Icon icon="advanced" size={16} /> {t('settings:advanced')}
                                </NavLink>
                                <a onClick={this.toggleLogout}>
                                    <Icon icon="logout" size={16} /> {t('settings:logout')}
                                </a>
                            </div>
                        ) : null}
                    </nav>
                    {!this.props.tempAccount || !this.props.tempAccount.ready ? (
                        <Button onClick={() => history.push('/')}>{t('global:back')}</Button>
                    ) : null}
                </section>
                <section className={css.content}>
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
                        <Route path="/settings/theme" component={Theme} />
                        <Route path="/settings/node" component={SetNode} />
                        <Route path="/settings/currency" component={Currency} />
                        <Route path="/settings/password" component={Password} />
                        <Route path="/settings/advanced" component={Advanced} />
                        <Redirect from="/settings" to="/settings/language" />
                    </Switch>
                </section>
            </Content>
        );
    };

    render() {
        const { history } = this.props;

        return this.props.tempAccount && this.props.tempAccount.ready ? (
            <Template>{this.renderSettings()}</Template>
        ) : (
            <Modal isOpen onClose={() => history.push('/')}>
                <div className={css.public}>{this.renderSettings()}</div>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
});

const mapDispatchToProps = {
    showNotification,
};

export default translate('settings')(connect(mapStateToProps, mapDispatchToProps)(Settings));
