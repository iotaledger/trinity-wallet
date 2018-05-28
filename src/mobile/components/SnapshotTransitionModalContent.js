import React, { PureComponent } from 'react';
import tinycolor from 'tinycolor2';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import InfoBox from './InfoBox';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize4,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    button: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        height: height / 14,
        width: width / 2.7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

export default class SnapshotTransitionModalContent extends PureComponent {
    static propTypes = {
        /** Theming object */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Container element callback function */
        onPress: PropTypes.func.isRequired,
    };

    render() {
        const { theme, t, onPress } = this.props;

        const textColor = { color: theme.body.color };
        const isBgLight = tinycolor(theme.body.bg).isLight();
        const buttonTextColor = { color: isBgLight ? theme.primary.body : theme.primary.color };
        const borderColor = { borderColor: isBgLight ? 'transparent' : theme.primary.color };
        const backgroundColor = { backgroundColor: isBgLight ? theme.primary.color : 'transparent' };

        return (
            <View style={{ backgroundColor: theme.body.bg, marginTop: height / 30 }}>
                <InfoBox
                    body={theme.body}
                    width={width / 1.1}
                    text={
                        <View>
                            <Text style={[styles.infoTextBold, textColor, { paddingTop: height / 30 }]}>
                                Is your balance correct?
                            </Text>
                            <Text style={[styles.infoTextLight, textColor, { paddingTop: height / 40 }]}>
                                If your balance is not correct, it is likely that you are using a pre-snapshot seed.
                            </Text>
                            <Text style={[styles.infoTextLight, textColor, { paddingTop: height / 40 }]}>
                                Head to Advanced Settings and perform a Snapshot Transition.
                            </Text>
                            <View style={{ paddingTop: height / 18, alignItems: 'center' }}>
                                <TouchableOpacity onPress={onPress}>
                                    <View style={[styles.button, borderColor, backgroundColor]}>
                                        <Text style={[styles.buttonText, buttonTextColor]}>Okay</Text>
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
