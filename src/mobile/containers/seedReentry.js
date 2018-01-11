import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { TextField } from 'react-native-material-textfield';
import { Keyboard } from 'react-native';
import { connect } from 'react-redux';
import OnboardingButtons from '../components/onboardingButtons';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import StatefulDropdownAlert from './statefulDropdownAlert';
import THEMES from '../theme/themes';
import GENERAL from '../theme/general';

import blackInfoImagePath from 'iota-wallet-shared-modules/images/info-black.png';
import whiteInfoImagePath from 'iota-wallet-shared-modules/images/info-white.png';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';

import { width, height } from '../util/dimensions';

class SeedReentry extends Component {
    static propTypes = {
        generateAlert: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        negativeColor: PropTypes.object.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
    };

    constructor() {
        super();

        this.state = {
            seed: '',
        };
    }

    onDonePress() {
        const { t } = this.props;
        if (this.state.seed === this.props.tempAccount.seed) {
            this.props.navigator.push({
                screen: 'setSeedName',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor),
                },
                animated: false,
            });
        } else {
            this.props.generateAlert('error', t('incorrectSeed'), t('incorrectSeedExplanation'));
        }
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    render() {
        const { seed } = this.state;
        const { t, backgroundColor, negativeColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const borderColor = { borderColor: secondaryBackgroundColor };
        const infoImagePath = secondaryBackgroundColor === 'white' ? whiteInfoImagePath : blackInfoImagePath;

        return (
            <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.container}>
                            <View style={styles.topContainer}>
                                <View style={styles.logoContainer}>
                                    <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                                </View>
                                <View style={styles.titleContainer}>
                                    <Text style={[styles.title, textColor]}>{t('global:enterSeed')}</Text>
                                </View>
                            </View>
                            <View style={styles.midContainer}>
                                <TextField
                                    style={{ color: secondaryBackgroundColor, fontFamily: 'Lato-Light' }}
                                    labelTextStyle={{ fontFamily: 'Lato-Light' }}
                                    labelFontSize={width / 31.8}
                                    fontSize={width / 20.7}
                                    labelPadding={3}
                                    baseColor={secondaryBackgroundColor}
                                    label={t('global:seed')}
                                    tintColor={THEMES.getHSL(negativeColor)}
                                    autoCapitalize={'characters'}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    value={seed}
                                    onChangeText={(seed) => this.setState({ seed })}
                                    containerStyle={{
                                        width: width / 1.4,
                                    }}
                                    onSubmitEditing={() => this.onDonePress()}
                                />
                                <View style={[styles.infoTextContainer, borderColor]}>
                                    <Image source={infoImagePath} style={styles.infoIcon} />
                                    <Text style={[styles.infoText, textColor]}>{t('thisIsACheck')}</Text>
                                    <Text style={[styles.infoText, textColor]}>{t('ifYouHaveNotSaved')}</Text>
                                </View>
                            </View>
                            <View style={styles.bottomContainer}>
                                <OnboardingButtons
                                    onLeftButtonPress={() => this.onBackPress()}
                                    onRightButtonPress={() => this.onDonePress()}
                                    leftText={t('global:back')}
                                    rightText={t('global:done')}
                                />
                            </View>
                        </View>
                    </View>
                </TouchableWithoutFeedback>
                <StatefulDropdownAlert />
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1.2,
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 3.8,
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingTop: height / 8,
        width,
    },
    bottomContainer: {
        flex: 1.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15,
    },
    title: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextContainer: {
        borderWidth: 1,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingHorizontal: width / 30,
        borderStyle: 'dotted',
        paddingVertical: height / 35,
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 60,
        backgroundColor: 'transparent',
    },
    warningText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 70,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    infoIcon: {
        width: width / 20,
        height: width / 20,
    },
    qrImage: {
        height: width / 28,
        width: width / 28,
        marginRight: width / 100,
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: GENERAL.borderRadius,
        width: width / 6,
        height: height / 16,
    },
    qrText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 30,
    },
    textField: {
        fontFamily: 'Inconsolata-Bold',
    },
    qrButtonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 90,
    },
});

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

const mapDispatchToProps = {
    generateAlert,
};

export default translate(['seedReentry', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SeedReentry));
