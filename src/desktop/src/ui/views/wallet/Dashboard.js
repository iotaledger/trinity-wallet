/*global Electron*/
import React from 'react';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Switch, Route } from 'react-router-dom';
import { connect } from 'react-redux';

import { runTask } from 'worker';
import { getSeed } from 'libs/crypto';

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
        /** Current seed index */
        seedIndex: PropTypes.number.isRequired,
        /** Accounts state state data
         * @ignore
         */
        accounts: PropTypes.object.isRequired,
        /** Current password value */
        password: PropTypes.string,
        /** Is a deep link set active */
        isDeepLinkActive: PropTypes.bool,
        /* Browser location objects */
        location: PropTypes.object,
        /** Theme definitions object */
        theme: PropTypes.object.isRequired,
        /** Browser history object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    componentWillMount() {
        if (this.props.isDeepLinkActive) {
            this.props.history.push('/wallet/send');
        }
    }

    getWave(primary) {
        const fill = primary ? this.props.theme.wave.primary : this.props.theme.wave.secondary;
        const wave = `<svg width='3196px' height='227px' viewBox='0 0 3196 227' xmlns='http://www.w3.org/2000/svg'><path fill='${fill}' d='M-1.13686838e-13,227 L-1.13686838e-13,149.222136 C289,149.222136 382,49 782,49 C1182.25708,48.7480077 1288.582,148.706694 1598.03248,149.220507 C1885.47122,148.649282 1979.93914,1.73038667e-16 2379,1.73038667e-16 C2780.102,-0.252524268 2885,149.222526 3195.995,149.222526 C3195.995,178.515341 3196,227 3196,227 L1596,227 L-1.13686838e-13,227 Z'></path></svg>`;
        return `url("data:image/svg+xml;utf8,${wave}")`;
    }

    updateAccount = async () => {
        const { accounts, password, seedIndex } = this.props;

        const seed = await getSeed(seedIndex, password);

        runTask('getAccountInfo', [seed, accounts.accountNames[seedIndex]]);
    };

    render() {
        const { t, history, location } = this.props;

        const route = location.pathname.split('/')[2] || '/';
        const subroute = location.pathname.split('/')[3] || null;

        const balanceOpen = ['send', 'receive'].indexOf(route) > -1;
        const historyOpen = ['history'].indexOf(route) > -1;

        const os = Electron.getOS();

        return (
            <div className={classNames(css.dashboard, os === 'win32' ? css.windows : null)}>
                <div className={balanceOpen ? css.balanceOpen : null}>
                    <section className={css.balance}>
                        <Balance />
                        <div className={!balanceOpen ? css.open : null}>
                            <a onClick={() => history.push('/wallet/receive')}>
                                <Icon icon="receive" size={36} />
                                <strong>{t('home:receive')}</strong>
                            </a>
                            <div>
                                <Balance />
                            </div>
                            <a onClick={() => history.push('/wallet/send')}>
                                <Icon icon="send" size={36} />
                                <strong>{t('home:send')}</strong>
                            </a>
                        </div>
                        <div className={balanceOpen ? css.open : null}>
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
                <div className={css.wave}>
                    <div
                        style={{
                            backgroundImage: this.getWave(true),
                            backgroundPosition: '0% bottom',
                        }}
                    />
                    <div
                        style={{
                            backgroundImage: this.getWave(),
                            backgroundPosition: '30% bottom',
                        }}
                    />
                </div>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    seedIndex: state.wallet.seedIndex,
    password: state.wallet.password,
    accounts: state.accounts,
    theme: state.settings.theme,
    isDeepLinkActive: state.wallet.deepLinkActive,
});

export default translate()(connect(mapStateToProps)(Dashboard));
