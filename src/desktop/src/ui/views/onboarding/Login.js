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
import { clearTempData } from 'actions/tempAccount';
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
        account: PropTypes.object.isRequired,
        /** Temporary account state data
         * @ignore
         */
        tempAccount: PropTypes.object.isRequired,
        /** Current currency symbol */
        currency: PropTypes.string.isRequired,
        /** Set seed state data
         * @param {Array} seeds - Seed state data
         * @ignore
         */
        setSeeds: PropTypes.func.isRequired,
        /** Clear temporary account state data
         * @ignore
         */
        clearTempData: PropTypes.func.isRequired,
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

        const { seeds, tempAccount } = this.props;

        if (tempAccount.ready && tempAccount.addingAdditionalAccount) {
            const seed = seeds[tempAccount.seedIndex];
            this.setupAccount(seed);
        } else {
            this.props.clearTempData();
            this.props.clearSeeds();
        }
    }

    componentWillReceiveProps(newProps) {
        const { tempAccount } = this.props;

        const hasError =
            !tempAccount.hasErrorFetchingAccountInfoOnLogin && newProps.tempAccount.hasErrorFetchingAccountInfoOnLogin;

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
        const { account, tempAccount, currency } = this.props;

        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);

        if (account.firstUse && !tempAccount.addingAdditionalAccount) {
            runTask('getFullAccountInfo', [seed, account.seedNames[tempAccount.seedIndex]]);
        } else if (!account.firstUse && tempAccount.addingAdditionalAccount) {
            runTask('fetchFullAccountInfoForFirstUse', [seed, tempAccount.additionalAccountName]);
        } else {
            runTask('getAccountInfo', [seed, account.seedNames[tempAccount.seedIndex]]);
        }
    }

    handleSubmit = (e) => {
        if (e) {
            e.preventDefault();
        }

        const { password, code, verifyTwoFA } = this.state;
        const { setSeeds, tempAccount, generateAlert, t } = this.props;

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
            generateAlert('error', t('global:unrecognisedPassword'), t('global:unrecognisedPasswordExplanation'));
        }

        if (vault) {
            setSeeds(vault.seeds);

            const seed = vault.seeds[tempAccount.seedIndex];

            this.setState({
                loading: true,
            });

            this.setupAccount(seed);
        }
    };

    render() {
        const { t, account, tempAccount } = this.props;
        const { loading, verifyTwoFA, code } = this.state;

        if (loading || tempAccount.addingAdditionalAccount) {
            return (
                <Loading
                    loop
                    title={account.firstUse ? t('loading:thisMayTake') : null}
                    subtitle={account.firstUse ? t('loading:loadingFirstTime') : null}
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
                            label={t('global:password')}
                            name="password"
                            onChange={this.setPassword}
                        />
                    </section>
                    <footer>
                        <Button to="/settings/node" className="outline" variant="secondary">
                            {t('home:settings')}
                        </Button>
                        <Button type="submit" className="outline" variant="primary">
                            {t('login:login')}
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
                            {t('global:back')}
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
    account: state.account,
    tempAccount: state.tempAccount,
    firstUse: state.account.firstUse,
    currency: state.settings.currency,
    seeds: state.seeds.seeds,
});

const mapDispatchToProps = {
    generateAlert,
    setSeeds,
    clearTempData,
    clearSeeds,
    getChartData,
    getPrice,
    getMarketData,
    getCurrencyData,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(Login));
