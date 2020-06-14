/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import i18next from 'libs/i18next';
import { withTranslation } from 'react-i18next';

import { parseDeepLink, ADDRESS_LENGTH } from 'libs/iota/utils';
import { ALIAS_MAIN } from 'libs/constants';
import { fetchVersions, fetchIsSeedMigrationUp, VALID_IOTA_SUBDOMAIN_REGEX } from 'libs/utils';

import { getAccountNamesFromState, isSettingUpNewAccount } from 'selectors/accounts';

import { setOnboardingComplete, setAccountInfoDuringSetup } from 'actions/accounts';
import {
    setPassword,
    clearWalletData,
    initiateDeepLinkRequest,
    setDeepLinkContent,
    setSeedIndex,
    shouldUpdate,
    forceUpdate,
    displayTestWarning,
    displaySeedMigrationAlert,
} from 'actions/wallet';

import { updateTheme } from 'actions/settings';
import { fetchNodeList } from 'actions/polling';
import { dismissAlert, generateAlert } from 'actions/alerts';

import Theme from 'ui/global/Theme';
import Idle from 'ui/global/Idle';
import Titlebar from 'ui/global/Titlebar';
import FatalError from 'ui/global/FatalError';
import About from 'ui/global/About';
import ErrorLog from 'ui/global/ErrorLog';
import UpdateProgress from 'ui/global/UpdateProgress';

import Loading from 'ui/components/Loading';

import Onboarding from 'ui/views/onboarding/Index';

import Wallet from 'ui/views/wallet/Index';
import Settings from 'ui/views/settings/Index';
import Ledger from 'ui/global/seedStore/Ledger';

/**
 * Wallet wrapper component
 **/
