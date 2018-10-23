import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import TextWithLetterSpacing from './TextWithLetterSpacing';
import SingleFooterButton from './SingleFooterButton';

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width,
        height,
    },
    modalContent: {
        borderRadius: Styling.borderRadius,
        alignItems: 'center',
        justifyContent: 'space-between',
        width,
        height: height - Styling.topbarHeight,
    },
    unitsContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        width: Styling.contentWidth,
    },
    denominationText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        paddingVertical: width / 40,
    },
    titleText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        paddingBottom: height / 25,
    },
    numberText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        paddingVertical: width / 40,
    },
    line: {
        borderLeftWidth: 0.5,
        width: 1,
        height: width / 2.1,
        marginHorizontal: width / 75,
    },
});

class UnitInfoModal extends PureComponent {
    static propTypes = {
        /** Line color */
        lineColor: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
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
        const { t, textColor, lineColor, theme: { body } } = this.props;

        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: body.bg }]}>
                    <View style={{ alignItems: 'center', flex: 1, justifyContent: 'center' }}>
                        <TextWithLetterSpacing spacing={6} textStyle={[styles.titleText, textColor]}>
                            {'IOTA ' + t('unitSystem')}
                        </TextWithLetterSpacing>
                        <View style={styles.unitsContainer}>
                            <View style={{ alignItems: 'flex-start' }}>
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
                            <View style={{ alignItems: 'flex-start' }}>
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
                            <View style={{ alignItems: 'flex-end' }}>
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
                    <SingleFooterButton onButtonPress={this.props.hideModal} buttonText={t('done')} />
                </View>
            </View>
        );
    }
}

export default withNamespaces(['unitInfoModal', 'global'])(UnitInfoModal);
