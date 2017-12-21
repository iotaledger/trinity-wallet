import get from 'lodash/get';
import React from 'react';
import { StyleSheet, View, Text, StatusBar, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { getCurrencyData, setFullNode } from 'iota-wallet-shared-modules/actions/settings';
import { setPassword, clearTempData, setReady } from 'iota-wallet-shared-modules/actions/tempAccount';
import { getAccountInfo, getFullAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import keychain, { getSeed } from '../util/keychain';
import { TextField } from 'react-native-material-textfield';
import OnboardingButtons from '../components/onboardingButtons.js';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import Modal from 'react-native-modal';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import NodeSelection from '../components/nodeSelection.js';
import COLORS from '../theme/Colors';
import EnterPassword from '../components/EnterPassword';

const StatusBarDefaultBarStyle = 'light-content';

import { width, height } from '../util/dimensions';

class Login extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isModalVisible: false,
        };
        this.onLoginPress = this.onLoginPress.bind(this);
        this.onNodeError = this.onNodeError.bind(this);
    }

    _showModal = data => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    navigateToNodeSelection() {
        this._hideModal();
        this.setState({ changingNode: true });
    }

    _renderModalContent = () => (
        <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor: COLORS.backgroundGreen }}>
            <View style={styles.modalContent}>
                <Text style={styles.questionText}>{t('selectDifferentNode')}</Text>
                <OnboardingButtons
                    onLeftButtonPress={() => this._hideModal()}
                    onRightButtonPress={() => this.navigateToNodeSelection()}
                    leftText={t('global:no')}
                    rightText={t('global:yes')}
                />
            </View>
        </View>
    );

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
            const seedName = this.props.account.seedNames[seedIndex];

            this.getWalletData();
            this.props.changeHomeScreenRoute('balance');
            this.props.navigator.push({
                screen: 'loading',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                },
                animated: false,
                overrideBackPress: true,
            });
            this.props.getCurrencyData(this.props.settings.currency);
            if (this.props.account.firstUse) {
                this.props.getFullAccountInfo(value, seedName, (error, success) => {
                    if (error) {
                        this.onNodeError();
                    } else {
                        this.props.setReady();
                    }
                });
            } else {
                const accountInfo = this.props.account.accountInfo;
                this.props.getAccountInfo(seedName, seedIndex, accountInfo, (error, success) => {
                    if (error) {
                        this.onNodeError();
                    } else {
                        this.props.setReady();
                    }
                });
            }
        };
    }

    onNodeError() {
        const { t } = this.props;
        this.props.navigator.pop({
            animated: false,
        });
        this.dropdown.alertWithType('error', t('global:invalidResponse'), t('global:invalidResponseExplanation'));
        this._showModal();
    }

    onUseSeedPress() {
        const { t } = this.props;
        this.dropdown.alertWithType('error', t('global:notAvailable'), t('global:notAvailableExplanation'));
        {
            /* this.props.navigator.push({
            screen: 'useSeed',
            navigatorStyle: {
                navBarHidden: true,
            },
            animated: false,
            overrideBackPress: true
        }); */
        }
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
                                nodes={this.props.settings.availableNodes}
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
    questionText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.25,
        textAlign: 'center',
        paddingLeft: width / 7,
        paddingRight: width / 7,
        paddingTop: height / 25,
        backgroundColor: 'transparent',
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
        borderRadius: 10,
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
