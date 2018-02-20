import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import OnboardingButtons from '../components/onboardingButtons';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 18,
        width: width / 1.2,
    },
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingBottom: height / 16,
    },
});

class RootDetectionModal extends Component {
    render() {
        const { t, backgroundColor, textColor, borderColor } = this.props;

        return (
            <View style={{ width: width / 1.2, alignItems: 'center', backgroundColor: backgroundColor }}>
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={[styles.questionText, textColor]}>{t('logoutConfirmation')}</Text>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.props.hideModal()}
                        onRightButtonPress={() => this.props.logout()}
                        leftText={t('global:no')}
                        rightText={t('global:yes')}
                        buttonWidth={{ width: width / 3.2 }}
                        containerWidth={{ width: width / 1.4 }}
                    />
                </View>
            </View>
        );
    }
}

export default translate(['rootDetection', 'global'])(RootDetectionModal);
