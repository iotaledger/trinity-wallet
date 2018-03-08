import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
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
        width: width / 1.1,
    },
    warningText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 22,
        textAlign: 'center',
        color: 'red',
        paddingBottom: height / 40,
    },
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 24,
        paddingBottom: height / 35,
        paddingHorizontal: width / 75,
        textAlign: 'center',
    },
});

class RootDetectionModal extends Component {
    static propTypes = {
        closeApp: PropTypes.func.isRooted,
        hideModal: PropTypes.func.isRooted,
        t: PropTypes.func.isRooted,
        backgroundColor: PropTypes.string.isRooted,
        textColor: PropTypes.object.isRooted,
        borderColor: PropTypes.object.isRooted,
    };
    render() {
        const { t, backgroundColor, textColor, borderColor } = this.props;
        return (
            <View style={{ width: width / 1.1, alignItems: 'center', backgroundColor: backgroundColor }}>
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={styles.warningText}>{t('warning')}</Text>
                    <View style={{ marginBottom: height / 35 }}>
                        <Trans i18nKey="rootDetected">
                            <Text style={[styles.questionText, textColor]}>
                                Your device appears to be rooted/jailbroken.
                            </Text>
                            <Text style={[styles.questionText, textColor]}>
                                This can pose a significant risk to the security of your wallet.
                            </Text>
                            <Text style={[styles.questionText, textColor]}>
                                Do you wish to continue despite this risk?
                            </Text>
                        </Trans>
                    </View>
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
