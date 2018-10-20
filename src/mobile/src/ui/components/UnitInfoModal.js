import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import TextWithLetterSpacing from './TextWithLetterSpacing';

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width,
        height,
    },
    modalContent: {
        borderRadius: Styling.borderRadius,
        borderWidth: 2,
        paddingBottom: height / 30,
        paddingTop: height / 50,
        width: Styling.contentWidth,
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
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        paddingVertical: width / 40,
    },
    titleText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        paddingVertical: width / 18,
    },
    numberText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        paddingVertical: width / 40,
    },
    line: {
        borderLeftWidth: 0.5,
        width: 1,
        height: width / 2.3,
        marginHorizontal: width / 75,
    },
    iotaText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize2,
        paddingTop: width / 80,
    },
});

class UnitInfoModal extends PureComponent {
    static propTypes = {
        /** Modal border color */
        borderColor: PropTypes.object.isRequired,
        /** Line color */
        lineColor: PropTypes.object.isRequired,
        /** Modal bar colors */
        bar: PropTypes.object.isRequired,
        /** Modal content text color */
        textColor: PropTypes.object.isRequired,
        /** Closes active modal */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('UnitInfoModal');
    }

    render() {
        const { t, textColor, borderColor, lineColor, bar } = this.props;

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
                        <View style={[styles.line, lineColor]} />
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
                        <View style={[styles.line, lineColor]} />
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

export default withNamespaces(['unitInfoModal', 'global'])(UnitInfoModal);
