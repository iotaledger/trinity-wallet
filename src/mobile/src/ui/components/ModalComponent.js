import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import { connect } from 'react-redux';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import StatefulDropdownAlert from 'ui/components/StatefulDropdownAlert';
import RootDetection from 'ui/components/RootDetectionModal';
import TransferConfirmation from 'ui/components/TransferConfirmationModal';
import UsedAddress from 'ui/components/UsedAddressModal';
import UnitInfo from 'ui/components/UnitInfoModal';
import Fingerprint from 'ui/components/FingerprintModal';
import SnapshotTransitionInfo from 'ui/components/SnapshotTransitionInfoModal';
import LogoutConfirmation from 'ui/components/LogoutConfirmationModal';
import DeleteAccount from 'ui/components/DeleteAccountModal';
import HistoryContent from 'ui/components/HistoryModalContent';
import SeedInfo from 'ui/components/SeedInfoModal';
import PasswordValidation from 'ui/components/PasswordValidationModal';
import Checksum from 'ui/components/ChecksumModal';
import QrScanner from 'ui/components/QrScanner';
import Print from 'ui/components/PrintModal';
import BiometricInfo from 'ui/components/BiometricInfoModal';
import NotificationLog from 'ui/components/NotificationLogModal';
import { isAndroid } from 'libs/device';
import { height, width } from 'libs/dimensions';

const styles = StyleSheet.create({
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

const MODAL_CONTENT = {
    snapshotTransitionInfo: SnapshotTransitionInfo,
    logoutConfirmation: LogoutConfirmation,
    deleteAccount: DeleteAccount,
    fingerprint: Fingerprint,
    transferConfirmation: TransferConfirmation,
    usedAddress: UsedAddress,
    unitInfo: UnitInfo,
    historyContent: HistoryContent,
    passwordValidation: PasswordValidation,
    qrScanner: QrScanner,
    seedInfo: SeedInfo,
    print: Print,
    rootDetection: RootDetection,
    biometricInfo: BiometricInfo,
    notificationLog: NotificationLog,
    checksum: Checksum,
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
        };

        render() {
            const { modalProps, isModalActive, modalContent, theme: { body } } = this.props;
            const ModalContent = MODAL_CONTENT[modalContent];

            return (
                <View style={{ flex: 1 }}>
                    <WrappedComponent {...this.props} />
                    <Modal
                        animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                        animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                        animationInTiming={isAndroid ? 1000 : 300}
                        animationOutTiming={200}
                        backdropTransitionInTiming={isAndroid ? 500 : 300}
                        backdropTransitionOutTiming={200}
                        backdropColor={body.bg}
                        backdropOpacity={0.9}
                        style={styles.modal}
                        isVisible={isModalActive}
                        onBackButtonPress={() => this.props.toggleModalActivity()}
                        useNativeDriver={isAndroid}
                        hideModalContentWhileAnimating
                    >
                        <ModalContent {...modalProps} />
                        {isModalActive && <StatefulDropdownAlert textColor="white" />}
                    </Modal>
                </View>
            );
        }
    }

    const mapStateToProps = (state) => ({
        modalProps: state.ui.modalProps,
        isModalActive: state.ui.isModalActive,
        modalContent: state.ui.modalContent,
        theme: state.settings.theme,
    });

    const mapDispatchToProps = {
        toggleModalActivity,
    };

    return connect(mapStateToProps, mapDispatchToProps)(EnhancedComponent);
}
