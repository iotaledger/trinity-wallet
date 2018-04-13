import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { translate } from 'react-i18next';
import GENERAL from '../theme/general';
import Fonts from '../theme/fonts';

import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    modalContent: {
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 18,
        paddingHorizontal: width / 10,
    },
    modalText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 20.7,
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
    };

    componentDidMount() {
        this.props.hideModal = this.props.hideModal.bind(this);
    }

    render() {
        const { t, backgroundColor, textColor, borderColor } = this.props;

        return (
            <TouchableOpacity
                style={[{ width: width / 1.2, alignItems: 'center' }, backgroundColor]}
                onPress={this.props.hideModal}
            >
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={[styles.modalText, textColor]}>{t('touchFingerprintReader')}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export default translate(['global'])(FingerprintModal);
