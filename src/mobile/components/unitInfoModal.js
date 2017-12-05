import React, { Component } from 'react';
import { Image, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import OnboardingButtons from './onboardingButtons.js';
import { TextWithLetterSpacing } from './textWithLetterSpacing';
import iotaWhiteImagePath from 'iota-wallet-shared-modules/images/iota-white.png';
import { width, height } from '../util/dimensions';

class UnitInfoModal extends React.Component {
    render() {
        const { t } = this.props;

        return (
            <TouchableOpacity onPress={() => this.props.hideModal()} style={styles.modalContainer}>
                <View style={styles.modalContent}>
                    <Image source={iotaWhiteImagePath} style={styles.iotaIcon} />
                    <TextWithLetterSpacing spacing={4} textStyle={styles.iotaText}>
                        IOTA
                    </TextWithLetterSpacing>
                    <TextWithLetterSpacing spacing={6} textStyle={styles.titleText}>
                        UNIT SYSTEM
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
                                Trillion
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                Billion
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                Million
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                Thousand
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={styles.numberText}>
                                One
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
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'rgba(255, 255, 255, 0.8)',
        paddingBottom: height / 30,
        paddingTop: height / 50,
        width: width / 1.15,
        backgroundColor: '#071f28',
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

export default UnitInfoModal;
