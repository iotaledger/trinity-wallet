import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { withNamespaces, Trans } from 'react-i18next';
import { MAX_SEED_LENGTH } from 'shared-modules/libs/iota/utils';
import { Styling } from 'ui/theme/general';
import SingleFooterButton from 'ui/components/SingleFooterButton';
import { width, height } from 'libs/dimensions';

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
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
});

export class SeedInfoModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    render() {
        const { t, theme: { body } } = this.props;
        const textColor = { color: body.color };

        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: body.bg }]}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.textContainer}>
                        <Text style={[styles.infoTextLight, textColor, { paddingTop: height / 40 }]}>
                            {t('walletSetup:seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                        </Text>
                        <Trans i18nKey="walletSetup:explanation">
                            <Text style={[styles.infoText, textColor, { paddingTop: height / 60 }]}>
                                <Text style={styles.infoTextLight}>You can use it to access your funds from</Text>
                                <Text style={styles.infoTextBold}> any wallet</Text>
                                <Text style={styles.infoTextLight}>, on</Text>
                                <Text style={styles.infoTextBold}> any device</Text>
                                <Text style={styles.infoTextLight}>
                                    . But if you lose your seed, you also lose your IOTA.
                                </Text>
                            </Text>
                        </Trans>
                    </View>
                    <View style={{ flex: 1 }} />
                </View>
                <SingleFooterButton onButtonPress={() => this.props.hideModal()} buttonText={t('okay')} />
            </View>
        );
    }
}

export default withNamespaces(['newSeedSetup', 'global'])(SeedInfoModal);
