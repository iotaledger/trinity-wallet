import React, { PureComponent } from 'react';
import tinycolor from 'tinycolor2';
import PropTypes from 'prop-types';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import InfoBox from './InfoBox';

const styles = StyleSheet.create({
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize4,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    button: {
        borderWidth: 1.2,
        borderRadius: Styling.borderRadius,
        height: height / 14,
        width: width / 2.7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    buttonText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

export default class SnapshotTransitionModalContent extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Container element callback function */
        onPress: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('SnapshotTransitionModalContent');
    }

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
                                {t('global:isYourBalanceCorrect')}
                            </Text>
                            <Text style={[styles.infoTextLight, textColor, { paddingTop: height / 40 }]}>
                                {t('global:ifYourBalanceIsNotCorrect')}
                            </Text>
                            <Text style={[styles.infoTextLight, textColor, { paddingTop: height / 40 }]}>
                                {t('global:headToAdvancedSettingsForTransition')}
                            </Text>
                            <View style={{ paddingTop: height / 18, alignItems: 'center' }}>
                                <TouchableOpacity onPress={onPress}>
                                    <View style={[styles.button, borderColor, backgroundColor]}>
                                        <Text style={[styles.buttonText, buttonTextColor]}>{t('global:okay')}</Text>
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
