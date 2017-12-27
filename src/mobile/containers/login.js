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
import { getAccountInfo, getFullAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import { changeIotaNode } from 'iota-wallet-shared-modules/libs/iota';
import {
    getSelectedAccountViaSeedIndex,
    getSelectedAccountNameViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import OnboardingButtons from '../components/onboardingButtons';
import NodeSelection from '../components/nodeSelection';
import EnterPassword from '../components/enterPassword';
import StatefulDropdownAlert from './statefulDropdownAlert';
import keychain, { getSeed } from '../util/keychain';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

class Login extends Component {
    static propTypes = {
        firstUse: PropTypes.bool.isRequired,
        hasErrorFetchingAccountInfoOnLogin: PropTypes.bool.isRequired,
        selectedAccount: PropTypes.object.isRequired,
        selectedAccountName: PropTypes.string.isRequired,
        fullNode: PropTypes.string.isRequired,
        availablePoWNodes: PropTypes.array.isRequired,
        currency: PropTypes.string.isRequired,
        setPassword: PropTypes.func.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        getFullAccountInfo: PropTypes.func.isRequired,
        getMarketData: PropTypes.func.isRequired,
        getPrice: PropTypes.func.isRequired,
        getChartData: PropTypes.func.isRequired,
        getCurrencyData: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        setFullNode: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            isModalVisible: false,
        };

        this.onLoginPress = this.onLoginPress.bind(this);
    }

    componentDidMount() {
        const { currency } = this.props;
        this.getWalletData();
        this.props.getCurrencyData(currency);
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
        const { firstUse, t, setPassword, selectedAccount, selectedAccountName } = this.props;

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

                        const seed = getSeed(credentials.data, 0);

                        if (firstUse) {
                            this.navigateToLoading();
                            this.props.getFullAccountInfo(seed, selectedAccountName, this.props.navigator);
                        } else {
                            const addresses = get(selectedAccount, 'addresses');

                            if (!isEmpty(addresses)) {
                                this.navigateToLoading();
                                this.props.getAccountInfo(selectedAccountName, this.props.navigator);
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

    render() {
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
    firstUse: state.account.firstUse,
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    selectedAccountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
    fullNode: state.settings.fullNode,
    availablePoWNodes: state.settings.availablePoWNodes,
    currency: state.settings.currency,
    hasErrorFetchingAccountInfoOnLogin: state.tempAccount.hasErrorFetchingAccountInfoOnLogin,
});

const mapDispatchToProps = {
    generateAlert,
    setPassword,
    getAccountInfo,
    getFullAccountInfo,
    getMarketData,
    getPrice,
    getChartData,
    getCurrencyData,
    setReady,
    setFullNode,
};

export default translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(Login));
