import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import { withNamespaces } from 'react-i18next';
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
        width: width - width / 8,
    },
    icon: {
        opacity: 0.6,
        paddingVertical: height / 20,
        backgroundColor: 'transparent',
    },
});

export class ChecksumModal extends PureComponent {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Close active modal */
        closeModal: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    render() {
        const { t, theme: { body } } = this.props;

        return (
            <ModalView onButtonPress={() => this.props.closeModal()} buttonText={t('okay')}>
                <Text style={[styles.questionText, { color: body.color }]}>{t('saveYourSeed:whatIsAChecksum')}</Text>
                <Icon name="security" size={width / 5} color={body.color} style={styles.icon} />
                <Text style={[styles.infoText, { color: body.color, paddingBottom: height / 40 }]}>
                    {t('saveYourSeed:everySeedHasAChecksum')}
                </Text>
                <Text style={[styles.infoText, { color: body.color }]}>{t('saveYourSeed:checksumExplanation')}</Text>
            </ModalView>
        );
    }
}

export default withNamespaces(['logoutConfirmationModal', 'global'])(ChecksumModal);
