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
        justifyContent: 'flex-end',
        width,
        height,
    },
    modalContent: {
        borderRadius: Styling.borderRadius,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: height - Styling.topbarHeight,
        width,
    },
    textContainer: {
        width: width - width / 10,
        paddingBottom: height / 22,
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize5,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        textAlign: 'left',
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
        const { theme, t, completeTransitionTask } = this.props;
        const textColor = { color: theme.body.color };
        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: theme.body.bg }]}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.textContainer}>
                        <Text style={[styles.infoTextBold, textColor]}>{t('global:isYourBalanceCorrect')}</Text>
                        <Text style={[styles.infoTextLight, textColor, { paddingTop: height / 20 }]}>
                            {t('global:ifYourBalanceIsNotCorrect')}
                        </Text>
                        <Text style={[styles.infoTextLight, textColor, { paddingTop: height / 40 }]}>
                            {t('global:headToAdvancedSettingsForTransition')}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <SingleFooterButton onButtonPress={() => completeTransitionTask()} buttonText={t('done')} />
                </View>
            </View>
        );
    }
}
