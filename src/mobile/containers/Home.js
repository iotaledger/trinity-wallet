import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, KeyboardAvoidingView } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { setPassword, setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { setUserActivity } from 'iota-wallet-shared-modules/actions/ui';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { getPasswordHash } from '../utils/crypto';
import DynamicStatusBar from '../components/DynamicStatusBar';
import UserInactivity from '../components/UserInactivity';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import TopBar from './TopBar';
import WithUserActivity from '../components/UserActivity';
import WithBackPress from '../components/BackPress';
import PollComponent from './Poll';
import Tabs from '../components/Tabs';
import Tab from '../components/Tab';
import TabContent from '../components/TabContent';
import EnterPassword from '../containers/EnterPassword';

const styles = StyleSheet.create({
    topContainer: {
        flex: 0.7,
    },
    midContainer: {
        flex: 4.72,
        zIndex: 0,
    },
    bottomContainer: {
        flex: 0.68,
    },
});

class Home extends Component {
    static propTypes = {
        /** Translation helper
       * @param {string} translationString - locale string identifier to be translated
       */
        t: PropTypes.func.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Updates home screen children route name
       * @param {string} name - route name
       */
        changeHomeScreenRoute: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Set application activity state
         * @param {object} options - minimzed, active, inactive
         */
        setUserActivity: PropTypes.func.isRequired,
        /** Determines if the application is inactive */
        inactive: PropTypes.bool.isRequired,
        /** Determines if the application is minimised */
        minimised: PropTypes.bool.isRequired,
        /** Hash for wallet's password */
        storedPassword: PropTypes.string.isRequired,
        /** Determines if wallet is doing snapshot transition */
        isTransitioning: PropTypes.bool.isRequired,
        /** Determines if wallet is doing a manual sync */
        isSyncing: PropTypes.bool.isRequired,
        /** Determines if wallet is making a transaction */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** Change current setting
        * @param {string} setting
        */
        setSetting: PropTypes.func.isRequired,
        /** Determines whether fingerprint is enabled */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** Currently selected setting */
        currentSetting: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    constructor(props) {
        super(props);
        this.onLoginPress = this.onLoginPress.bind(this);
    }

    componentDidMount() {
        this.userInactivity.setActiveFromComponent();
    }

    shouldComponentUpdate(newProps) {
        const { isSyncing, isSendingTransfer, isTransitioning } = this.props;

        if (isSyncing !== newProps.isSyncing) {
            return false;
        }

        if (isSendingTransfer !== newProps.isSendingTransfer) {
            return false;
        }

        if (isTransitioning !== newProps.isTransitioning) {
            return false;
        }

        return true;
    }

    onLoginPress = (password) => {
        const { t, storedPassword } = this.props;
        const pwdHash = getPasswordHash(password);

        if (!password) {
            this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        } else if (storedPassword !== pwdHash) {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        } else {
            this.props.setUserActivity({ inactive: false });
        }
    };

    onTabSwitch(name) {
        this.props.changeHomeScreenRoute(name);
        this.resetSettings();
    }

    resetSettings() {
        const { currentSetting } = this.props;

        if (currentSetting !== 'mainSettings') {
            this.props.setSetting('mainSettings');
        }
    }

    handleInactivity = () => {
        const { isTransitioning, isSyncing, isSendingTransfer } = this.props;
        const doingSomething = isTransitioning || isSyncing || isSendingTransfer;
        if (doingSomething) {
            this.userInactivity.setActiveFromComponent();
        } else {
            this.resetSettings();
            this.props.setUserActivity({ inactive: true });
        }
    };

    render() {
        const {
            t,
            navigator,
            inactive,
            minimised,
            theme: {
                bar,
                body,
                negative,
                positive,
                primary,
            },
            isFingerprintEnabled,
        } = this.props;

        const barTextColor = { color: bar.color };
        const textColor = { color: body.color };

        return (
            <UserInactivity
                ref={(c) => {
                    this.userInactivity = c;
                }}
                timeForInactivity={180000}
                checkInterval={3000}
                onInactivity={this.handleInactivity}
            >
                <KeyboardAwareScrollView
                    resetScrollToCoords={{ x: 0, y: 0 }}
                    scrollEnabled={false}
                    enableOnAndroid={false}
                    contentContainerStyle={{ flex: 1, backgroundColor: body.bg }}
                >
                    <KeyboardAvoidingView style={{ flex: 1 }}>
                        <DynamicStatusBar backgroundColor={bar.bg} />
                        {!inactive &&
                            !minimised && (
                                <View style={{ flex: 1 }}>
                                    <View style={styles.topContainer} />
                                    <View style={styles.midContainer}>
                                        <TabContent
                                            navigator={navigator}
                                            onTabSwitch={(name) => this.onTabSwitch(name)}
                                        />
                                    </View>
                                    <View style={styles.bottomContainer}>
                                        <Tabs onPress={(name) => this.onTabSwitch(name)} barBg={bar.bg}>
                                            <Tab
                                                name="balance"
                                                icon="wallet"
                                                iconColor={bar.color}
                                                activeBorderColor={primary.color}
                                                activeColor={bar.alt}
                                                textColor={barTextColor}
                                                text={t('home:balance').toUpperCase()}
                                            />
                                            <Tab
                                                name="send"
                                                icon="send"
                                                iconColor={bar.color}
                                                activeBorderColor={primary.color}
                                                activeColor={bar.alt}
                                                textColor={barTextColor}
                                                text={t('home:send').toUpperCase()}
                                            />
                                            <Tab
                                                name="receive"
                                                icon="receive"
                                                iconColor={bar.color}
                                                activeBorderColor={primary.color}
                                                activeColor={bar.alt}
                                                textColor={barTextColor}
                                                text={t('home:receive').toUpperCase()}
                                            />
                                            <Tab
                                                name="history"
                                                icon="history"
                                                iconColor={bar.color}
                                                activeBorderColor={primary.color}
                                                activeColor={bar.alt}
                                                textColor={barTextColor}
                                                text={t('home:history').toUpperCase()}
                                            />
                                            <Tab
                                                name="settings"
                                                icon="settings"
                                                iconColor={bar.color}
                                                activeBorderColor={primary.color}
                                                activeColor={bar.alt}
                                                textColor={barTextColor}
                                                text={t('home:settings').toUpperCase()}
                                            />
                                        </Tabs>
                                    </View>
                                    <TopBar />
                                </View>
                            )}
                        {inactive && (
                            <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                                <EnterPassword
                                    onLoginPress={this.onLoginPress}
                                    backgroundColor={body.bg}
                                    negativeColor={negative.color}
                                    positiveColor={positive.color}
                                    bodyColor={body.color}
                                    textColor={textColor}
                                    isFingerprintEnabled={isFingerprintEnabled}
                                />
                            </View>
                        )}
                        {minimised && <View />}
                        <PollComponent />
                        <StatefulDropdownAlert backgroundColor={bar.bg} />
                    </KeyboardAvoidingView>
                </KeyboardAwareScrollView>
            </UserInactivity>
        );
    }
}

const mapStateToProps = (state) => ({
    storedPassword: state.wallet.password,
    inactive: state.ui.inactive,
    minimised: state.ui.minimised,
    theme: state.settings.theme,
    currentRoute: state.home.childRoute,
    isSyncing: state.ui.isSyncing,
    isSendingTransfer: state.ui.isSendingTransfer,
    isTransitioning: state.ui.isTransitioning,
    currentSetting: state.wallet.currentSetting,
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    generateAlert,
    setPassword,
    setUserActivity,
    setSetting,
};

export default WithUserActivity()(
    WithBackPress()(translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home))),
);
