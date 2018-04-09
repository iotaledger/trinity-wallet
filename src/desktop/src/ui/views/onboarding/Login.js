/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import authenticator from 'authenticator';
import sjcl from 'sjcl';

import { getVault, getSeed } from 'libs/crypto';

import { generateAlert } from 'actions/alerts';
import { getMarketData, getChartData, getPrice } from 'actions/marketData';
import { getCurrencyData } from 'actions/settings';
import { clearWalletData, setPassword } from 'actions/wallet';

import { runTask } from 'worker';

import PasswordInput from 'ui/components/input/Password';
import Text from 'ui/components/input/Text';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';
import Modal from 'ui/components/modal/Modal';

/** Login component */
class Login extends React.Component {
    static propTypes = {
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
        /** Set password state
         * @param {String} password - Current password
         * @ignore
         */
        setPassword: PropTypes.func.isRequired,
        /** Clear wallet state data
         * @ignore
         */
        clearWalletData: PropTypes.func.isRequired,
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
        verifyTwoFA: false,
        code: '',
        password: '',
    };

    componentDidMount() {
        Electron.updateMenu('authorised', false);

        const { wallet } = this.props;

        if (wallet.ready && wallet.addingAdditionalAccount) {
            this.setupAccount();
        } else {
            this.props.clearWalletData();
            this.props.setPassword('');
        }
    }

    setPassword = (password) => {
        this.setState({
            password: password,
        });
    };

    setupAccount = async () => {
        const { accounts, wallet, currency } = this.props;

        const seed = await getSeed(wallet.seedIndex, wallet.password);

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
    };

    handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const { password, code, verifyTwoFA } = this.state;
        const { setPassword, wallet, generateAlert, t } = this.props;

        const passwordHash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(password));
        let vault = null;

        try {
            vault = await getVault(passwordHash);

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
            setPassword(passwordHash);

            const seed = vault.seeds[wallet.seedIndex];

            this.setState({
                password: '',
                verifyTwoFA: false,
            });

            this.setupAccount(seed);
        }
    };

    render() {
        const { t, accounts, wallet } = this.props;
        const { verifyTwoFA, code } = this.state;

        if (wallet.isFetchingLatestAccountInfoOnLogin || wallet.addingAdditionalAccount) {
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
                            focus
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
                            focus={verifyTwoFA}
                            label={t('twoFA:code')}
                            onChange={(value) => this.setState({ code: value })}
                        />
                        <footer>
                            <Button
                                onClick={() => {
                                    this.setState({ verifyTwoFA: false });
                                }}
                                variant="secondary"
                            >
                                {t('back')}
                            </Button>
                            <Button type="submit" variant="primary">
                                {t('login:login')}
                            </Button>
                        </footer>
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
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
    clearWalletData,
    getChartData,
    getPrice,
    getMarketData,
    getCurrencyData,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Login));
