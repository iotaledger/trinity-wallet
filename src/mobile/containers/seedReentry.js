import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableWithoutFeedback, Image } from 'react-native';
import DynamicStatusBar from '../components/dynamicStatusBar';
import CustomTextInput from '../components/customTextInput';
import { Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import OnboardingButtons from '../components/onboardingButtons';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import StatefulDropdownAlert from './statefulDropdownAlert';
import THEMES from '../theme/themes';
import GENERAL from '../theme/general';
import InfoBox from '../components/infoBox';
import glowIotaImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';

import { width, height } from '../util/dimensions';

class SeedReentry extends Component {
    static propTypes = {
        generateAlert: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        negativeColor: PropTypes.object.isRequired,
        backgroundColor: PropTypes.object.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired
    };

    constructor() {
        super();

        this.state = {
            seed: ''
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
                    screenBackgroundColor: THEMES.getHSL(this.props.backgroundColor)
                },
                animated: false
            });
        } else {
            this.props.generateAlert('error', t('incorrectSeed'), t('incorrectSeedExplanation'));
        }
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false
        });
    }

    render() {
        const { seed } = this.state;
        const { t, backgroundColor, negativeColor, secondaryBackgroundColor } = this.props;
        const textColor = { color: secondaryBackgroundColor };
        const borderColor = { borderColor: secondaryBackgroundColor };
        const iotaImagePath = secondaryBackgroundColor === 'white' ? glowIotaImagePath : blackIotaImagePath;

        return (
            <View style={[styles.container, { backgroundColor: THEMES.getHSL(backgroundColor) }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} />
                <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                    <View>
                        <View style={styles.container}>
                            <View style={styles.topContainer}>
                                <View style={styles.logoContainer}>
                                    <Image source={iotaImagePath} style={styles.iotaLogo} />
                                </View>
                            </View>
                            <View style={styles.midContainer}>
                                <View style={{ flex: 0.5 }} />
                                <CustomTextInput
                                    label={t('global:seed')}
                                    onChangeText={seed => this.setState({ seed: seed.toUpperCase() })}
                                    containerStyle={{ width: width / 1.36 }}
                                    maxLength={MAX_SEED_LENGTH}
                                    autoCapitalize={'none'}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    onSubmitEditing={() => this.onDonePress()}
                                    secondaryBackgroundColor={secondaryBackgroundColor}
                                    negativeColor={negativeColor}
                                    value={seed}
                                />
                                <View style={{ flex: 0.3 }} />
                                <InfoBox
                                    text={
                                        <View>
                                            <Text style={[styles.infoText, textColor]}>{t('thisIsACheck')}</Text>
                                            <Text style={[styles.infoText, textColor]}>{t('ifYouHaveNotSaved')}</Text>
                                        </View>
                                    }
                                    secondaryBackgroundColor={secondaryBackgroundColor}
                                />
                                <View style={{ flex: 0.5 }} />
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
        alignItems: 'center'
    },
    topContainer: {
        flex: 0.5,
        paddingTop: height / 22
    },
    midContainer: {
        flex: 3.7,
        alignItems: 'center',
        justifyContent: 'space-between',
        width
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center'
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 15
    },
    title: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent'
    },
    warningText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        paddingTop: height / 70,
        backgroundColor: 'transparent'
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5
    },
    qrImage: {
        height: width / 28,
        width: width / 28,
        marginRight: width / 100
    },
    qrButton: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: GENERAL.borderRadius,
        width: width / 6,
        height: height / 16
    },
    qrText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent'
    },
    textFieldContainer: {
        flex: 1,
        paddingRight: width / 30
    },
    textField: {
        fontFamily: 'Inconsolata-Bold'
    },
    qrButtonContainer: {
        justifyContent: 'flex-end',
        alignItems: 'center',
        paddingBottom: height / 90
    }
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor
});

const mapDispatchToProps = {
    generateAlert
};

export default translate(['seedReentry', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SeedReentry));
