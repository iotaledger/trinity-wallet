import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import RNExitApp from 'react-native-exit-app';
import {
    StyleSheet,
    Text,
    View,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Keyboard,
    BackHandler,
} from 'react-native';
import Modal from 'react-native-modal';
import { width, height } from '../utils/dimensions';
import OnboardingButtons from '../containers/OnboardingButtons';
import CustomTextInput from './CustomTextInput';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';
import InfoBox from '../components/InfoBox';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';
import { isAndroid } from '../utils/device';

const styles = StyleSheet.create({
    topContainer: {
        flex: 2.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 3.6,
        width,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'left',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    okButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    okText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

export class EnterPasswordOnLogin extends Component {
    static propTypes = {
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Password text */
        password: PropTypes.string.isRequired,
        /** Verify two factor authentication token */
        /** @param {string} password - user's password */
        onLoginPress: PropTypes.func.isRequired,
        /** Navigate to node selection screen */
        navigateToNodeOptions: PropTypes.func.isRequired,
        /** Set updated text field password */
        /** @param {string} password - Updated password in the text field */
        setLoginPasswordField: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Determines whether fingerprint auth is enabled */
        isFingerprintEnabled: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isModalActive: false,
        };
        this.openModal = this.openModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('EnterPasswordOnLogin');
        BackHandler.addEventListener('loginBackPress', () => {
            RNExitApp.exitApp();
            return true;
        });
    }

    handleChangeText = (password) => this.props.setLoginPasswordField(password);

    handleLogin = () => {
        const { onLoginPress, password } = this.props;
        onLoginPress(password);
    };

    changeNode = () => {
        const { navigateToNodeOptions } = this.props;
        navigateToNodeOptions();
    };

    openModal() {
        this.setState({ isModalActive: true });
    }

    hideModal() {
        this.setState({ isModalActive: false });
    }

    renderModalContent = () => {
        const { t, theme: { body, primary } } = this.props;
        const textColor = { color: body.color };

        return (
            <View>
                <InfoBox
                    body={body}
                    width={width / 1.15}
                    text={
                        <View>
                            <Text style={[styles.infoTextBold, textColor, { paddingTop: height / 40 }]}>
                                Why is biometric authentication disabled?
                            </Text>
                            <Text style={[styles.infoText, textColor, { paddingTop: height / 60 }]}>
                                Biometric login is disabled on first app load for your security. When using Trinity, you
                                will be logged out for inactivity. You can then log back in with biometric
                                authentication.
                            </Text>
                            <View style={{ paddingTop: height / 20, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => this.hideModal()}>
                                    <View style={[styles.okButton, { borderColor: primary.color }]}>
                                        <Text style={[styles.okText, { color: primary.color }]}>
                                            {t('global:okay')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                />
            </View>
        );
    };

    render() {
        const { t, theme, password, isFingerprintEnabled } = this.props;
        const { isModalActive } = this.state;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <Icon name="iota" size={width / 8} color={theme.body.color} />
                    </View>
                    <View style={styles.midContainer}>
                        <CustomTextInput
                            label={t('global:password')}
                            onChangeText={this.handleChangeText}
                            containerStyle={{ width: width / 1.15 }}
                            autoCapitalize="none"
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            secureTextEntry
                            onSubmitEditing={this.handleLogin}
                            theme={theme}
                            value={password}
                            widget="fingerprintDisabled"
                            fingerprintAuthentication={isFingerprintEnabled}
                            onFingerprintPress={this.openModal}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <OnboardingButtons
                            onLeftButtonPress={this.changeNode}
                            onRightButtonPress={this.handleLogin}
                            leftButtonText={t('setNode')}
                            rightButtonText={t('login')}
                        />
                    </View>
                    <Modal
                        backdropTransitionInTiming={isAndroid ? 500 : 300}
                        backdropTransitionOutTiming={200}
                        backdropColor={theme.body.bg}
                        backdropOpacity={0.9}
                        style={styles.modal}
                        isVisible={isModalActive}
                        onBackButtonPress={() => this.hideModal()}
                        hideModalContentWhileAnimating
                        useNativeDriver={isAndroid}
                    >
                        {this.renderModalContent()}
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['login', 'global'])(EnterPasswordOnLogin);
