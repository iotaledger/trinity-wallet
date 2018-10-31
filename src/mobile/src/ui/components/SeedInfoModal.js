import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { withNamespaces, Trans } from 'react-i18next';
import { MAX_SEED_LENGTH } from 'shared-modules/libs/iota/utils';
import { Styling } from 'ui/theme/general';
import { height, width } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import ModalView from './ModalView';

const styles = StyleSheet.create({
    questionText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
        width: width - width / 6,
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    icon: {
        opacity: 0.6,
        paddingVertical: height / 20,
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
            <ModalView onButtonPress={() => this.props.hideModal()} buttonText={t('okay')}>
                <Text style={[styles.questionText, textColor]}>{t('newSeedSetup:whatIsASeed')}</Text>
                <Icon name="keyVertical" size={width / 5} color={body.color} style={styles.icon} />
                <Text style={[styles.infoText, textColor]}>
                    {t('walletSetup:seedExplanation', { maxLength: MAX_SEED_LENGTH })}
                </Text>
                <Trans i18nKey="walletSetup:explanation">
                    <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                        <Text style={styles.infoText}>You can use it to access your funds from</Text>
                        <Text style={styles.infoTextBold}> any wallet</Text>
                        <Text style={styles.infoText}>, on</Text>
                        <Text style={styles.infoTextBold}> any device</Text>
                        <Text style={styles.infoText}>. But if you lose your seed, you also lose your IOTA.</Text>
                    </Text>
                </Trans>
            </ModalView>
        );
    }
}

export default withNamespaces(['newSeedSetup', 'global'])(SeedInfoModal);
