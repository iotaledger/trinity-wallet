/*global Electron*/
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
import { getUpdateData, updateTheme } from 'actions/settings';
import { fetchNodeList } from 'actions/polling';
import { disposeOffAlert, generateAlert } from 'actions/alerts';

import Theme from 'ui/global/Theme';
import Idle from 'ui/global/Idle';
import Titlebar from 'ui/global/Titlebar';
import FatalError from 'ui/global/FatalError';
import About from 'ui/global/About';

import Loading from 'ui/components/Loading';

import Onboarding from 'ui/views/onboarding/Index';
import Wallet from 'ui/views/wallet/Index';
import Settings from 'ui/views/settings/Index';
import Account from 'ui/views/account/Index';
import Activation from 'ui/views/onboarding/Activation';

import withAutoNodeSwitching from 'containers/global/AutoNodeSwitching';

import css from './index.scss';

/** Main wallet wrapper component */
class App extends React.Component {
    static propTypes = {
        /** Alpha versiona ctivation code */
        activationCode: PropTypes.string,
        /** Browser location */
        location: PropTypes.object,
        /** Browser histoty object */
        history: PropTypes.object.isRequired,
        /** Settings state state data
         * @ignore
         */
        settings: PropTypes.object.isRequired,
        /** Accounts state state data
         * @ignore
         */
        accounts: PropTypes.object.isRequired,
        /** wallet state data
         * @ignore
         */
        wallet: PropTypes.object.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Clear  alert state data
         * @ignore
         */
        disposeOffAlert: PropTypes.func.isRequired,
        /** Clear wallet state data
         * @ignore
         */
        clearWalletData: PropTypes.func.isRequired,
        /** Set password state
         * @param {String} password - Current password
         * @ignore
         */
        setPassword: PropTypes.func.isRequired,
        /** Fetches remote node list
         * @ignore
         */
        fetchNodeList: PropTypes.func.isRequired,
        /** Initiate update check
         * @param {Boolean} force - Force update confirmation dialog
         * @ignore
         */
        getUpdateData: PropTypes.func.isRequired,
        /** Current theme name
         * @ignore
         */
        themeName: PropTypes.string.isRequired,
        /** Change theme
         * @param {Object} theme - Theme object
         * @param {String} name - Theme name
         * @ignore
         */
        updateTheme: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
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

        try {
            this.checkVaultAvailability();
        } catch (error) {
            // eslint-disable-next-line react/no-did-mount-set-state
            this.setState({
                fatalError: true,
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        /* On language change */
        if (nextProps.settings.locale !== this.props.settings.locale) {
            i18next.changeLanguage(nextProps.settings.locale);
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
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
        Electron.removeEvent('url-params', this.onSetDeepUrl);
    }

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

    async checkVaultAvailability() {
        try {
            await Electron.readKeychain(ACC_MAIN);
        } catch (err) {
            this.setState({
                fatalError: true,
            });
        }
    }

    menuToggle(item) {
        switch (item) {
            case 'about':
                // Is processed in About component
                break;
            case 'feedback':
                // Is processed in Feedback component
                break;
            case 'addAccount':
                this.props.history.push('/onboarding/seed-intro');
                break;
            case 'update':
                this.props.getUpdateData(true);
                break;
            case 'logout':
                this.props.clearWalletData();
                this.props.setPassword('');
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
        const { accounts, location, activationCode, settings } = this.props;

        const currentKey = location.pathname.split('/')[1] || '/';

        if (this.state.fatalError) {
            return (
                <div className={css.trintiy}>
                    <Titlebar />
                    <FatalError />
                </div>
            );
        }

        if (!activationCode) {
            return (
                <div className={css.trintiy}>
                    <Titlebar />
                    <Activation />
                </div>
            );
        }

        return (
            <div className={css.trintiy}>
                <Titlebar />
                <About />
                <Idle timeout={settings.lockScreenTimeout} />
                <Theme location={location} />
                <TransitionGroup>
                    <CSSTransition key={currentKey} classNames="fade" timeout={300}>
                        <div>
                            <Switch location={location}>
                                <Route exact path="/settings/:setting?" component={Settings} />
                                <Route exact path="/account/:setting?" component={Account} />
                                <Route path="/wallet" component={Wallet} />
                                <Route
                                    path="/onboarding"
                                    complete={accounts.onboardingComplete}
                                    component={Onboarding}
                                />
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
    settings: state.settings,
    accounts: state.accounts,
    wallet: state.wallet,
    activationCode: state.app.activationCode,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    clearWalletData,
    setPassword,
    setDeepLink,
    getUpdateData,
    disposeOffAlert,
    generateAlert,
    fetchNodeList,
    updateTheme,
};

export default withRouter(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(translate()(withAutoNodeSwitching(App))),
);
