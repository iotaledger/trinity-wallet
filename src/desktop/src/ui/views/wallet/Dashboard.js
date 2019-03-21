/* global Electron */
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import SeedStore from 'libs/SeedStore';
import { capitalize } from 'libs/iota/converter';

import { getAccountInfo } from 'actions/accounts';

import { getSelectedAccountName, getSelectedAccountMeta } from 'selectors/accounts';

import Icon from 'ui/components/Icon';
import List from 'ui/components/List';
import Chart from 'ui/components/Chart';
import Balance from 'ui/components/Balance';

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
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        accountMeta: PropTypes.object.isRequired,
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
        /** @ignore */
        t: PropTypes.func.isRequired,
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

    render() {
        const { t, history, location } = this.props;

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
                            <a onClick={() => history.push('/wallet/receive')}>
                                <div>
                                    <Icon icon="receive" size={24} />
                                </div>
                                <p>{capitalize(t('home:receive'))}</p>
                            </a>
                            <div>
                                <Balance />
                            </div>
                            <a onClick={() => history.push('/wallet/send')}>
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
                        <List
                            updateAccount={() => this.updateAccount()}
                            setItem={(item) =>
                                item !== null ? history.push(`/wallet/history/${item}`) : history.push('/wallet/')
                            }
                            currentItem={subroute}
                        />
                    </section>
                    <section>
                        <Chart />
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
    isDeepLinkActive: state.wallet.deepLinkActive,
});

const mapDispatchToProps = {
    getAccountInfo,
};

export default withI18n()(connect(mapStateToProps, mapDispatchToProps)(Dashboard));
