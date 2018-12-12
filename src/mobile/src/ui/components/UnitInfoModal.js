import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import TextWithLetterSpacing from './TextWithLetterSpacing';
import ModalView from './ModalView';

const styles = StyleSheet.create({
    unitsContainer: {
        alignItems: 'center',
        width: width - width / 10,
    },
    unitRow: {
        alignItems: 'center',
        flexDirection: 'row',
        justifyContent: 'space-between',
        width: width - width / 10,
    },
    denominationText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        paddingVertical: width / 40,
        width: width / 8,
    },
    titleText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        paddingBottom: height / 25,
    },
    infoText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        paddingBottom: height / 25,
        width: width - width / 8,
        textAlign: 'center',
    },
    numberText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        paddingVertical: width / 40,
    },
    digitText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        paddingVertical: width / 40,
    },
    line: {
        borderBottomWidth: 0.5,
        height: 1,
        width: width - width / 10,
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
        const { t, textColor, lineColor, theme: { primary } } = this.props;

        return (
            <ModalView displayTopBar onButtonPress={this.props.hideModal} buttonText={t('done')}>
                <Text style={[styles.titleText, textColor]}>{'IOTA ' + t('unitSystem')}</Text>
                <Text style={[styles.infoText, textColor]}>{t('unitInfoExplanation')}</Text>
                <View style={styles.unitsContainer}>
                    <View style={styles.unitRow}>
                        <Text style={[styles.denominationText, { color: primary.color }]}>Ti</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.numberText, textColor]}>{t('trillion')}</Text>
                        </View>
                        <TextWithLetterSpacing spacing={1} textStyle={[styles.digitText, textColor]}>
                            1 000 000 000 000
                        </TextWithLetterSpacing>
                    </View>
                    <View style={[styles.line, lineColor]} />
                    <View style={styles.unitRow}>
                        <Text style={[styles.denominationText, { color: primary.color }]}>Gi</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.numberText, textColor]}>{t('billion')}</Text>
                        </View>
                        <TextWithLetterSpacing spacing={1} textStyle={[styles.digitText, textColor]}>
                            1 000 000 000
                        </TextWithLetterSpacing>
                    </View>
                    <View style={[styles.line, lineColor]} />
                    <View style={{ alignItems: 'center', flexDirection: 'row' }}>
                        <Text style={[styles.denominationText, { color: primary.color }]}>Mi</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.numberText, textColor]}>{t('million')}</Text>
                        </View>
                        <TextWithLetterSpacing spacing={1} textStyle={[styles.digitText, textColor]}>
                            1 000 000
                        </TextWithLetterSpacing>
                    </View>
                    <View style={[styles.line, lineColor]} />
                    <View style={styles.unitRow}>
                        <Text style={[styles.denominationText, { color: primary.color }]}>Ki</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.numberText, textColor]}>{t('thousand')}</Text>
                        </View>
                        <TextWithLetterSpacing spacing={1} textStyle={[styles.digitText, textColor]}>
                            1 000
                        </TextWithLetterSpacing>
                    </View>
                    <View style={[styles.line, lineColor]} />
                    <View style={styles.unitRow}>
                        <Text style={[styles.denominationText, { color: primary.color }]}>i</Text>
                        <View style={{ flex: 1 }}>
                            <Text style={[styles.numberText, textColor]}>{t('one')}</Text>
                        </View>
                        <TextWithLetterSpacing spacing={1} textStyle={[styles.digitText, textColor]}>
                            1
                        </TextWithLetterSpacing>
                    </View>
                </View>
            </ModalView>
        );
    }
}

export default withNamespaces(['unitInfoModal', 'global'])(UnitInfoModal);
