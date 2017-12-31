import React, { Component } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import OnboardingButtons from './onboardingButtons.js';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import { translate } from 'react-i18next';

import { width, height } from '../util/dimensions';

class LogoutConfirmationModal extends Component {
    render() {
        const { t, backgroundColor } = this.props;

        return (
            <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor: backgroundColor }}>
                <View style={styles.modalContent}>
                    <Text style={styles.questionText}>{t('logoutConfirmation')}</Text>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.props.logout()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
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
        paddingBottom: height / 16,
    },
});

export default translate(['logoutConfirmationModal', 'global'])(LogoutConfirmationModal);
