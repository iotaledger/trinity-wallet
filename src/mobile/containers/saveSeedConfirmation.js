import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import PropTypes from 'prop-types';
import whiteCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-white.png';
import whiteCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-white.png';
import blackCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-black.png';
import blackCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-black.png';
import glowIotaImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import blackIotaImagePath from 'iota-wallet-shared-modules/images/iota-black.png';
import { connect } from 'react-redux';
import OnboardingButtons from '../components/onboardingButtons';
import DynamicStatusBar from '../components/dynamicStatusBar';
import GENERAL from '../theme/general';

import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    logoContainer: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    topMidContainer: {
        flex: 1.8,
        justifyContent: 'center',
    },
    bottomMidContainer: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    backButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    backText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    infoTextContainer: {
        paddingHorizontal: width / 15,
        alignItems: 'center',
    },
    infoTextLight: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        lineHeight: height / 14,
        textAlign: 'center',
    },
    checkboxContainer: {
        height: height / 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 50,
    },
    checkbox: {
        width: width / 20,
        height: width / 20,
    },
    checkboxText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        color: 'white',
        backgroundColor: 'transparent',
        marginLeft: width / 40,
    },
});

class SaveSeedConfirmation extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        backgroundColor: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            checkboxImage:
                props.secondaryBackgroundColor === 'white'
                    ? whiteCheckboxUncheckedImagePath
                    : blackCheckboxUncheckedImagePath,
            hasSavedSeed: false,
            iotaLogoVisibility: 'hidden',
            showCheckbox: false,
        };
    }

    componentDidMount() {
        this.timeout = setTimeout(this.onTimerComplete.bind(this), 3000);
    }

    onTimerComplete() {
        this.setState({ showCheckbox: true });
    }

    onBackPress() {
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                drawUnderStatusBar: true,
                statusBarColor: this.props.backgroundColor,
                screenBackgroundColor: this.props.backgroundColor,
            },
            animated: false,
        });
    }

    onNextPress() {
        const { hasSavedSeed } = this.state;
        if (hasSavedSeed) {
            this.props.navigator.push({
                screen: 'seedReentry',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: this.props.backgroundColor,
                    drawUnderStatusBar: true,
                    statusBarColor: this.props.backgroundColor,
                },
                animated: false,
            });
        }
    }

    onCheckboxPress() {
        const { secondaryBackgroundColor } = this.props;
        const checkboxUncheckedImagePath =
            secondaryBackgroundColor === 'white' ? whiteCheckboxUncheckedImagePath : blackCheckboxUncheckedImagePath;
        const checkboxCheckedImagePath =
            secondaryBackgroundColor === 'white' ? whiteCheckboxCheckedImagePath : blackCheckboxCheckedImagePath;

        if (this.state.checkboxImage === checkboxCheckedImagePath) {
            this.setState({
                checkboxImage: checkboxUncheckedImagePath,
                hasSavedSeed: false,
                iotaLogoVisibility: 'hidden',
            });
        } else {
            this.setState({
                checkboxImage: checkboxCheckedImagePath,
                hasSavedSeed: true,
                iotaLogoVisibility: 'visible',
            });
        }
    }

    render() {
        const { t, backgroundColor, secondaryBackgroundColor } = this.props;
        const { hasSavedSeed } = this.state;
        const textColor = { color: secondaryBackgroundColor };
        const iotaImagePath = secondaryBackgroundColor === 'white' ? glowIotaImagePath : blackIotaImagePath;
        const opacity = hasSavedSeed ? 1 : 0.1;

        return (
            <View style={[styles.container, { backgroundColor }]}>
                <DynamicStatusBar textColor={secondaryBackgroundColor} backgroundColor={backgroundColor} />
                <View style={styles.topContainer}>
                    <Image source={iotaImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.topMidContainer}>
                        <View style={styles.infoTextContainer}>
                            <Text style={[styles.infoTextLight, textColor]}>{t('saveSeedConfirmation:reenter')}</Text>
                            <Text style={[styles.infoTextLight, textColor]}>
                                {t('saveSeedConfirmation:reenterWarning')}
                            </Text>
                        </View>
                    </View>
                    <View style={styles.bottomMidContainer}>
                        {this.state.showCheckbox && (
                            <TouchableOpacity style={styles.checkboxContainer} onPress={() => this.onCheckboxPress()}>
                                <Image source={this.state.checkboxImage} style={styles.checkbox} />
                                <Text style={[styles.checkboxText, textColor]}>
                                    {t('saveSeedConfirmation:alreadyHave')}
                                </Text>
                            </TouchableOpacity>
                        )}
                        {!this.state.showCheckbox && <View style={{ flex: 1 }} />}
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onBackPress()}
                        onRightButtonPress={() => this.onNextPress()}
                        leftText={t('global:back')}
                        rightText={t('global:next')}
                        opacity={opacity}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    backgroundColor: state.settings.theme.backgroundColor,
    negativeColor: state.settings.theme.negativeColor,
    secondaryBackgroundColor: state.settings.theme.secondaryBackgroundColor,
});

export default translate(['saveSeedConfirmation', 'global'])(connect(mapStateToProps)(SaveSeedConfirmation));
