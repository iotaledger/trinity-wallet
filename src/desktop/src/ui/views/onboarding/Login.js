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

import { getSelectedAccountName, getSelectedAccountMeta, isSettingUpNewAccount } from 'selectors/accounts';

import { capitalize } from 'libs/iota/converter';
import { hash, authorize } from 'libs/crypto';
import SeedStore from 'libs/SeedStore';

import PasswordInput from 'ui/components/input/Password';
import Text from 'ui/components/input/Text';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';
import Modal from 'ui/components/modal/Modal';

import Migration from 'ui/global/Migration';

import css from './index.scss';

/**
 * Login component
 **/
class Login extends React.Component {
    static propTypes = {
        /** @ignore */
        currentAccountName: PropTypes.string,
        /** @ignore */
        currentAccountMeta: PropTypes.object,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        ui: PropTypes.object.isRequired,
        /** @ignore */
        addingAdditionalAccount: PropTypes.bool.isRequired,
        /** @ignore */
        additionalAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        additionalAccountName: PropTypes.string.isRequired,
        /** @ignore */
        completedMigration: PropTypes.bool.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
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
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
    };

    state = {
        verifyTwoFA: false,
        code: '',
        password: '',
        shouldMigrate: false,
    };

    componentDidMount() {
        Electron.updateMenu('authorised', false);

        const { password, addingAdditionalAccount } = this.props;

        if (password.length && addingAdditionalAccount) {
            this.setupAccount();
        } else {
            this.props.clearWalletData();
            this.props.setPassword({});
        }
    }

    componentWillUnmount() {
        setTimeout(() => Electron.garbageCollect(), 1000);
    }

    componentDidUpdate(prevProps) {
        if (!prevProps.completedMigration && this.props.completedMigration) {
            this.setupAccount();
            Electron.clearStorage();
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
        const {
            password,
            addingAdditionalAccount,
            additionalAccountName,
            additionalAccountMeta,
            currency,
            currentAccountName,
            currentAccountMeta,
        } = this.props;

        const accountName = addingAdditionalAccount ? additionalAccountName : currentAccountName;
        const accountMeta = addingAdditionalAccount ? additionalAccountMeta : currentAccountMeta;

        let seedStore;
        try {
            seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);
        } catch (e) {
            e.accountName = accountName;
            throw e;
        }

        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);

        if (addingAdditionalAccount) {
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
        const { setPassword, generateAlert, t, completedMigration } = this.props;

        let passwordHash = null;
        let authorised = false;

        try {
            passwordHash = await hash(password);
        } catch (err) {
            generateAlert('error', t('errorAccessingKeychain'), t('errorAccessingKeychainExplanation'));
        }

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

            if (!completedMigration) {
                this.setState({ shouldMigrate: true });
                return;
            }

            try {
                await this.setupAccount();
            } catch (err) {
                generateAlert(
                    'error',
                    t('unrecognisedAccount'),
                    t('unrecognisedAccountExplanation', { accountName: err.accountName }),
                );
            }
        }
    };

    render() {
        const { forceUpdate, t, addingAdditionalAccount, ui } = this.props;
        const { verifyTwoFA, code, shouldMigrate } = this.state;

        if (ui.isFetchingAccountInfo) {
            return (
                <Loading
                    loop
                    title={addingAdditionalAccount ? t('loading:loadingFirstTime') : null}
                    subtitle={addingAdditionalAccount ? t('loading:thisMayTake') : null}
                />
            );
        }

        if (shouldMigrate) {
            return <Migration />;
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
                            disabled={forceUpdate}
                        />
                    </section>
                    <footer>
                        <Button disabled={forceUpdate} to="/settings/node" className="square" variant="dark">
                            {capitalize(t('home:settings'))}
                        </Button>
                        <Button disabled={forceUpdate} type="submit" className="square" variant="primary">
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
    password: state.wallet.password,
    currentAccountName: getSelectedAccountName(state),
    currentAccountMeta: getSelectedAccountMeta(state),
    addingAdditionalAccount: isSettingUpNewAccount(state),
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
    additionalAccountName: state.accounts.accountInfoDuringSetup.name,
    ui: state.ui,
    currency: state.settings.currency,
    onboarding: state.ui.onboarding,
    forceUpdate: state.wallet.forceUpdate,
    completedMigration: state.settings.completedMigration,
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
