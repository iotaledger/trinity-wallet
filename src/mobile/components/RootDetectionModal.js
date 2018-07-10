import React, { PureComponent } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import ModalButtons from '../containers/ModalButtons';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 30,
        width: width / 1.15,
        paddingHorizontal: width / 50,
    },
    warningText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize6,
        textAlign: 'center',
        color: 'red',
        paddingVertical: height / 25,
    },
    infoText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        paddingBottom: height / 35,
        textAlign: 'center',
        width: width / 1.3,
    },
});

export class RootDetectionModal extends PureComponent {
    static propTypes = {
        /** Exits the application */
        closeApp: PropTypes.func.isRequired,
        /** Hides active modal */
        hideModal: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Modal background color */
        backgroundColor: PropTypes.string.isRequired,
        /** Modal text color */
        textColor: PropTypes.object.isRequired,
        /** Modal border color */
        borderColor: PropTypes.object.isRequired,
        /** Modal warning text color */
        warningColor: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('RootDetectionModal');
    }

    render() {
        const { t, backgroundColor, textColor, borderColor, warningColor } = this.props;
        return (
            <View style={{ width: width / 1.15, alignItems: 'center', backgroundColor: backgroundColor }}>
                <View style={[styles.modalContent, borderColor]}>
                    <Text style={[styles.warningText, warningColor]}>{t('warning')}</Text>
                    <View style={{ marginBottom: height / 35 }}>
                        <Text style={[styles.infoText, textColor]}>{t('appearsRooted')}</Text>
                        <Text style={[styles.infoText, textColor]}>{t('securityRisk')}</Text>
                        <Text style={[styles.infoText, textColor]}>{t('continueDepsiteRisk')}</Text>
                    </View>
                    <ModalButtons
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
