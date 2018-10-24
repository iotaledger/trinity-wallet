import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
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
    modalText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    modalTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
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
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: body.bg }]}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.textContainer}>
                        <Text style={[styles.modalTextBold, { color: body.color }, { paddingTop: height / 40 }]}>
                            {t('saveYourSeed:whatIsChecksum')}
                        </Text>
                        <Text style={[styles.modalText, { color: body.color }, { paddingTop: height / 60 }]}>
                            {t('saveYourSeed:checksumExplanation')}
                        </Text>
                    </View>
                    <View style={{ flex: 1 }} />
                    <SingleFooterButton onButtonPress={() => this.props.closeModal()} buttonText={t('okay')} />
                </View>
            </View>
        );
    }
}

export default withNamespaces(['logoutConfirmationModal', 'global'])(ChecksumModal);
