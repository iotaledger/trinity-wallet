/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSecurelyPersistedSeeds } from 'libs/crypto';
import { addAccountName } from 'actions/account';
import { showError } from 'actions/notifications';
import { getMarketData, getChartData, getPrice } from 'actions/marketData';
import { getCurrencyData } from 'actions/settings';
import { clearTempData } from 'actions/tempAccount';
import { loadSeeds, clearSeeds } from 'actions/seeds';
import { runTask } from 'worker';
import PasswordInput from 'ui/components/input/Password';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';

/** Login component */
class Login extends React.Component {
    static propTypes = {
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
         * @param {Object} seeds - Seed state data
         * @ignore
         */
        loadSeeds: PropTypes.func.isRequired,
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
        /** Add account name to account list
         * @param {Object} title - Account title
         * @ignore
         */
        addAccountName: PropTypes.func.isRequired,
        /** Error modal helper
         * @param {Object} content - Error screen content
         * @ignore
         */
        showError: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        loading: false,
        password: '',
    };

    componentDidMount() {
        this.props.clearTempData();
        this.props.clearSeeds();
        Electron.updateMenu('authorised', false);
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
        const { account, addAccountName, currency } = this.props;

        this.props.getPrice();
        this.props.getChartData();
        this.props.getMarketData();
        this.props.getCurrencyData(currency);

        if (account.firstUse) {
            addAccountName(seed.name);
            runTask('getFullAccountInfo', [seed.seed, seed.name]);
        } else {
            runTask('getAccountInfo', [seed.seed, seed.name]);
        }
    }

    handleSubmit = (e) => {
        e.preventDefault();
        const { password } = this.state;
        const { t, loadSeeds, showError } = this.props;

        let seeds = null;

        try {
            seeds = getSecurelyPersistedSeeds(password);
        } catch (err) {
            showError({
                title: t('global:unrecognisedPassword'),
                text: t('global:unrecognisedPasswordExplanation'),
            });
        }

        if (seeds) {
            loadSeeds(seeds);
            const seed = seeds.items[seeds.selectedSeedIndex];

            this.setState({
                loading: true,
            });

            this.setupAccount(seed, seeds.selectedSeedIndex);
        }
    };

    render() {
        const { t, account } = this.props;
        const { loading } = this.state;

        if (loading) {
            return (
                <Loading
                    loop
                    title={account.firstUse ? t('loading:thisMayTake') : null}
                    subtitle={account.firstUse ? t('loading:loadingFirstTime') : null}
                />
            );
        }

        return (
            <form onSubmit={this.handleSubmit}>
                <main>
                    <section>
                        <PasswordInput
                            value={this.state.password}
                            label={t('global:password')}
                            name="password"
                            onChange={this.setPassword}
                        />
                    </section>
                    <footer>
                        <Button to="/seedlogin" className="outline" variant="highlight">
                            {t('login:useSeed')}
                        </Button>
                        <Button className="outline" variant="primary">
                            {t('login:login')}
                        </Button>
                    </footer>
                </main>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    account: state.account,
    firstUse: state.account.firstUse,
    tempAccount: state.tempAccount,
    currency: state.settings.currency,
});

const mapDispatchToProps = {
    showError,
    loadSeeds,
    clearTempData,
    clearSeeds,
    addAccountName,
    getChartData,
    getPrice,
    getMarketData,
    getCurrencyData,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(Login));
