/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { Switch, Route, withRouter } from 'react-router-dom';
import { TransitionGroup, CSSTransition } from 'react-transition-group';
import i18next from 'libs/i18next';
import { translate } from 'react-i18next';

import { parseAddress } from 'libs/iota/utils';
import { ACC_MAIN } from 'libs/crypto';

import { setPassword, clearWalletData, setDeepLink } from 'actions/wallet';
import { updateTheme } from 'actions/settings';
import { fetchNodeList } from 'actions/polling';
import { disposeOffAlert, generateAlert } from 'actions/alerts';

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
        disposeOffAlert: PropTypes.func.isRequired,
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
        this.props.fetchNodeList();

        Electron.onEvent('menu', this.onMenuToggle);

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
            this.props.disposeOffAlert();
        }
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
        Electron.removeEvent('url-params', this.onSetDeepUrl);
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
     * Proxy native menu triggers to an action
     * @param {string} Item - Triggered menu item
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
    locale: state.settings.locale,
    wallet: state.wallet,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    clearWalletData,
    setPassword,
    setDeepLink,
    disposeOffAlert,
    generateAlert,
    fetchNodeList,
    updateTheme,
};

export default withRouter(connect(mapStateToProps, mapDispatchToProps)(translate()(withAutoNodeSwitching(App))));
