import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import OnboardingButtons from '../components/onboardingButtons';
import GENERAL from '../theme/general';
import COLORS from '../theme/Colors';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 18,
        width: width / 1.1,
    },
    warningText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 22,
        textAlign: 'center',
        color: COLORS.redLight,
        paddingBottom: height / 30,
    },
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 24,
        paddingBottom: height / 60,
        textAlign: 'center',
    },
});

class RootDetectionModal extends Component {
    render() {
        const { t, backgroundColor, textColor, borderColor } = this.props;

        return (
            <View style={{ width: width / 1.2, alignItems: 'center', backgroundColor: backgroundColor }}>
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={styles.warningText}>{t('warning')}</Text>
                    <Trans i18nKey="rootDetected">
                        <Text style={[styles.questionText, textColor]}>
                            Your device appears to be rooted/jailbroken.
                        </Text>
                        <Text style={[styles.questionText, textColor]}>
                            This can pose a significant risk to the security of your wallet.
                        </Text>
                        <Text style={[styles.questionText, textColor]}>Do you wish to continue despite this risk?</Text>
                    </Trans>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.props.closeApp()}
                        onRightButtonPress={() => this.props.hideModal()}
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
