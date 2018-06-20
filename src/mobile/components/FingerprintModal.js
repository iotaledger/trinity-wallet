import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { translate } from 'react-i18next';
import GENERAL from '../theme/general';
import Fonts from '../theme/fonts';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    modalContent: {
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 18,
        paddingHorizontal: width / 8,
    },
    modalText: {
        fontFamily: Fonts.secondary,
        fontSize: GENERAL.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

export class FingerprintModal extends PureComponent {
    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** Modal background color */
        backgroundColor: PropTypes.object.isRequired,
        /** Modal text color */
        textColor: PropTypes.object.isRequired,
        /** Modal border color */
        borderColor: PropTypes.object.isRequired,
        /** Determines in which instance the modal is being used*/
        instance: PropTypes.string.isRequired,
        /** Determines if user has activated fingerprint auth */
        isFingerprintEnabled: PropTypes.bool,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('FingerprintModal');
        this.props.hideModal = this.props.hideModal.bind(this);
    }

    getText() {
        const { t, instance, isFingerprintEnabled } = this.props;
        let modalText = '';
        switch (instance) {
            case 'send':
                modalText = t('send:fingerprintOnSend');
                break;
            case 'login':
                modalText = t('fingerprintSetup:instructionsLogin');
                break;
            case 'setup':
                modalText = isFingerprintEnabled
                    ? t('fingerprintSetup:instructionsDisable')
                    : t('fingerprintSetup:instructionsEnable');
                break;
            default:
                break;
        }
        return modalText;
    }

    render() {
        const { backgroundColor, textColor, borderColor } = this.props;

        return (
            <TouchableOpacity
                style={[{ width: width / 1.15, alignItems: 'center' }, backgroundColor]}
                onPress={this.props.hideModal}
            >
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={[styles.modalText, textColor]}>{this.getText()}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export default translate(['global'])(FingerprintModal);
