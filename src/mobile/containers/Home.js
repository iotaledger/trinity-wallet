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
import EnterPassword from '../components/EnterPassword';

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
            bar,
            body,
            negative,
            positive,
            isFingerprintEnabled,
            primary,
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
    inactive: state.wallet.inactive,
    minimised: state.wallet.minimised,
    body: state.settings.theme.body,
    negative: state.settings.theme.negative,
    positive: state.settings.theme.positive,
    primary: state.settings.theme.primary,
    bar: state.settings.theme.bar,
    currentRoute: state.home.childRoute,
    isSyncing: state.wallet.isSyncing,
    isSendingTransfer: state.wallet.isSendingTransfer,
    isTransitioning: state.wallet.isTransitioning,
    currentSetting: state.wallet.currentSetting,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    generateAlert,
    setPassword,
    setUserActivity,
    setSetting,
};

Home.propTypes = {
    t: PropTypes.func.isRequired,
    navigator: PropTypes.object.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    generateAlert: PropTypes.func.isRequired,
    setUserActivity: PropTypes.func.isRequired,
    inactive: PropTypes.bool.isRequired,
    minimised: PropTypes.bool.isRequired,
    body: PropTypes.object.isRequired,
    negative: PropTypes.object.isRequired,
    positive: PropTypes.object.isRequired,
    storedPassword: PropTypes.string.isRequired,
    bar: PropTypes.object.isRequired,
    primary: PropTypes.object.isRequired,
    isTransitioning: PropTypes.bool.isRequired,
    isSyncing: PropTypes.bool.isRequired,
    isSendingTransfer: PropTypes.bool.isRequired,
    setSetting: PropTypes.func.isRequired,
    isFingerprintEnabled: PropTypes.bool,
    currentSetting: PropTypes.string.isRequired,
};

Home.defaultProps = {
    isFingerprintEnabled: false,
};

export default WithUserActivity()(
    WithBackPress()(translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home))),
);
