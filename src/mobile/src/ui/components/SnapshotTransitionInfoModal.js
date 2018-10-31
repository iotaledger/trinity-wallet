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
        width: width / 1.3,
        textAlign: 'center',
    },
    icon: {
        opacity: 0.6,
        paddingVertical: height / 30,
        backgroundColor: 'transparent',
    },
});

export default class SnapshotTransitionInfoModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object,
        /** @ignore */
        t: PropTypes.func,
        /** Marks that user has been shown transition information */
        completeTransitionTask: PropTypes.func,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('SnapshotTransitionModalContent');
    }

    render() {
        const { theme: { body }, t, completeTransitionTask } = this.props;
        const textColor = { color: body.color };
        return (
            <ModalView displayTopBar onButtonPress={() => completeTransitionTask()} buttonText={t('done')}>
                <Text style={[styles.questionText, textColor]}>{t('global:isYourBalanceCorrect')}</Text>
                <Icon name="wallet" size={width / 6} color={body.color} style={styles.icon} />
                <Text style={[styles.infoText, textColor]}>{t('global:ifYourBalanceIsNotCorrect')}</Text>
                <Text style={[styles.infoText, textColor, { paddingTop: height / 60 }]}>
                    {t('global:headToAdvancedSettingsForTransition')}
                </Text>
            </ModalView>
        );
    }
}
