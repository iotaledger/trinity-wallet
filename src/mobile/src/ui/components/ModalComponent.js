import last from 'lodash/last';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Easing, Keyboard } from 'react-native';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import timer from 'react-native-timer';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import RootDetection from 'ui/components/RootDetectionModal';
import TransferConfirmation from 'ui/components/TransferConfirmationModal';
import UnitInfo from 'ui/components/UnitInfoModal';
import Fingerprint from 'ui/components/FingerprintModal';
import SnapshotTransitionInfo from 'ui/components/SnapshotTransitionInfoModal';
import LogoutConfirmation from 'ui/components/LogoutConfirmationModal';
import TransactionHistory from 'ui/components/TransactionHistoryModal';
import SeedInfo from 'ui/components/SeedInfoModal';
import PasswordValidation from 'ui/components/PasswordValidationModal';
import Checksum from 'ui/components/ChecksumModal';
import QrScanner from 'ui/components/QrScanner';
import Print from 'ui/components/PrintModal';
import BiometricInfo from 'ui/components/BiometricInfoModal';
import NotificationLog from 'ui/components/NotificationLogModal';
import { isAndroid, isIPhoneX } from 'libs/device';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { Styling } from 'ui/theme/general';
import { height, width } from 'libs/dimensions';

const styles = StyleSheet.create({
    modal: {
        flex: 1,
        justifyContent: 'flex-end',
        alignItems: 'center',
        margin: 0,
    },
    iPhoneXBottomInset: {
        position: 'absolute',
        bottom: 0,
        width,
        height: Styling.iPhoneXBottomInsetHeight,
    },
});

const MODAL_CONTENT = {
    snapshotTransitionInfo: SnapshotTransitionInfo,
    logoutConfirmation: LogoutConfirmation,
    fingerprint: Fingerprint,
    transferConfirmation: TransferConfirmation,
    unitInfo: UnitInfo,
    transactionHistory: TransactionHistory,
    passwordValidation: PasswordValidation,
    qrScanner: QrScanner,
    seedInfo: SeedInfo,
    print: Print,
    rootDetection: RootDetection,
    biometricInfo: BiometricInfo,
    notificationLog: NotificationLog,
    checksum: Checksum,
};

const fadeInUpCustom = {
    from: {
        opacity: 0.4,
        scale: 0.9,
        translateY: 250,
    },
    to: {
        opacity: 1,
        scale: 1,
        translateY: 0,
    },
    easing: Easing.exp(),
    duration: 250,
};

const fadeOutDownCustom = {
    from: {
        opacity: 1,
        scale: 1,
        translateY: 0,
    },
    to: {
        opacity: 0,
        scale: 0.9,
        translateY: 100,
    },
    easing: Easing.exp(),
    duration: 100,
};

/** HOC to render modal component. Trigger opening/closing and content change by dispatching toggleModalActivity action.
 *  Wrap root views with this component (e.g. LanguageSetup, Login, Home).
 */
export default function withSafeAreaView(WrappedComponent) {
    class EnhancedComponent extends PureComponent {
        static propTypes = {
            /** Child component */
            modalContent: PropTypes.string.isRequired,
            /** @ignore */
            modalProps: PropTypes.object,
            /** @ignore */
            isModalActive: PropTypes.bool.isRequired,
            /** @ignore */
            theme: PropTypes.object.isRequired,
            /** @ignore */
            toggleModalActivity: PropTypes.func.isRequired,
            /** @ignore */
            isKeyboardActive: PropTypes.bool.isRequired,
            /** @ignore */
            navStack: PropTypes.array.isRequired,
        };

        constructor(props) {
            super(props);
            this.state = {
                isModalActive: props.isModalActive,
            };
            this.screen = last(props.navStack);
        }

        componentWillReceiveProps(newProps) {
            if (!this.props.isModalActive && newProps.isModalActive) {
                if (this.props.isKeyboardActive && !isAndroid) {
                    Keyboard.dismiss();
                    return timer.setTimeout('delayOpenModal', () => this.setState({ isModalActive: true }), 500);
                }
                this.setState({ isModalActive: true });
            }
            if (this.props.isModalActive && !newProps.isModalActive) {
                this.setState({ isModalActive: false });
            }
        }

        componentWillUnmount() {
            timer.clearTimeout('delayOpenModal');
        }

        render() {
            const { modalProps, isModalActive, modalContent, theme: { body }, navStack } = this.props;
            const ModalContent = MODAL_CONTENT[modalContent];

            return (
                <View style={{ flex: 1 }}>
                    <WrappedComponent {...this.props} />
                    <Modal
                        animationIn={fadeInUpCustom}
                        animationOut={fadeOutDownCustom}
                        animationInTiming={300}
                        animationOutTiming={200}
                        backdropTransitionInTiming={300}
                        backdropTransitionOutTiming={200}
                        backdropColor={body.bg}
                        backdropOpacity={0}
                        style={styles.modal}
                        deviceHeight={height}
                        deviceWidth={width}
                        isVisible={this.state.isModalActive && this.screen === last(navStack)}
                        onBackButtonPress={() => {
                            if (modalProps.onBackButtonPress) {
                                return modalProps.onBackButtonPress();
                            }
                            this.props.toggleModalActivity();
                        }}
                        useNativeDriver={isAndroid}
                        hideModalContentWhileAnimating
                    >
                        <View style={{ flex: 1 }}>
                            <ModalContent {...modalProps} />
                            {isModalActive && <StatefulDropdownAlert textColor="white" />}
                        </View>
                        {isIPhoneX && <View style={[styles.iPhoneXBottomInset, { backgroundColor: body.bg }]} />}
                    </Modal>
                </View>
            );
        }
    }

    const mapStateToProps = (state) => ({
        modalProps: state.ui.modalProps,
        isModalActive: state.ui.isModalActive,
        modalContent: state.ui.modalContent,
        theme: getThemeFromState(state),
        isKeyboardActive: state.ui.isKeyboardActive,
        navStack: state.wallet.navStack,
    });

    const mapDispatchToProps = {
        toggleModalActivity,
    };

    return connect(mapStateToProps, mapDispatchToProps)(EnhancedComponent);
}
