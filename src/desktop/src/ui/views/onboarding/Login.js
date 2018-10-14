/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';
import authenticator from 'authenticator';

import { generateAlert } from 'actions/alerts';
import { getMarketData, getChartData, getPrice } from 'actions/marketData';
import { getCurrencyData } from 'actions/settings';
import { getAccountInfo, getFullAccountInfo } from 'actions/accounts';
import { clearWalletData, setPassword } from 'actions/wallet';

import { getSelectedAccountName, getSelectedAccountType } from 'selectors/accounts';

import { capitalize } from 'libs/helpers';
import { hash, authorize } from 'libs/crypto';
import SeedStore from 'libs/SeedStore';

import PasswordInput from 'ui/components/input/Password';
import Text from 'ui/components/input/Text';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';
import Modal from 'ui/components/modal/Modal';

import css from './index.scss';

/**
 * Login component
 **/
class Login extends React.Component {
    static propTypes = {
        /** @ignore */
        currentAccountName: PropTypes.string,
        /** @ignore */
        currentAccountType: PropTypes.string,
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        ui: PropTypes.object.isRequired,
        /** @ignore */
        getAccountInfo: PropTypes.func.isRequired,
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
        getFullAccountInfo: PropTypes.func.isRequired,
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

        if (wallet.addingAdditionalAccount) {
            this.setupAccount();
        } else {
            this.props.clearWalletData();
            this.props.setPassword({});
        }
    }

    /**
     * Update 2fa code value and trigger authentication once necessary length is reached
     * @param {string} value - Code value
     */
    setCode = (value) => {
        this.setState({ code: value }, () => value.length === 6 && this.handleSubmit());
    };

    /**
     * Update current input password value
     * @param {string} password - Password value
     */
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
        const { wallet, currency, currentAccountName, currentAccountType } = this.props;

        const accountName = wallet.addingAdditionalAccount ? wallet.additionalAccountName : currentAccountName;
        const accountType = wallet.addingAdditionalAccount ? wallet.additionalAccountType : currentAccountType;

        const seedStore = await new SeedStore[accountType](wallet.password, accountName);

        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);

        if (wallet.addingAdditionalAccount) {
            this.props.getFullAccountInfo(seedStore, accountName);
        } else {
            this.props.getAccountInfo(seedStore, accountName, Electron.notify);
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
            authorised = await authorize(passwordHash);

            if (typeof authorised === 'string' && !authenticator.verifyToken(authorised, code)) {
                if (verifyTwoFA) {
                    generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
                }

                this.setState({
                    verifyTwoFA: true,
                    code: '',
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
                code: '',
                verifyTwoFA: false,
            });

            this.setupAccount();
        }
    };

    render() {
        const { t, wallet, ui } = this.props;
        const { verifyTwoFA, code } = this.state;

        if (ui.isFetchingAccountInfo || wallet.addingAdditionalAccount) {
            return (
                <Loading
                    loop
                    title={wallet.addingAdditionalAccount ? t('loading:loadingFirstTime') : null}
                    subtitle={wallet.addingAdditionalAccount ? t('loading:thisMayTake') : null}
                />
            );
        }

        return (
            <React.Fragment>
                <form className={css.padded} onSubmit={(e) => this.handleSubmit(e)}>
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
                        <Text value={code} focus={verifyTwoFA} label={t('twoFA:code')} onChange={this.setCode} />
                        <footer>
                            <Button
                                onClick={() => {
                                    this.setState({ verifyTwoFA: false });
                                }}
                                variant="dark"
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
    wallet: state.wallet,
    currentAccountName: getSelectedAccountName(state),
    currentAccountType: getSelectedAccountType(state),
    ui: state.ui,
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
    getFullAccountInfo,
    getAccountInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Login));
