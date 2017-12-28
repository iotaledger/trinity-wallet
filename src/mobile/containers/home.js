import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { StyleSheet, View, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import UserInactivity from 'react-native-user-inactivity';
import KeepAwake from 'react-native-keep-awake';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { clearTempData, setPassword } from 'iota-wallet-shared-modules/actions/tempAccount';
import { setFirstUse } from 'iota-wallet-shared-modules/actions/account';
import { setUserActivity } from 'iota-wallet-shared-modules/actions/app';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import balanceImagePath from 'iota-wallet-shared-modules/images/balance.png';
import sendImagePath from 'iota-wallet-shared-modules/images/send.png';
import receiveImagePath from 'iota-wallet-shared-modules/images/receive.png';
import historyImagePath from 'iota-wallet-shared-modules/images/history.png';
import settingsImagePath from 'iota-wallet-shared-modules/images/settings.png';
import StatefulDropdownAlert from './statefulDropdownAlert';
import TopBar from './topBar';
import withUserActivity from '../components/withUserActivity';
import Promoter from './promoter';
import COLORS from '../theme/Colors';
import Tabs from '../components/tabs';
import Tab from '../components/tab';
import TabContent from '../components/tabContent';
import EnterPassword from '../components/enterPassword';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    topContainer: {
        flex: 0.8,
        marginBottom: height / 100,
    },
    balance: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.9,
        paddingTop: height / 150,
    },
    midContainer: {
        flex: 4.62,
        zIndex: 0,
    },
    bottomContainer: {
        flex: 0.68,
    },
    dropdownTitle: {
        fontSize: width / 25.9,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        paddingLeft: width / 20,
        paddingRight: width / 15,
        paddingVertical: height / 30,
    },
    dropdownMessage: {
        fontSize: width / 29.6,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        paddingTop: height / 60,
    },
    dropdownImage: {
        marginLeft: width / 25,
        width: width / 12,
        height: width / 12,
        alignSelf: 'center',
    },
});

class Home extends Component {
    onLoginPress = password => {
        const { t, tempAccount } = this.props;

        if (!password) {
            this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        } else if (password !== tempAccount.password) {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        } else {
            this.props.setUserActivity({ inactive: false });
        }
    };

    handleInactivity = () => {
        const { setUserActivity } = this.props;
        setUserActivity({ inactive: true });
    };

    render() {
        const { t, navigator, inactive, minimised, startBackgroundProcesses, endBackgroundProcesses } = this.props;

        return (
            <UserInactivity timeForInactivity={300000} checkInterval={2000} onInactivity={this.handleInactivity}>
                <View style={{ flex: 1, backgroundColor: COLORS.backgroundGreen }}>
                    <StatusBar barStyle="light-content" />
                    {!inactive &&
                        !minimised && (
                            <View style={{ flex: 1 }}>
                                <View style={styles.topContainer} />
                                <View style={styles.midContainer}>
                                    <TabContent
                                        navigator={navigator}
                                        startBackgroundProcesses={startBackgroundProcesses}
                                        endBackgroundProcesses={endBackgroundProcesses}
                                    />
                                </View>
                                <View style={styles.bottomContainer}>
                                    <Tabs onPress={name => this.props.changeHomeScreenRoute(name)}>
                                        <Tab name="balance" icon={balanceImagePath} text={t('home:balance')} />
                                        <Tab name="send" icon={sendImagePath} text={t('home:send')} />
                                        <Tab name="receive" icon={receiveImagePath} text={t('home:receive')} />
                                        <Tab name="history" icon={historyImagePath} text={t('home:history')} />
                                        <Tab name="settings" icon={settingsImagePath} text={t('home:settings')} />
                                    </Tabs>
                                </View>
                                <TopBar />
                            </View>
                        )}
                    {inactive && (
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                            <EnterPassword onLoginPress={this.onLoginPress} />
                        </View>
                    )}
                    {minimised && <View />}
                    <Promoter />
                    <StatefulDropdownAlert />
                    <KeepAwake />
                </View>
            </UserInactivity>
        );
    }
}

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    settings: state.settings,
    account: state.account,
    inactive: state.app.inactive,
    minimised: state.app.minimised,
});

const mapDispatchToProps = {
    changeHomeScreenRoute,
    generateAlert,
    setFirstUse,
    clearTempData,
    setPassword,
    setUserActivity,
};

Home.propTypes = {
    setFirstUse: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    navigator: PropTypes.object.isRequired,
    changeHomeScreenRoute: PropTypes.func.isRequired,
    generateAlert: PropTypes.func.isRequired,
    setUserActivity: PropTypes.func.isRequired,
    inactive: PropTypes.bool.isRequired,
    minimised: PropTypes.bool.isRequired,
    startBackgroundProcesses: PropTypes.func.isRequired,
    endBackgroundProcesses: PropTypes.func.isRequired,
};

export default withUserActivity()(
    translate(['home', 'global', 'login'])(connect(mapStateToProps, mapDispatchToProps)(Home)),
);
