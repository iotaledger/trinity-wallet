/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import i18next from 'libs/i18next';
import { withI18n } from 'react-i18next';

import { parseAddress } from 'libs/iota/utils';
import { ACC_MAIN } from 'libs/crypto';

import { getAccountNamesFromState } from 'selectors/accounts';

import { setPassword, clearWalletData, setDeepLink, setSeedIndex, setAdditionalAccountInfo } from 'actions/wallet';
import { updateTheme } from 'actions/settings';
import { fetchNodeList } from 'actions/polling';
import { dismissAlert, generateAlert } from 'actions/alerts';

import Theme from 'ui/global/Theme';
import Idle from 'ui/global/Idle';
import Titlebar from 'ui/global/Titlebar';
import FatalError from 'ui/global/FatalError';
import About from 'ui/global/About';
import ErrorLog from 'ui/global/ErrorLog';

import Loading from 'ui/components/Loading';

import Onboarding from 'ui/views/onboarding/Index';
import Wallet from 'ui/views/wallet/Index';
import Settings from 'ui/views/settings/Index';
import Account from 'ui/views/account/Index';

import withAutoNodeSwitching from 'containers/global/AutoNodeSwitching';

import css from './index.scss';

/**
 * Wallet wrapper component
 **/
class App extends React.Component {
    static propTypes = {
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        isBusy: PropTypes.bool.isRequired,
        /** @ignore */
        location: PropTypes.object,
        /** @ignore */
        history: PropTypes.object.isRequired,
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
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setDeepLink: PropTypes.func.isRequired,
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
    }

    componentWillReceiveProps(nextProps) {
        /* On language change */
        if (nextProps.locale !== this.props.locale) {
            i18next.changeLanguage(nextProps.locale);
            Electron.changeLanguage(this.props.t);
        }

        const currentKey = this.props.location.pathname.split('/')[1] || '/';

        /* On Login */
        if (!this.props.wallet.ready && nextProps.wallet.ready && currentKey === 'onboarding') {
            Electron.updateMenu('authorised', true);

            // If there was an error adding additional seed, go back to onboarding
            if (
                this.props.wallet.addingAdditionalAccount &&
                !nextProps.wallet.addingAdditionalAccount &&
                nextProps.wallet.additionalAccountName.length
            ) {
                return this.props.history.push('/onboarding/account-name');
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
        const { generateAlert, t } = this.props;

        const parsedData = parseAddress(data);

        if (parsedData) {
            this.props.setDeepLink(
                parsedData.amount ? String(parsedData.amount) : '0',
                parsedData.address,
                parsedData.message || '',
            );
            if (this.props.wallet.ready === true) {
                this.props.history.push('/wallet/send');
            }
        } else {
            generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation1'));
        }
    }

    /**
     * Check if key chain is available
     */
    async checkVaultAvailability() {
        try {
            await Electron.readKeychain(ACC_MAIN);
        } catch (err) {
            this.setState({
                fatalError: true,
            });
        }
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
                this.props.setAdditionalAccountInfo({
                    additionalAccountName: '',
                    addingAdditionalAccount: false,
                    additionalAccountType: '',
                });
                Electron.setOnboardingSeed(null);
                this.props.history.push('/onboarding/login');
                break;
            default:
                this.props.history.push(`/${item}`);
                break;
        }
    }

    Init = (props) => {
        return (
            <Loading inline transparent {...props} loop={false} onEnd={() => this.props.history.push('/onboarding/')} />
        );
    };

    render() {
        const { location, history } = this.props;

        const currentKey = location.pathname.split('/')[1] || '/';

        if (this.state.fatalError) {
            return (
                <div className={css.trintiy}>
                    <Theme history={history} />
                    <Titlebar />
                    <FatalError />
                </div>
            );
        }

        return (
            <div className={css.trintiy}>
                <Titlebar />
                <About />
                <ErrorLog />
                <Idle />
                <Theme history={history} />
                <TransitionGroup>
                    <CSSTransition key={currentKey} classNames="fade" timeout={300}>
                        <div>
                            <Switch location={location}>
                                <Route exact path="/settings/:setting?" component={Settings} />
                                <Route exact path="/account/:setting?" component={Account} />
                                <Route path="/wallet" component={Wallet} />
                                <Route path="/onboarding" component={Onboarding} />
                                <Route exact path="/" loop={false} component={this.Init} />
                            </Switch>
                        </div>
                    </CSSTransition>
                </TransitionGroup>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    locale: state.settings.locale,
    wallet: state.wallet,
    themeName: state.settings.themeName,
    isBusy:
        !state.wallet.ready || state.ui.isSyncing || state.ui.isSendingTransfer || state.ui.isGeneratingReceiveAddress,
});

const mapDispatchToProps = {
    clearWalletData,
    setPassword,
    setDeepLink,
    setSeedIndex,
    dismissAlert,
    generateAlert,
    fetchNodeList,
    updateTheme,
    setAdditionalAccountInfo,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(withI18n()(withAutoNodeSwitching(App))));
