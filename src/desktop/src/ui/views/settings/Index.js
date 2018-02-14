import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { showNotification } from 'actions/notifications';
import { clearTempData } from 'actions/tempAccount';
import Confirm from 'ui/components/modal/Confirm';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';

import Language from 'ui/views/settings/Language';
import Theme from 'ui/views/settings/Theme';
import SetNode from 'ui/views/settings/Node';
import Currency from 'ui/views/settings/Currency';
import Password from 'ui/views/settings/Password';
import Advanced from 'ui/views/settings/Advanced';

import css from 'ui/index.css';

/** Settings main wrapper component */
class Settings extends React.PureComponent {
    static propTypes = {
        /** Browser location object */
        location: PropTypes.object,
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Temporary account state data
         * @ignore
         */
        tempAccount: PropTypes.object,
        /** Clear temporary seed state data
         * @ignore
         */
        clearTempData: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
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
        this.props.history.push('/login');
    };

    render() {
        const { t, location, tempAccount, history } = this.props;
        const { modalLogout } = this.state;

        return (
            <main className={!tempAccount || !tempAccount.ready ? css.public : css.settings}>
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
                        {tempAccount && tempAccount.ready ? (
                            <div>
                                <hr />
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
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
});

const mapDispatchToProps = {
    showNotification,
    clearTempData,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(Settings));
