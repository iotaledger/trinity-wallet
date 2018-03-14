import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { translate } from 'react-i18next';
import TextWithLetterSpacing from './TextWithLetterSpacing';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
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
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 29.6,
        paddingVertical: width / 40,
    },
    titleText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 25.9,
        paddingVertical: width / 18,
    },
    numberText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Light',
        fontSize: width / 29.6,
        paddingVertical: width / 40,
    },
    line: {
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
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 34.5,
        paddingTop: width / 80,
    },
});

/* eslint-disable react/prefer-stateless-function */
class UnitInfoModal extends Component {
    static propTypes = {
        borderColor: PropTypes.object.isRequired,
        bar: PropTypes.object.isRequired,
        textColor: PropTypes.object.isRequired,
        hideModal: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, textColor, borderColor, bar } = this.props;

        return (
            <TouchableOpacity onPress={() => this.props.hideModal()} style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: bar.bg }, borderColor]}>
                    <Icon name="iota" size={width / 14} color={bar.color} />
                    <TextWithLetterSpacing spacing={4} textStyle={[styles.iotaText, textColor]}>
                        IOTA
                    </TextWithLetterSpacing>
                    <TextWithLetterSpacing spacing={6} textStyle={[styles.titleText, textColor]}>
                        {t('unitSystem')}
                    </TextWithLetterSpacing>
                    <View style={styles.unitsContainer}>
                        <View style={{ alignItems: 'flex-start', paddingHorizontal: width / 60 }}>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.denominationText, textColor]}>
                                Ti
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.denominationText, textColor]}>
                                Gi
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.denominationText, textColor]}>
                                Mi
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.denominationText, textColor]}>
                                Ki
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.denominationText, textColor]}>
                                i
                            </TextWithLetterSpacing>
                        </View>
                        <View style={[styles.line, borderColor]} />
                        <View style={{ alignItems: 'flex-start', paddingHorizontal: width / 60 }}>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                {t('trillion')}
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                {t('billion')}
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                {t('million')}
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                {t('thousand')}
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                {t('one')}
                            </TextWithLetterSpacing>
                        </View>
                        <View style={[styles.line, borderColor]} />
                        <View style={{ alignItems: 'flex-end', paddingHorizontal: width / 60 }}>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                1 000 000 000 000
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                1 000 000 000
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                1 000 000
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                1 000
                            </TextWithLetterSpacing>
                            <TextWithLetterSpacing spacing={2} textStyle={[styles.numberText, textColor]}>
                                1
                            </TextWithLetterSpacing>
                        </View>
                    </View>
                </View>
            </TouchableOpacity>
        );
    }
}

export default translate(['unitInfoModal', 'global'])(UnitInfoModal);