class App extends React.Component {
    static propTypes = {
        /** @ignore */
        seedIndex: PropTypes.number.isRequired,
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        isBusy: PropTypes.bool.isRequired,
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        onboardingComplete: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorFetchingFullAccountInfo: PropTypes.bool.isRequired,
        /** @ignore */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** @ignore */
        history: PropTypes.object.isRequired,
        /** @ignore */
        addingAdditionalAccount: PropTypes.bool.isRequired,
        /** @ignore */
        locale: PropTypes.string.isRequired,
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        dismissAlert: PropTypes.func.isRequired,
        /** @ignore */
        clearWalletData: PropTypes.func.isRequired,
        /** @ignore */
        setPassword: PropTypes.func.isRequired,
        /** @ignore */
        fetchNodeList: PropTypes.func.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        updateTheme: PropTypes.func.isRequired,
        /** @ignore */
        setSeedIndex: PropTypes.func.isRequired,
        /** @ignore */
        shouldUpdate: PropTypes.func.isRequired,
        /** @ignore */
        deepLinking: PropTypes.bool.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.func.isRequired,
        /** @ignore */
        displayTestWarning: PropTypes.func.isRequired,
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        initiateDeepLinkRequest: PropTypes.func.isRequired,
        /** @ignore */
        setDeepLinkContent: PropTypes.func.isRequired,
        /** @ignore */
        displaySeedMigrationAlert: PropTypes.func.isRequired,
        /** @ignore */
        alerts: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            fatalError: false,
        };
    }

    componentDidMount() {
        this.onMenuToggle = this.menuToggle.bind(this);
        this.onAccountSwitch = this.accountSwitch.bind(this);
        this.props.fetchNodeList();

        Electron.onEvent('menu', this.onMenuToggle);
        Electron.onEvent('account.switch', this.onAccountSwitch);

        Electron.changeLanguage(this.props.t);

        this.onSetDeepUrl = this.setDeepUrl.bind(this);
        Electron.onEvent('url-params', this.onSetDeepUrl);
        Electron.requestDeepLink();

        this.checkVaultAvailability();
        this.versionCheck();
        this.seedMigrationCheck();
    }

    componentWillReceiveProps(nextProps) {
        /* On language change */
        if (nextProps.locale !== this.props.locale) {
            i18next.changeLanguage(nextProps.locale);
            Electron.changeLanguage(this.props.t);
        }

        const currentKey = this.props.location.pathname.split('/')[1] || '/';

        if (nextProps.hasErrorFetchingFullAccountInfo && !this.props.hasErrorFetchingFullAccountInfo) {
            if (nextProps.accountNames.length === 0) {
                // Reset state password on unsuccessful first account info fetch
                this.props.setPassword({});
            } else {
                // Mark Onboarding as incomplete on unsuccessful additional account info fetch
                this.props.setAccountInfoDuringSetup({
                    completed: false,
                });
                this.props.history.push('/onboarding/account-name');
            }
        } else if (!this.props.wallet.ready && nextProps.wallet.ready && currentKey === 'onboarding') {
            /* On Login */
            Electron.updateMenu('authorised', true);

            Electron.setOnboardingSeed(null);

            if (!this.props.onboardingComplete) {
                this.props.setOnboardingComplete(true);
            }

            this.props.history.push('/wallet/');
        }

        // Dispose alerts on route change
        if (this.props.location.pathname !== nextProps.location.pathname) {
            this.props.dismissAlert();
        }
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
        Electron.removeEvent('url-params', this.onSetDeepUrl);
        Electron.removeEvent('account.switch', this.onAccountSwitch);
    }

    /**
     * Parse and verify deep link
     * Set valid deep link data to state
     * Navigate to Send view if wallet authenticated
     * @param {string} Data - data passed
     */
    setDeepUrl(data) {
        const { deepLinking, generateAlert, t } = this.props;

        this.props.initiateDeepLinkRequest();
        if (!deepLinking) {
            this.props.history.push('/settings/advanced');
            return generateAlert('info', t('deepLink:deepLinkingInfoTitle'), t('deepLink:deepLinkingInfoMessage'));
        }
        const parsedData = parseDeepLink(data);
        if (parsedData) {
            this.props.setDeepLinkContent(parsedData.amount, parsedData.address, parsedData.message);
            if (this.props.wallet.ready === true) {
                this.props.history.push('/wallet/send');
            }
        } else {
            generateAlert(
                'error',
                t('send:invalidAddress'),
                t('send:invalidAddressExplanation1', { maxLength: ADDRESS_LENGTH }),
            );
        }
    }

    Init = (props) => {
        return (
            <Loading
                inline
                transparent
                {...props}
                loop={false}
                onEnd={() => this.props.history.push('/onboarding/')}
                themeName={this.props.themeName}
            />
        );
    };

    /**
     * Check if key chain is available
     */
    async checkVaultAvailability() {
        try {
            await Electron.readKeychain(ALIAS_MAIN);
        } catch (err) {
            this.setState({
                fatalError: err instanceof Error && typeof err.message === 'string' ? err.message : err.toString(),
            });
        }
    }

    async versionCheck() {
        const data = await fetchVersions();
        const versionId = Electron.getVersion();
        if (versionId.includes('RC')) {
            this.props.displayTestWarning();
        } else if (data.desktopBlacklist && data.desktopBlacklist.includes(versionId)) {
            this.props.forceUpdate();
        } else if (data.latestDesktop && versionId !== data.latestDesktop) {
            this.props.shouldUpdate();
        }
    }

    /**
     * TEMPORARY: Checks if seed migration tool is up
     * @param {object} store
     *
     * @returns {Promise<object>}
     *
     */
    seedMigrationCheck() {
        return fetchIsSeedMigrationUp()
            .then(({ up }) => {
                if (up.match(VALID_IOTA_SUBDOMAIN_REGEX)) {
                    this.props.displaySeedMigrationAlert(up);
                }
            })
            .catch(() => {});
    }

    /**
     * Switch to an account based on account name
     * @param {string} accountName - target account name
     */
    accountSwitch(accountName) {
        const accountIndex = this.props.accountNames.indexOf(accountName);
        if (accountIndex > -1 && !this.props.isBusy) {
            this.props.setSeedIndex(accountIndex);
            this.props.history.push('/wallet');
        }
    }

    /**
     * Proxy native menu triggers to an action
     * @param {string} item - Triggered menu item
     */
    menuToggle(item) {
        if (!item) {
            return;
        }

        switch (item) {
            case 'about':
                // Is processed in ui/global/About
                break;
            case 'errorlog':
                // Is processed in ui/global/ErrorLog
                break;
            case 'feedback':
                // Is processed in ui/global/Feedback
                break;
            case 'addAccount':
                this.props.history.push('/onboarding/seed-intro');
                break;
            case 'logout':
                this.props.clearWalletData();
                this.props.setPassword({});
                this.props.setAccountInfoDuringSetup({
                    name: '',
                    meta: {},
                    completed: false,
                    usedExistingSeed: false,
                });
                Electron.setOnboardingSeed(null);
                this.props.history.push('/onboarding/login');
                break;
            default:
                if (item.indexOf('settings/account') === 0) {
                    this.props.history.push(`/${item}/${this.props.seedIndex}`);
                } else {
                    this.props.history.push(`/${item}`);
                }
                break;
        }
    }

    render() {
        const { location, history } = this.props;
        const { fatalError } = this.state;

        const currentKey = location.pathname.split('/')[1] || '/';

        if (fatalError && fatalError === 'Found old data' && currentKey !== 'settings') {
            return (
                <div>
                    <Theme history={history} />
                    <Titlebar path={currentKey} />
                    <FatalError error={fatalError} history={history} />
                </div>
            );
        }

        return (
            <div>
                <Titlebar path={currentKey} />
                <About />
                <ErrorLog />
                <Idle />
                <UpdateProgress />
                <Theme history={history} />
                <Ledger />
                <TransitionGroup>
                    <CSSTransition key={currentKey} classNames="fade" timeout={300}>
                        <div>
                            <Switch location={location}>
                                <Route
                                    exact
                                    path="/settings/:setting?/:subsetting?/:accountIndex?"
                                    component={Settings}
                                />
                                <Route path="/wallet" component={Wallet} />
                                <Route path="/onboarding" component={Onboarding} />
                                <Route loop={false} component={this.Init} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    seedIndex: state.wallet.seedIndex,
    accountNames: getAccountNamesFromState(state),
    addingAdditionalAccount: isSettingUpNewAccount(state),
    locale: state.settings.locale,
    wallet: state.wallet,
    themeName: state.settings.themeName,
    onboardingComplete: state.accounts.onboardingComplete,
    hasErrorFetchingFullAccountInfo: state.ui.hasErrorFetchingFullAccountInfo,
    deepLinking: state.settings.deepLinking,
    isBusy:
        !state.wallet.ready || state.ui.isSyncing || state.ui.isSendingTransfer || state.ui.isGeneratingReceiveAddress,
    alerts: state.alerts,
});

const mapDispatchToProps = {
    clearWalletData,
    setPassword,
    initiateDeepLinkRequest,
    setDeepLinkContent,
    setSeedIndex,
    dismissAlert,
    generateAlert,
    fetchNodeList,
    updateTheme,
    setOnboardingComplete,
    setAccountInfoDuringSetup,
    shouldUpdate,
    forceUpdate,
    displayTestWarning,
    displaySeedMigrationAlert,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withTranslation()(App)));
