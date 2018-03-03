import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, TouchableOpacity, Image, Keyboard } from 'react-native';
import tinycolor from 'tinycolor2';
import Switch from 'react-native-switch-pro';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { updatePowSettings } from 'iota-wallet-shared-modules/actions/settings';
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

class Pow extends Component {
    static propTypes = {
        backPress: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        networkBoundPow: PropTypes.bool.isRequired,
        t: PropTypes.func.isRequired,
        updatePowSettings: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.onChange = this.onChange.bind(this);
    }

    onChange() {
        this.props.updatePowSettings();
        this.props.generateAlert(
            'success',
            'Proof of work settings',
            'Your proof of work configuration has been updated.',
        );
    }

    getSwitchColor() {
        const isBackgroundWhite = this.isBackgroundWhite();
        const props = this.props;

        const baseColor = tinycolor(props.secondaryBackgroundColor);

        return isBackgroundWhite ? baseColor.darken(25).toString() : baseColor.lighten(50).toString();
    }

    isBackgroundWhite() {
        const props = this.props;

        return props.secondaryBackgroundColor === 'white';
    }

    render() {
        const { t, secondaryBackgroundColor, arrowLeftImagePath, networkBoundPow } = this.props;

        const isBackgroundWhite = this.isBackgroundWhite();
        const infoImagePath = isBackgroundWhite ? whiteInfoImagePath : blackInfoImagePath;
        const switchColor = this.getSwitchColor();
        const textColor = { color: secondaryBackgroundColor };

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 2.3 }} />
                        <View style={[styles.infoTextWrapper, { borderColor: secondaryBackgroundColor }]}>
                            <Image source={infoImagePath} style={styles.infoIcon} />
                            <Text style={[styles.infoText, textColor]}>{t('expertModeExplanation')}</Text>
                            <Text style={[styles.infoText, textColor]}>{t('modesExplanation')}</Text>
                        </View>
                        <View style={{ flex: 0.8 }} />
                        <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center' }}>
                            <TouchableWithoutFeedback onPress={this.onChange}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor]}>On device</Text>
                                </View>
                            </TouchableWithoutFeedback>
                            <Switch
                                style={styles.toggle}
                                circleColorActive={secondaryBackgroundColor}
                                circleColorInactive={secondaryBackgroundColor}
                                backgroundActive={switchColor}
                                backgroundInactive={switchColor}
                                value={networkBoundPow}
                                onSyncPress={this.onChange}
                            />
                            <TouchableWithoutFeedback onPress={this.onChange}>
                                <View style={styles.toggleTextContainer}>
                                    <Text style={[styles.toggleText, textColor]}>Network bound</Text>
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

const mapStateToProps = (state) => ({
    networkBoundPow: state.settings.networkBoundPow,
    backgroundColor: state.settings.theme.backgroundColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

const mapDispatchToProps = {
    generateAlert,
    updatePowSettings,
};

export default translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(Pow));
