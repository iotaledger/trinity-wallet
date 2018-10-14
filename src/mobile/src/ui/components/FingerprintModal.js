import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { Styling } from 'ui/theme/general';
import Fonts from 'ui/theme/fonts';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

import { width, height } from 'libs/dimensions';

const styles = StyleSheet.create({
    modalContent: {
        alignItems: 'center',
        borderRadius: Styling.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 18,
        paddingHorizontal: width / 10,
    },
    modalText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

export class FingerprintModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** Determines in which instance the modal is being used*/
        instance: PropTypes.string.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
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
        const { theme: { body } } = this.props;

        return (
            <TouchableOpacity
                style={[{ width: Styling.contentWidth, alignItems: 'center' }, { backgroundColor: body.bg }]}
                onPress={this.props.hideModal}
            >
                <View style={[styles.modalContent, { borderColor: body.color }]}>
                    <Text style={[styles.modalText, { color: body.color }]}>{this.getText()}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export default withNamespaces(['global'])(FingerprintModal);
