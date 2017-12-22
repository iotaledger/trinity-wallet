import get from 'lodash/get';
import { translate } from 'react-i18next';
import React from 'react';
import Modal from 'react-native-modal';
import { StyleSheet, View, Text, StatusBar, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import DropdownAlert from 'react-native-dropdownalert/DropdownAlert';
import { Navigation } from 'react-native-navigation';

import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { getCurrencyData, setFullNode } from 'iota-wallet-shared-modules/actions/settings';
import { setPassword, clearTempData, setReady } from 'iota-wallet-shared-modules/actions/tempAccount';
import { getAccountInfo, getFullAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';

import OnboardingButtons from '../components/onboardingButtons';
import NodeSelection from '../components/nodeSelection';
import EnterPassword from '../components/enterPassword';
import keychain, { getSeed } from '../util/keychain';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

const StatusBarDefaultBarStyle = 'light-content';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
        };
        this.onLoginPress = this.onLoginPress.bind(this);
        this.onNodeError = this.onNodeError.bind(this);
    }

    componentDidMount() {
        this.getWalletData();
    }

    _showModal = data => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    navigateToNodeSelection() {
        this._hideModal();
        this.setState({ changingNode: true });
    }

    _renderModalContent = () => {
        return (
            <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor: COLORS.backgroundGreen }}>
                <View style={styles.modalContent}>
                    <Text style={styles.questionText}>Cannot connect to IOTA node.</Text>
                    <Text style={styles.infoText}>Do you want to select a different node?</Text>
                    <OnboardingButtons
                        onLeftButtonPress={() => this._hideModal()}
                        onRightButtonPress={() => this.navigateToNodeSelection()}
                        leftText={'NO'}
                        rightText={'YES'}
                    />
                </View>
            </View>
        );
    };

    getWalletData() {
        this.props.getChartData();
        this.props.getPrice();
        this.props.getMarketData();
    }

    onLoginPress(password) {
        const { t, setPassword } = this.props;
        Keyboard.dismiss();
        if (!password) {
            this.dropdown.alertWithType('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            keychain
                .get()
                .then(credentials => {
                    setPassword(password);
                    const hasData = get(credentials, 'data');
                    const hasCorrectPassword = get(credentials, 'password') === password;

                    if (hasData && hasCorrectPassword) {
                        const seed = getSeed(credentials.data, 0);
                        login(seed);
                    } else {
                        error();
                    }
                })
                .catch(err => console.log(err)); // Dropdown
        }

        error = () => {
            this.dropdown.alertWithType(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        };

        login = value => {
            const seedIndex = this.props.tempAccount.seedIndex;
            const accountName = this.props.account.seedNames[seedIndex];
            const accountInfo = this.props.account.accountInfo;
            this.props.changeHomeScreenRoute('balance');
            this.props.getCurrencyData(this.props.settings.currency);
            if (this.props.account.firstUse) {
                this.navigateToLoading();
                this.props.getFullAccountInfo(value, accountName, (error, success) => {
                    if (error) {
                        this.onNodeError();
                    } else {
                        this.props.setReady();
                    }
                });
            } else {
                const currentSeedAccountInfo = accountInfo[Object.keys(accountInfo)[seedIndex]];
                const addresses = currentSeedAccountInfo.addresses;
                if (addresses.length > 0) {
                    this.navigateToLoading();
                    this.props.getAccountInfo(accountName, seedIndex, accountInfo, (error, success) => {
                        if (error) {
                            this.onNodeError();
                        } else {
                            this.props.setReady();
                        }
                    });
                } else {
                    this.navigateToHome();
                }
            }
        };
    }

    navigateToLoading() {
        this.props.navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    navigateToHome() {
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: COLORS.backgroundGreen,
                },
                overrideBackPress: true,
            },
        });
    }

    onNodeError() {
        const { t } = this.props;
        this.props.navigator.pop({
            animated: false,
        });
        this.dropdown.alertWithType('error', t('global:invalidResponse'), t('global:invalidResponseExplanation'));
        this._showModal();
    }

    render() {
        const { password } = this.state;
        const { t } = this.props;
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                {!this.state.changingNode && <EnterPassword onLoginPress={this.onLoginPress} />}
                {this.state.changingNode && (
                    <View>
                        <View style={{ flex: 0.8 }} />
                        <View style={{ flex: 4.62 }}>
                            <NodeSelection
                                setNode={selectedNode => {
                                    changeIotaNode(selectedNode);
                                    this.props.setFullNode(selectedNode);
                                }}
                                node={this.props.settings.fullNode}
                                nodes={this.props.settings.availablePoWNodes}
                                backPress={() => this.setState({ changingNode: false })}
                            />
                        </View>
                        <View style={{ flex: 0.2 }} />
                    </View>
                )}
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
                    successColor="#009f3f"
                    errorColor="#A10702"
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle={StatusBarDefaultBarStyle}
                    closeInterval={6000}
                />
                <Modal
                    animationIn={'bounceInUp'}
                    animationOut={'bounceOut'}
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={'#132d38'}
                    backdropOpacity={0.6}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalVisible}
                >
                    {this._renderModalContent()}
                </Modal>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGreen,
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
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingVertical: height / 18,
        width: width / 1.15,
    },
    questionText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 40,
    },
    infoText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 16,
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
    marketData: state.marketData,
    settings: state.settings,
});

const mapDispatchToProps = {
    setPassword,
    getAccountInfo,
    getFullAccountInfo,
    changeHomeScreenRoute,
    getMarketData,
    getPrice,
    getChartData,
    clearTempData,
    getCurrencyData,
    setReady,
    setFullNode,
};

export default translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(Login));
