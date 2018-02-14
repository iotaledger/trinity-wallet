import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Switch, Route, withRouter, NavLink } from 'react-router-dom';

import Header from 'ui/views/wallet/Header';

import Balance from 'ui/views/wallet/Balance';
import Receive from 'ui/views/wallet/Receive';
import Send from 'ui/views/wallet/Send';
import HistoryView from 'ui/views/wallet/History';
import Settings from 'ui/views/settings/Index';

import Icon from 'ui/components/Icon';

import css from 'ui/index.css';

/**
 * Wallet functionallity router wrapper component
 */
class Wallet extends React.PureComponent {
    static propTypes = {
        /* Browser location objects */
        location: PropTypes.object,
        /* Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { location, t } = this.props;
        return (
            <div className={css.main}>
                <Header />
                <div className={css.columns}>
                    <aside>
                        <nav>
                            <NavLink to="/wallet/balance">
                                <Icon icon="wallet" size={20} />
                                {t('home:balance')}
                            </NavLink>
                            <NavLink to="/wallet/send">
                                <Icon icon="send" size={20} />
                                {t('home:send')}
                            </NavLink>
                            <NavLink to="/wallet/receive">
                                <Icon icon="receive" size={20} />
                                {t('home:receive')}
                            </NavLink>
                            <NavLink to="/wallet/history">
                                <Icon icon="history" size={20} />
                                {t('home:history')}
                            </NavLink>
                            <NavLink to="/settings">
                                <Icon icon="settings" size={20} />
                                {t('home:settings')}
                            </NavLink>
                        </nav>
                    </aside>
                    <section>
                        <Switch location={location}>
                            <Route path="/wallet/balance" component={Balance} />
                            <Route path="/wallet/send" component={Send} />
                            <Route path="/wallet/receive" component={Receive} />
                            <Route path="/wallet/history" component={HistoryView} />
                            <Route exact path="/settings/:setting?" component={Settings} />
                        </Switch>
                    </section>
                </div>
            </div>
        );
    }
}

export default withRouter(translate()(Wallet));
