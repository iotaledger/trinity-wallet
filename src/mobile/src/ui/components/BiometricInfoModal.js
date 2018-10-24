import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import SingleFooterButton from './SingleFooterButton';

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        width,
        height,
        justifyContent: 'flex-end',
    },
    modalContent: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width,
        height: height - Styling.topbarHeight,
    },
    textContainer: {
        width: width - width / 10,
        paddingBottom: height / 22,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'left',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
});

export default class BiometricInfoModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Hides modal */
        hideModal: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('BiometricInfoModal');
    }

    render() {
        const { theme: { body }, t } = this.props;
        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: body.bg }]}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.textContainer}>
                        <Text style={[styles.infoTextBold, { color: body.color }, { paddingTop: height / 40 }]}>
                            {t('login:whyBiometricDisabled')}
                        </Text>
                        <Text style={[styles.infoText, { color: body.color }, { paddingTop: height / 60 }]}>
                            {t('login:whyBiometricDisabledExplanation')}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <SingleFooterButton onButtonPress={() => this.props.hideModal()} buttonText={t('okay')} />
                </View>
            </View>
        );
    }
}
