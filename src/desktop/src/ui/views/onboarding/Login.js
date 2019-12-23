/* global Electron */
import get from 'lodash/get';
import isNull from 'lodash/isNull';
import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';
import { fetchMarketData } from 'actions/polling';
import { getAccountInfo, getFullAccountInfo } from 'actions/accounts';
import { clearWalletData, setPassword } from 'actions/wallet';
import {
    fetchCountries as fetchMoonPayCountries,
    fetchCurrencies as fetchMoonPayCurrencies,
    checkIPAddress,
    refreshCredentialsAndFetchMeta,
} from 'actions/exchanges/MoonPay';

import { getSelectedAccountName, getSelectedAccountMeta, isSettingUpNewAccount } from 'selectors/accounts';
import { __DEV__ } from 'config';

import { capitalize } from 'libs/iota/converter';
import { hash, authorize } from 'libs/crypto';
import MoonPayKeychainAdapter from 'libs/MoonPay';
import SeedStore from 'libs/SeedStore';

import PasswordInput from 'ui/components/input/Password';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';

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
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        fetchMarketData: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        getFullAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        fetchMoonPayCountries: PropTypes.func.isRequired,
        /** @ignore */
        fetchMoonPayCurrencies: PropTypes.func.isRequired,
        /** @ignore */
        checkIPAddress: PropTypes.func.isRequired,
        /** @ignore */
        refreshCredentialsAndFetchMeta: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    state = {
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

        this.props.fetchMarketData();
    }

    componentDidUpdate(prevProps) {
        if (this.state.shouldMigrate && !prevProps.completedMigration && this.props.completedMigration) {
            this.setupAccount();
        }
    }

    componentWillUnmount() {
        setTimeout(() => Electron.garbageCollect(), 1000);
    }

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

        this.fetchMoonPayData();

        if (addingAdditionalAccount) {
            this.props.getFullAccountInfo(seedStore, accountName);
        } else {
            this.props.getAccountInfo(seedStore, accountName, Electron.notify);
        }
    };

    /**
     * Fetches MoonPay data from their servers
     *
     * @method fetchMoonPayData
     *
     * @returns {void}
     */
    fetchMoonPayData() {
        this.props.fetchMoonPayCountries();
        this.props.fetchMoonPayCurrencies();
        this.props.checkIPAddress();

        MoonPayKeychainAdapter.get()
            .then((credentials) => {
                if (!isNull(credentials)) {
                    this.props.refreshCredentialsAndFetchMeta(
                        get(credentials, 'jwt'),
                        get(credentials, 'csrfToken'),
                        MoonPayKeychainAdapter,
                    );
                }
            })
            .catch((error) => {
                if (__DEV__) {
                    /* eslint-disable no-console */
                    console.log(error);
                    /* eslint-enable no-console */
                }
            });
    }

    /**
     * Verify password and trigger account setup
     * @param {event} Event - Form submit event
     * @returns {undefined}
     */
    handleSubmit = async (e) => {
        if (e) {
            e.preventDefault();
        }

        const { password } = this.state;
        const { setPassword, generateAlert, t, completedMigration } = this.props;

        let passwordHash = null;
        let authorised = false;

        try {
            passwordHash = await hash(password);
        } catch (err) {
            generateAlert('error', t('errorAccessingKeychain'), t('errorAccessingKeychainExplanation'), 20000, err);
        }

        try {
            authorised = await authorize(passwordHash);
        } catch (err) {
            generateAlert('error', t('unrecognisedPassword'), t('unrecognisedPasswordExplanation'));
        }

        if (authorised) {
            setPassword(passwordHash);

            this.setState({
                password: '',
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
        const { forceUpdate, t, addingAdditionalAccount, ui, completedMigration, themeName } = this.props;
        const { shouldMigrate } = this.state;

        if (ui.isFetchingAccountInfo) {
            return (
                <Loading
                    loop
                    title={addingAdditionalAccount ? t('loading:loadingFirstTime') : null}
                    subtitle={addingAdditionalAccount ? t('loading:thisMayTake') : null}
                    themeName={themeName}
                />
            );
        }

        if (shouldMigrate && !completedMigration) {
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
    forceUpdate: state.wallet.forceUpdate,
    completedMigration: state.settings.completedMigration,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
    clearWalletData,
    fetchMarketData,
    getFullAccountInfo,
    getAccountInfo,
    fetchMoonPayCountries,
    fetchMoonPayCurrencies,
    checkIPAddress,
    refreshCredentialsAndFetchMeta,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(Login));
