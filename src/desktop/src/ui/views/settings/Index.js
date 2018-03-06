import React from 'react';
import PropTypes from 'prop-types';
import { NavLink, Switch, Route, Redirect } from 'react-router-dom';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { showNotification } from 'actions/notifications';

import Icon from 'ui/components/Icon';

import Language from 'ui/views/settings/Language';
import Theme from 'ui/views/settings/Theme';
import SetNode from 'ui/views/settings/Node';
import Currency from 'ui/views/settings/Currency';
import Password from 'ui/views/settings/Password';
import Advanced from 'ui/views/settings/Advanced';
import TwoFA from 'ui/views/settings/TwoFA';

import css from './index.css';

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
        /** Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, location, tempAccount, history } = this.props;

        const backRoute = tempAccount.ready ? '/wallet/' : '/onboarding/';

        return (
            <main className={css.settings}>
                <div>
                    <section>
                        <nav>
                            <NavLink to="/settings/language">
                                <Icon icon="language" size={20} /> <strong>{t('settings:language')}</strong>
                            </NavLink>
                            <NavLink to="/settings/node">
                                <Icon icon="node" size={20} /> <strong>{t('global:node')}</strong>
                            </NavLink>
                            <NavLink to="/settings/theme">
                                <Icon icon="theme" size={20} /> <strong>{t('settings:theme')}</strong>
                            </NavLink>
                            <NavLink to="/settings/currency">
                                <Icon icon="currency" size={20} /> <strong>{t('settings:currency')}</strong>
                            </NavLink>
                            {tempAccount && tempAccount.ready ? (
                                <div>
                                    <hr />
                                    <NavLink to="/settings/password">
                                        <Icon icon="password" size={20} /> <strong>{t('settings:changePassword')}</strong>
                                    </NavLink>
                                    <NavLink to="/settings/twoFa">
                                        <Icon icon="twoFA" size={20} /> <strong>{t('settings:twoFA')}</strong>
                                    </NavLink>
                                    <hr />
                                    <NavLink to="/settings/advanced">
                                        <Icon icon="advanced" size={20} /> <strong>{t('settings:advanced')}</strong>
                                    </NavLink>
                                </div>
                            ) : null}
                        </nav>
                    </section>
                    <section className={css.content}>
                        <header>
                           <a onClick={() => history.push(backRoute)}>
                                 <Icon icon="cross" size={40} />
                           </a>
                        </header>
                        <Switch location={location}>
                            <Route path="/settings/language" component={Language} />
                            <Route path="/settings/theme" component={Theme} />
                            <Route path="/settings/node" component={SetNode} />
                            <Route path="/settings/currency" component={Currency} />
                            <Route path="/settings/password" component={Password} />
                            <Route path="/settings/twoFa" component={TwoFA} />
                            <Route path="/settings/advanced" component={Advanced} />
                            <Redirect from="/settings/" to="/settings/language" />
                        </Switch>
                    </section>
                </div>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
});

const mapDispatchToProps = {
    showNotification,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(Settings));
