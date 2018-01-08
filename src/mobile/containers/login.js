import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import { translate } from 'react-i18next';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import { StyleSheet, View, Text, StatusBar, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { getMarketData, getChartData, getPrice } from 'iota-wallet-shared-modules/actions/marketData';
import { getCurrencyData, setFullNode } from 'iota-wallet-shared-modules/actions/settings';
import { setPassword, setReady } from 'iota-wallet-shared-modules/actions/tempAccount';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import { getSelectedAccountViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import OnboardingButtons from '../components/onboardingButtons';
import NodeSelection from '../components/nodeSelection';
import whiteArrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left-white.png';
import blackArrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left-black.png';
import whiteTickImagePath from 'iota-wallet-shared-modules/images/tick-white.png';
import blackTickImagePath from 'iota-wallet-shared-modules/images/tick-black.png';
import EnterPasswordOnLogin from '../components/enterPasswordOnLogin';
import StatefulDropdownAlert from './statefulDropdownAlert';
import keychain from '../util/keychain';
import THEMES from '../theme/themes';
import GENERAL from '../theme/general';
import { setSetting } from 'iota-wallet-shared-modules/actions/tempAccount';
import { changeHomeScreenRoute } from 'iota-wallet-shared-modules/actions/home';
import { width, height } from '../util/dimensions';
import KeepAwake from 'react-native-keep-awake';

class Login extends Component {
    static propTypes = {
        firstUse: PropTypes.bool.isRequired,
        hasErrorFetchingAccountInfoOnLogin: PropTypes.bool.isRequired,
        selectedAccount: PropTypes.object.isRequired,
        fullNode: PropTypes.string.isRequired,
        availablePoWNodes: PropTypes.array.isRequired,
        currency: PropTypes.string.isRequired,
        setPassword: PropTypes.func.isRequired,
        getMarketData: PropTypes.func.isRequired,
        getPrice: PropTypes.func.isRequired,
        getChartData: PropTypes.func.isRequired,
        getCurrencyData: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        setFullNode: PropTypes.func.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        positiveColor: PropTypes.object.isRequired,
        negativeColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.state = {
            isModalVisible: false,
        };

        this.onLoginPress = this.onLoginPress.bind(this);
        this.navigateToNodeSelection = this.navigateToNodeSelection.bind(this);
    }

    componentDidMount() {
        const { currency } = this.props;
        this.getWalletData();
        this.props.getCurrencyData(currency);
        KeepAwake.deactivate();
    }

    componentWillReceiveProps(newProps) {
        if (newProps.hasErrorFetchingAccountInfoOnLogin && !this.props.hasErrorFetchingAccountInfoOnLogin) {
            this._showModal();
        }
    }

    _showModal = data => this.setState({ isModalVisible: true });

    _hideModal = () => this.setState({ isModalVisible: false });

    navigateToNodeSelection() {
        this._hideModal();
        this.setState({ changingNode: true });
    }

    _renderModalContent = () => {
        const { backgroundColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        return (
            <View
                style={{ width: width / 1.15, alignItems: 'center', backgroundColor: THEMES.getHSL(backgroundColor) }}
            >
                <View style={styles.modalContent}>
                    <Text style={[styles.questionText, textColor]}>Cannot connect to IOTA node.</Text>
                    <Text style={[styles.infoText, textColor]}>Do you want to select a different node?</Text>
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
        const { firstUse, t, setPassword, selectedAccount } = this.props;

        Keyboard.dismiss();

        if (!password) {
            this.props.generateAlert('error', t('emptyPassword'), t('emptyPasswordExplanation'));
        } else {
            keychain
                .get()
                .then(credentials => {
                    const hasData = get(credentials, 'data');
                    const hasCorrectPassword = get(credentials, 'password') === password;
                    if (hasData && hasCorrectPassword) {
                        setPassword(password);
                        if (firstUse) {
                            this.navigateToLoading();
                        } else {
                            const addresses = get(selectedAccount, 'addresses');
                            if (!isEmpty(addresses)) {
                                this.navigateToLoading();
                            } else {
                                this.navigateToHome();
                            }
                        }
                    } else {
                        this.props.generateAlert(
                            'error',
                            t('global:unrecognisedPassword'),
                            t('global:unrecognisedPasswordExplanation'),
                        );
                    }
                })
                .catch(err => console.log(err)); // Dropdown
        }
    }

    navigateToLoading() {
        this.props.navigator.push({
            screen: 'loading',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    navigateToHome() {
        this.props.changeHomeScreenRoute('balance');
        this.props.setSetting('mainSettings');
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'home',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
            },
            appStyle: {
                orientation: 'portrait',
            },
        });
    }

    render() {
        const { backgroundColor, positiveColor, negativeColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const arrowLeftImagePath =
            secondaryBackgroundColor === 'white' ? whiteArrowLeftImagePath : blackArrowLeftImagePath;
        const tickImagePath = secondaryBackgroundColor === 'white' ? whiteTickImagePath : blackTickImagePath;
        return (
            <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                <StatusBar barStyle="light-content" />
                {!this.state.changingNode && (
                    <EnterPasswordOnLogin
                        backgroundColor={backgroundColor}
                        negativeColor={negativeColor}
                        positiveColor={positiveColor}
                        onLoginPress={this.onLoginPress}
                        navigateToNodeSelection={this.navigateToNodeSelection}
                        secondaryBackgroundColor={secondaryBackgroundColor}
                        textColor={textColor}
                    />
                )}
                {this.state.changingNode && (
                    <View>
                        <View style={{ flex: 0.8 }} />
                        <View style={{ flex: 4.62 }}>
                            <NodeSelection
                                setNode={selectedNode => {
                                    changeIotaNode(selectedNode);
                                    this.props.setFullNode(selectedNode);
                                }}
                                node={this.props.fullNode}
                                nodes={this.props.availablePoWNodes}
                                backPress={() => this.setState({ changingNode: false })}
                                textColor={textColor}
                                tickImagePath={tickImagePath}
                                arrowLeftImagePath={arrowLeftImagePath}
                            />
                        </View>
                        <View style={{ flex: 0.2 }} />
                    </View>
                )}
                <StatefulDropdownAlert />
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
                    onBackButtonPress={() => this.setState({ isModalVisible: false })}
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
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 40,
    },
    infoText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 16,
    },
});

const mapStateToProps = state => ({
    firstUse: state.account.firstUse,
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    fullNode: state.settings.fullNode,
    availablePoWNodes: state.settings.availablePoWNodes,
    currency: state.settings.currency,
    hasErrorFetchingAccountInfoOnLogin: state.tempAccount.hasErrorFetchingAccountInfoOnLogin,
    backgroundColor: state.settings.theme.backgroundColor,
    positiveColor: state.settings.theme.positiveColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
    getMarketData,
    getPrice,
    getChartData,
    getCurrencyData,
    setReady,
    setFullNode,
    changeHomeScreenRoute,
    setSetting,
};

export default translate(['login', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Login));
