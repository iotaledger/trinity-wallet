/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import authenticator from 'authenticator';

import { getVault } from 'libs/crypto';

import { generateAlert } from 'actions/alerts';
import { getMarketData, getChartData, getPrice } from 'actions/marketData';
import { getCurrencyData } from 'actions/settings';
import { clearWalletData } from 'actions/wallet';
import { setSeeds, clearSeeds } from 'actions/seeds';

import { runTask } from 'worker';

import PasswordInput from 'ui/components/input/Password';
import Text from 'ui/components/input/Text';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';
import Modal from 'ui/components/modal/Modal';

/** Login component */
class Login extends React.Component {
    static propTypes = {
        /** Seed state state data */
        seeds: PropTypes.array.isRequired,
        /** Accounts state state data
         * @ignore
         */
        accounts: PropTypes.object.isRequired,
        /** wallet state data
         * @ignore
         */
        wallet: PropTypes.object.isRequired,
        /** Current currency symbol */
        currency: PropTypes.string.isRequired,
        /** Set seed state data
         * @param {Array} seeds - Seed state data
         * @ignore
         */
        setSeeds: PropTypes.func.isRequired,
        /** Clear wallet state data
         * @ignore
         */
        clearWalletData: PropTypes.func.isRequired,
        /** Clear temporary seed state data
         * @ignore
         */
        clearSeeds: PropTypes.func.isRequired,

        /** Fetch chart data */
        getChartData: PropTypes.func.isRequired,
        /** Fetch price data */
        getPrice: PropTypes.func.isRequired,
        /** Fetch market data */
        getMarketData: PropTypes.func.isRequired,
        /** Fetch currency data */
        getCurrencyData: PropTypes.func.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        loading: false,
        verifyTwoFA: false,
        code: '',
        password: '',
    };

    componentDidMount() {
        Electron.updateMenu('authorised', false);

        const { seeds, wallet } = this.props;

        if (wallet.ready && wallet.addingAdditionalAccount) {
            const seed = seeds[wallet.seedIndex];
            this.setupAccount(seed);
        } else {
            this.props.clearWalletData();
            this.props.clearSeeds();
        }
    }

    componentWillReceiveProps(newProps) {
        const { wallet } = this.props;

        const hasError =
            !wallet.hasErrorFetchingAccountInfoOnLogin && newProps.wallet.hasErrorFetchingAccountInfoOnLogin;

        if (hasError) {
            this.setState({
                loading: false,
            });
        }
    }

    setPassword = (password) => {
        this.setState({
            password: password,
        });
    };

    setupAccount(seed) {
        const { accounts, wallet, currency } = this.props;

        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);

        if (accounts.firstUse) {
            runTask('getFullAccountInfoFirstSeed', [seed, accounts.accountNames[wallet.seedIndex]]);
        } else if (wallet.addingAdditionalAccount) {
            runTask('getFullAccountInfoAdditionalSeed', [seed, wallet.additionalAccountName]);
        } else {
            runTask('getAccountInfo', [seed, accounts.accountNames[wallet.seedIndex]]);
        }
    }

    handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }

        const { password, code, verifyTwoFA } = this.state;
        const { setSeeds, wallet, generateAlert, t } = this.props;

        let vault = null;

        try {
            vault = getVault(password);

            if (vault.twoFAkey && !authenticator.verifyToken(vault.twoFAkey, code)) {
                if (verifyTwoFA) {
                    generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
                }

                this.setState({
                    verifyTwoFA: true,
                });

                return;
            }
        } catch (err) {
            generateAlert('error', t('unrecognisedPassword'), t('unrecognisedPasswordExplanation'));
        }

        if (vault) {
            setSeeds(vault.seeds);

            const seed = vault.seeds[wallet.seedIndex];

            this.setState({
                loading: true,
            });

            this.setupAccount(seed);
        }
    };

    render() {
        const { t, accounts, wallet } = this.props;
        const { loading, verifyTwoFA, code } = this.state;

        if (loading || wallet.addingAdditionalAccount) {
            return (
                <Loading
                    loop
                    title={accounts.firstUse || wallet.addingAdditionalAccount ? t('loading:loadingFirstTime') : null}
                    subtitle={accounts.firstUse || wallet.addingAdditionalAccount ? t('loading:thisMayTake') : null}
                />
            );
        }

        return (
            <React.Fragment>
                <form onSubmit={(e) => this.handleSubmit(e)}>
                    <div />
                    <section>
                        <PasswordInput
                            value={this.state.password}
                            label={t('password')}
                            name="password"
                            onChange={this.setPassword}
                        />
                    </section>
                    <footer>
                        <Button to="/settings/node" className="inline" variant="secondary">
                            {t('home:settings').toLowerCase()}
                        </Button>
                        <Button type="submit" className="large" variant="primary">
                            {t('login:login').toLowerCase()}
                        </Button>
                    </footer>
                </form>
                <Modal variant="confirm" isOpen={verifyTwoFA} onClose={() => this.setState({ verifyTwoFA: false })}>
                    <p>{t('twoFA:enterCode')}</p>
                    <form onSubmit={(e) => this.handleSubmit(e)}>
                        <Text
                            value={code}
                            label={t('twoFA:code')}
                            onChange={(value) => this.setState({ code: value })}
                        />
                        <Button
                            onClick={() => {
                                this.setState({ verifyTwoFA: false });
                            }}
                            variant="secondary"
                        >
                            {t('back')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t('glboal:done')}
                        </Button>
                    </form>
                </Modal>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    accounts: state.accounts,
    wallet: state.wallet,
    firstUse: state.accounts.firstUse,
    currency: state.settings.currency,
    seeds: state.seeds.seeds,
});

const mapDispatchToProps = {
    generateAlert,
    setSeeds,
    clearWalletData,
    clearSeeds,
    getChartData,
    getPrice,
    getMarketData,
    getCurrencyData,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Login));
