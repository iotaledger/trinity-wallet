import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { translate } from 'react-i18next';
import GENERAL from '../theme/general';
import InfoBox from '../components/InfoBox';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    okButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    okText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
    },
    modalText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    modalTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
});

export class ChecksumModal extends PureComponent {
    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Close active modal */
        closeModal: PropTypes.func.isRequired,
        /** Theme settings */
        body: PropTypes.object.isRequired,
        /** Theme settings */
        primary: PropTypes.object.isRequired,
    };

    render() {
        const { t, body, primary } = this.props;

        return (
            <View style={{ backgroundColor: body.bg }}>
                <InfoBox
                    body={body}
                    width={width / 1.15}
                    text={
                        <View>
                            <Text style={[styles.modalTextBold, { color: body.color }, { paddingTop: height / 40 }]}>
                                {t('saveYourSeed:whatIsChecksum')}
                            </Text>
                            <Text style={[styles.modalText, { color: body.color }, { paddingTop: height / 60 }]}>
                                {t('saveYourSeed:checksumExplanation')}
                            </Text>
                            <View style={{ paddingTop: height / 20, alignItems: 'center' }}>
                                <TouchableOpacity onPress={() => this.props.closeModal()}>
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

export default translate(['logoutConfirmationModal', 'global'])(ChecksumModal);
