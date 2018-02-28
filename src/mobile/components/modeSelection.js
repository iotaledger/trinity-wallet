import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Keyboard } from 'react-native';
import tinycolor from 'tinycolor2';
import Switch from 'react-native-switch-pro';
import blackInfoImagePath from 'iota-wallet-shared-modules/images/info-black.png';
import whiteInfoImagePath from 'iota-wallet-shared-modules/images/info-white.png';
import Fonts from '../theme/Fonts';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'space-around',
        alignItems: 'center',
    },
    infoTextWrapper: {
        borderWidth: 1,
        borderRadius: GENERAL.borderRadius,
        width: width / 1.3,
        alignItems: 'center',
        justifyContent: 'center',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingVertical: height / 35,
    },
    infoText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 27.6,
        paddingTop: height / 60,
        backgroundColor: 'transparent',
        textAlign: 'justify',
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-start',
    },
    iconLeft: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleTextLeft: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    toggle: {
        marginHorizontal: width / 30,
    },
    toggleText: {
        fontFamily: Fonts.secondary,
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
        textAlign: 'justify',
    },
    toggleTextContainer: {
        justifyContent: 'center',
    },
});

class ModeSelection extends Component {
    static propTypes = {
        mode: PropTypes.string.isRequired,
        setMode: PropTypes.func.isRequired,
        backPress: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        textColor: PropTypes.object.isRequired,
        borderColor: PropTypes.object.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.changeMode = this.changeMode.bind(this);
    }

    changeMode() {
        const { mode } = this.props;
        const nextMode = mode === 'Expert' ? 'Standard' : 'Expert';
        this.props.setMode(nextMode);
        this.props.generateAlert('success', 'Mode updated', `You have changed to ${nextMode} mode.`);
    }

    render() {
        const { t, mode, textColor, borderColor, secondaryBackgroundColor, arrowLeftImagePath } = this.props;
        const infoImagePath = secondaryBackgroundColor === 'white' ? whiteInfoImagePath : blackInfoImagePath;
        const switchColor =
            secondaryBackgroundColor === 'white'
                ? tinycolor(secondaryBackgroundColor)
                      .darken(25)
                      .toString()
                : tinycolor(secondaryBackgroundColor)
                      .lighten(50)
                      .toString();
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 2.3 }} />
                        <View style={[styles.infoTextWrapper, borderColor]}>
                            <Image source={infoImagePath} style={styles.infoIcon} />
                            <Text style={[styles.infoText, textColor]}>{t('expertModeExplanation')}</Text>
                            <Text style={[styles.infoText, textColor]}>{t('modesExplanation')}</Text>
                        </View>
                        <View style={{ flex: 0.8 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableWithoutFeedback onPress={this.changeMode}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor]}>{t('standard')}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <Switch
                                style={styles.toggle}
                                circleColorActive={secondaryBackgroundColor}
                                circleColorInactive={secondaryBackgroundColor}
                                backgroundActive={switchColor}
                                backgroundInactive={switchColor}
                                value={mode === 'Expert'}
                                onSyncPress={this.changeMode}
                            />
                            <TouchableWithoutFeedback onPress={this.changeMode}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor]}>{t('expert')}</Text>
                                </View>
                            </TouchableWithoutFeedback>
                        </View>
                        <View style={{ flex: 1.5 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.backPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Image source={arrowLeftImagePath} style={styles.iconLeft} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

export default translate(['modeSelection', 'global'])(ModeSelection);
