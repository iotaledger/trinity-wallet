import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import OnboardingButtons from './onboardingButtons.js';
import { TextWithLetterSpacing } from './textWithLetterSpacing';
import iotaWhiteImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import { translate } from 'react-i18next';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';

class UnitInfoModal extends React.Component {
    render() {
        const { t, backgroundColor } = this.props;

        return (
            <TouchableOpacity onPress={() => this.props.hideModal()} style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: backgroundColor }]}>
                    <Image source={iotaWhiteImagePath} style={styles.iotaIcon} />
                    <TextWithLetterSpacing spacing={4} textStyle={styles.iotaText}>
                        IOTA
                    </TextWithLetterSpacing>
                    // use interpolation instead
                    <TextWithLetterSpacing spacing={6} textStyle={styles.titleText}>
                        {t('unitSystem')}
                    </TextWithLetterSpacing>
                    <View style={styles.unitsContainer}>
                        <View style={{ alignItems: 'flex-start', paddingHorizontal: width / 60 }}>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.denominationText}>
                                Ti
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.denominationText}>
                                Gi
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.denominationText}>
                                Mi
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.denominationText}>
                                Ki
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.denominationText}>
                                i
                            </TextWithLetterSpacing>
                        </View>
                        <View style={styles.line} />
                        <View style={{ alignItems: 'flex-start', paddingHorizontal: width / 60 }}>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                {t('trillion')}
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                {t('billion')}
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                {t('million')}
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                {t('thousand')}
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                {t('one')}
                            </TextWithLetterSpacing>
                        </View>
                        <View style={styles.line} />
                        <View style={{ alignItems: 'flex-end', paddingHorizontal: width / 60 }}>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                1 000 000 000 000
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                1 000 000 000
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                1 000 000
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                1 000
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                1
                            </TextWithLetterSpacing>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingBottom: height / 30,
        paddingTop: height / 50,
        width: width / 1.15,
        alignItems: 'center',
        justifyContent: 'center',
    },
    unitsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
    denominationText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
        paddingVertical: width / 40,
    },
    titleText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 25.9,
        paddingVertical: width / 18,
    },
    numberText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 29.6,
        paddingVertical: width / 40,
    },
    line: {
        borderColor: 'white',
        borderWidth: 0.25,
        width: 0.5,
        height: width / 2.3,
        marginHorizontal: width / 75,
    },
    iotaIcon: {
        width: width / 10,
        height: width / 10,
    },
    iotaText: {
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 34.5,
        paddingTop: width / 80,
    },
});

export default translate(['unitInfoModal', 'global'])(UnitInfoModal);
