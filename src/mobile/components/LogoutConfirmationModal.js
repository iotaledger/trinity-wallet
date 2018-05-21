import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { translate } from 'react-i18next';
import OnboardingButtons from '../containers/OnboardingButtons';
import GENERAL from '../theme/general';
import StatefulDropdownAlert from '../containers/StatefulDropdownAlert';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        width,
        height,
        justifyContent: 'center',
    },
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
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        paddingBottom: height / 16,
    },
});

export class LogoutConfirmationModal extends PureComponent {
    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** Log out from wallet */
        logout: PropTypes.func.isRequired,
        /** Modal background color */
        backgroundColor: PropTypes.object.isRequired,
        /** Modal text color */
        textColor: PropTypes.object.isRequired,
        /** Modal border color */
        borderColor: PropTypes.object.isRequired,
        /** Bar background color */
        barBg: PropTypes.string.isRequired,
    };

    render() {
        const { t, backgroundColor, barBg, textColor, borderColor } = this.props;

        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, borderColor, backgroundColor]}>
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
                <StatefulDropdownAlert backgroundColor={barBg} />
            </View>
        );
    }
}

export default translate(['logoutConfirmationModal', 'global'])(LogoutConfirmationModal);
