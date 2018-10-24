import React, { PureComponent } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import DualFooterButtons from './DualFooterButtons';

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width,
        height,
    },
    modalContent: {
        borderRadius: Styling.borderRadius,
        alignItems: 'center',
        justifyContent: 'space-between',
        width,
        height,
    },
    textContainer: {
        width: width - width / 10,
        paddingBottom: height / 22,
        alignItems: 'center',
    },
    warningText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize7,
        textAlign: 'center',
        color: 'red',
        paddingVertical: height / 25,
    },
    infoText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        paddingBottom: height / 35,
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
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: body.bg }]}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.textContainer}>
                        <Text style={[styles.warningText, { color: negative.color }]}>{t('warning')}</Text>
                        <View style={{ marginBottom: height / 35 }}>
                            <Text style={[styles.infoText, textColor]}>{t('appearsRooted')}</Text>
                            <Text style={[styles.infoText, textColor]}>{t('securityRisk')}</Text>
                            <Text style={[styles.infoText, textColor]}>{t('continueDepsiteRisk')}</Text>
                        </View>
                    </View>
                    <View style={{ flex: 1 }} />
                    <DualFooterButtons
                        onLeftButtonPress={() => this.props.closeApp()}
                        onRightButtonPress={() => this.props.hideModal()}
                        leftButtonText={t('no').toUpperCase()}
                        rightButtonText={t('yes').toUpperCase()}
                    />
                </View>
            </View>
        );
    }
}

export default withNamespaces(['rootDetection', 'global'])(RootDetectionModal);
