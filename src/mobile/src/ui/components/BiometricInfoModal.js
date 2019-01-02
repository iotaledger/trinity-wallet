import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { Icon } from 'ui/theme/icons';
import ModalView from './ModalView';

const styles = StyleSheet.create({
    questionText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        width: width / 1.3,
        textAlign: 'center',
    },
    infoText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        width: width / 1.2,
        textAlign: 'center',
    },
    icon: {
        opacity: 0.6,
        paddingVertical: height / 20,
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
            <ModalView onButtonPress={() => this.props.hideModal()} buttonText={t('okay')}>
                <Text style={[styles.questionText, { color: body.color }]}>{t('login:whyBiometricDisabled')}</Text>
                <Icon name="fingerprintDisabled" size={width / 6} color={body.color} style={styles.icon} />
                <Text style={[styles.infoText, { color: body.color }]}>
                    {t('login:whyBiometricDisabledExplanationPart1')}
                </Text>
                <Text style={[styles.infoText, { color: body.color }, { paddingTop: height / 40 }]}>
                    {t('login:whyBiometricDisabledExplanationPart2')}
                </Text>
            </ModalView>
        );
    }
}
