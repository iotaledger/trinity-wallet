/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import authenticator from 'authenticator';

import { generateAlert } from 'actions/alerts';
import { getMarketData, getChartData, getPrice } from 'actions/marketData';
import { getCurrencyData } from 'actions/settings';
import { clearWalletData, setPassword } from 'actions/wallet';

import { getSelectedAccountName } from 'selectors/accounts';

import { runTask } from 'worker';

import { capitalize } from 'libs/helpers';
import { vaultAuth, getSeed, hash } from 'libs/crypto';

import PasswordInput from 'ui/components/input/Password';
import Text from 'ui/components/input/Text';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';
import Modal from 'ui/components/modal/Modal';

/**
 * Login component
 **/
class Login extends React.Component {
    static propTypes = {
        /** @ignore */
        accounts: PropTypes.object.isRequired,
        /** @ignore */
        currentAccountName: PropTypes.string,
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        ui: PropTypes.object.isRequired,
        /** @ignore */
        currency: PropTypes.string.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        getChartData: PropTypes.func.isRequired,
        /** @ignore */
        getPrice: PropTypes.func.isRequired,
        /** @ignore */
        getMarketData: PropTypes.func.isRequired,
        /** @ignore */
        getCurrencyData: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
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

    /**
     * Get target seed and trigger fetch account info based on seed type
     * @param {event} Event - Form submit event
     * @returns {undefined}
     */
    setupAccount = async () => {
        const { accounts, wallet, currency, currentAccountName } = this.props;

        const accountName = wallet.addingAdditionalAccount ? wallet.additionalAccountName : currentAccountName;

        const seed = wallet.addingAdditionalAccount
            ? Electron.getOnboardingSeed(true)
            : await getSeed(wallet.password, accountName, true);

        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);

        if (accounts.firstUse) {
            runTask('getFullAccountInfoFirstSeed', [seed, accountName]);
        } else if (wallet.addingAdditionalAccount) {
            runTask('getFullAccountInfoAdditionalSeed', [seed, wallet.additionalAccountName, wallet.password]);
        } else {
            runTask('getAccountInfo', [seed, accountName]);
        }
    };

    /**
     * Verify password and 2fa code, trigger account setup
     * @param {event} Event - Form submit event
     * @returns {undefined}
     */
    handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const { password, code, verifyTwoFA } = this.state;
        const { setPassword, generateAlert, t } = this.props;

        const passwordHash = await hash(password);
        let authorised = false;

        try {
            authorised = await vaultAuth(passwordHash);

            if (typeof authorised === 'string' && !authenticator.verifyToken(authorised, code)) {
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

        if (authorised) {
            setPassword(passwordHash);

            this.setState({
                password: '',
                verifyTwoFA: false,
            });

            this.setupAccount();
        }
    };

    render() {
        const { t, accounts, wallet, ui } = this.props;
        const { verifyTwoFA, code } = this.state;

        if (ui.isFetchingLatestAccountInfoOnLogin || wallet.addingAdditionalAccount) {
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
                        <Button to="/settings/node" className="square" variant="dark">
                            {capitalize(t('home:settings'))}
                        </Button>
                        <Button type="submit" className="square" variant="primary">
                            {capitalize(t('login:login'))}
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
    currentAccountName: getSelectedAccountName(state),
    ui: state.ui,
    firstUse: state.accounts.firstUse,
    currency: state.settings.currency,
    onboarding: state.ui.onboarding,
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

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(translate()(Login));
