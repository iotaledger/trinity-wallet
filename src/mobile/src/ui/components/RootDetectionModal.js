import React, { PureComponent } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { Icon } from 'ui/theme/icons';
import ModalView from './ModalView';

const styles = StyleSheet.create({
    warningText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        color: 'red',
    },
    icon: {
        opacity: 0.8,
        paddingVertical: height / 30,
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        width: width / 1.2,
    },
    infoText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        width: width / 1.2,
    },
});

export class RootDetectionModal extends PureComponent {
    static propTypes = {
        /** Exits the application */
        closeApp: PropTypes.func.isRequired,
        /** Hides active modal */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('RootDetectionModal');
    }

    render() {
        const { t, theme: { body, negative } } = this.props;
        const textColor = { color: body.color };
        return (
            <ModalView
                dualButtons
                onLeftButtonPress={() => this.props.closeApp()}
                onRightButtonPress={() => this.props.hideModal()}
                leftButtonText={t('no')}
                rightButtonText={t('yes')}
            >
                <Text style={[styles.warningText, { color: negative.color }]}>{t('warning')}</Text>
                <Icon name="attention" size={width / 6} color={body.color} style={styles.icon} />
                <Text style={[styles.infoTextBold, textColor, { paddingBottom: height / 30 }]}>
                    {t('appearsRooted')}
                </Text>
                <Text style={[styles.infoText, textColor, { paddingBottom: height / 40 }]}>{t('securityRisk')}</Text>
                <Text style={[styles.infoText, textColor]}>{t('continueDepsiteRisk')}</Text>
            </ModalView>
        );
    }
}

export default withNamespaces(['rootDetection', 'global'])(RootDetectionModal);
