/* global Electron */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import SeedStore from 'libs/SeedStore';
import { capitalize } from 'libs/iota/converter';

import { getAccountInfo } from 'actions/accounts';
import { setViewingMoonpayPurchases } from 'actions/ui';
import { fetchTransactions as fetchMoonPayTransactions, setLoggingIn as setLoggingInToMoonPay } from 'actions/exchanges/MoonPay';

import { getSelectedAccountName, getSelectedAccountMeta } from 'selectors/accounts';

import Icon from 'ui/components/Icon';
import List from 'ui/components/List';
import Chart from 'ui/components/Chart';
import Balance from 'ui/components/Balance';
import Tab from 'ui/components/Tab';

import PurchaseList from 'ui/components/exchanges/MoonPay/PurchaseList';
import RequireLoginView from 'ui/components/exchanges/MoonPay/RequireLogin';

import Receive from 'ui/views/wallet/Receive';
import Send from 'ui/views/wallet/Send';

import css from './dashboard.scss';

/**
 * Wallet dashboard component
 */
class Dashboard extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        getAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        accountName: PropTypes.string,
        /** @ignore */
        accountMeta: PropTypes.object,
        /** @ignore */
        password: PropTypes.object,
        /** @ignore */
        isDeepLinkActive: PropTypes.bool,
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        themeName: PropTypes.string.isRequired,

        /** @ignore */
        isAuthenticatedForMoonPay: PropTypes.bool.isRequired,
        /** @ignore */
        isViewingMoonpayPurchases: PropTypes.bool.isRequired,
        /** @ignore */
        setViewingMoonpayPurchases: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setLoggingInToMoonPay: PropTypes.func.isRequired,
    };

    componentWillMount() {
        if (this.props.isDeepLinkActive) {
            this.props.history.push('/wallet/send');
        }
    }

    updateAccount = async () => {
        const { password, accountName, accountMeta } = this.props;

        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);

        this.props.getAccountInfo(
            seedStore,
            accountName,
            Electron.notify,
            true, // Sync with quorum enabled
        );
    };

    /**
     * Renders MoonPay purchase history view(s)
     *
     * @method renderMoonPayPurchaseHistory
     *
     * @param {string} subroute
     *
     * @returns {object}
     */
    renderMoonPayPurchaseHistory = (subroute) => {
        const { setLoggingInToMoonPay, history, t, themeName, isAuthenticatedForMoonPay } = this.props;

        if (isAuthenticatedForMoonPay) {
            return (
                <PurchaseList
                    setItem={(item) =>
                        item !== null ? history.push(`/wallet/history/${item}`) : history.push('/wallet/')
                    }
                    currentItem={subroute}
                />
            );
        }

        return <RequireLoginView setLoggingIn={setLoggingInToMoonPay} history={history} t={t} themeName={themeName} />;
    };

    render() {
        const { isViewingMoonpayPurchases, t, history, location } = this.props;

        const route = location.pathname.split('/')[2] || '/';
        const subroute = location.pathname.split('/')[3] || null;

        const balanceOpen = ['send', 'receive'].indexOf(route) > -1;
        const sendOpen = ['send'].indexOf(route) > -1;
        const historyOpen = ['history'].indexOf(route) > -1;

        const os = Electron.getOS();

        return (
            <div className={classNames(css.dashboard, os === 'win32' ? css.windows : null)}>
                <div className={balanceOpen ? css.balanceOpen : null}>
                    <section className={css.balance}>
                        <Balance />
                        <div className={balanceOpen ? css.openMid : null}>
                            <a id="to-receive" onClick={() => history.push('/wallet/receive')}>
                                <div>
                                    <Icon icon="receive" size={24} />
                                </div>
                                <p>{capitalize(t('home:receive'))}</p>
                            </a>
                            <div>
                                <Balance />
                            </div>
                            <a id="to-send" onClick={() => history.push('/wallet/send')}>
                                <div>
                                    <Icon icon="send" size={24} />
                                </div>
                                <p>{capitalize(t('home:send'))}</p>
                            </a>
                        </div>
                        <div className={sendOpen ? css.openRight : balanceOpen ? css.openLeft : css.close}>
                            <Switch location={location}>
                                <Route path="/wallet/send" component={Send} />
                                <Route path="/wallet/receive" component={Receive} />
                            </Switch>
                        </div>
                    </section>
                </div>
                <div className={historyOpen || balanceOpen ? css.history : null}>
                    <section>
                        <div className={css.tabs}>
                            <Tab
                                active={!isViewingMoonpayPurchases}
                                onClick={() => this.props.setViewingMoonpayPurchases(false)}
                            >
                                {t('history:transactions')}
                            </Tab>
                            <Tab
                                active={isViewingMoonpayPurchases}
                                onClick={() => this.props.setViewingMoonpayPurchases(true)}
                            >
                                {t('history:purchases')}
                            </Tab>
                        </div>
                        {isViewingMoonpayPurchases ? (
                            this.renderMoonPayPurchaseHistory(subroute)
                        ) : (
                            <List
                                updateAccount={() => this.updateAccount()}
                                setItem={(item) =>
                                    item !== null ? history.push(`/wallet/history/${item}`) : history.push('/wallet/')
                                }
                                currentItem={subroute}
                            />
                        )}
                    </section>
                    <section>
                        <Chart history={history} />
                    </section>
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
    password: state.wallet.password,
    isDeepLinkActive: state.wallet.deepLinkRequestActive,
    isViewingMoonpayPurchases: state.ui.isViewingMoonpayPurchases,
    isAuthenticatedForMoonPay: state.exchanges.moonpay.isAuthenticated,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    getAccountInfo,
    setViewingMoonpayPurchases,
    fetchMoonPayTransactions,
    setLoggingInToMoonPay
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
