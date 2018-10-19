import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { withNamespaces, Trans } from 'react-i18next';
import { MAX_SEED_LENGTH } from 'shared-modules/libs/iota/utils';
import { Styling } from 'ui/theme/general';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';

const styles = StyleSheet.create({
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
    okButton: {
        borderWidth: 1.2,
        borderRadius: Styling.borderRadius,
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    okText: {
        fontFamily: 'SourceSansPro-Regular',
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
        const { t, theme: { body, primary } } = this.props;
        const textColor = { color: body.color };

        return (
            <View style={{ backgroundColor: body.bg }}>
                <InfoBox
                    body={body}
                    width={width / 1.15}
                    text={
                        <View>
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
                            <View style={{ paddingTop: height / 20, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => this.props.hideModal()}>
                                    <View style={[styles.okButton, { borderColor: primary.color }]}>
                                        <Text style={[styles.okText, { color: primary.color }]}>
                                            {t('global:okay')}
                                        </Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    }
                />
            </View>
        );
    }
}

export default withNamespaces(['newSeedSetup', 'global'])(SeedInfoModal);
