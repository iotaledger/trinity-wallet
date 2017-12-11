import React from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, ImageBackground, StatusBar } from 'react-native';
import OnboardingButtons from '../components/onboardingButtons.js';

import { width, height } from '../util/dimensions';

class SaveSeedConfirmation extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkboxImage: require('iota-wallet-shared-modules/images/checkbox-unchecked.png'),
            hasSavedSeed: false,
            iotaLogoVisibility: 'hidden',
            showCheckbox: false,
        };
    }

    componentDidMount() {
        this.timeout = setTimeout(this.onTimerComplete.bind(this), 5000);
    }

    onTimerComplete() {
        this.setState({ showCheckbox: true });
    }

    onBackPress() {
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
        });
    }

    onNextPress() {
        this.props.navigator.push({
            screen: 'seedReentry',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
            },
            animated: false,
            overrideBackPress: true,
        });
    }

    onCheckboxPress() {
        if (this.state.checkboxImage == require('iota-wallet-shared-modules/images/checkbox-checked.png')) {
            this.setState({
                checkboxImage: require('iota-wallet-shared-modules/images/checkbox-unchecked.png'),
                hasSavedSeed: false,
                iotaLogoVisibility: 'hidden',
            });
        } else {
            this.setState({
                checkboxImage: require('iota-wallet-shared-modules/images/checkbox-checked.png'),
                hasSavedSeed: true,
                iotaLogoVisibility: 'visible',
            });
        }
    }

    render() {
        const { t } = this.props;
        return (
            <ImageBackground source={require('iota-wallet-shared-modules/images/bg-blue.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image
                        source={require('iota-wallet-shared-modules/images/iota-glow.png')}
                        style={styles.iotaLogo}
                    />
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.topMidContainer}>
                        <View style={styles.infoTextContainer}>
                            <Text style={styles.infoTextLight}>You will now be asked to re-enter your seed.</Text>
                            <Text style={styles.infoTextLight}>If your device fails and you have not saved</Text>
                            <Text style={styles.infoTextLight}>your seed, you will lose your IOTA.</Text>
                        </View>
                    </View>
                    <View style={styles.bottomMidContainer}>
                        {this.state.showCheckbox && (
                            <TouchableOpacity
                                style={styles.checkboxContainer}
                                onPress={event => this.onCheckboxPress()}
                            >
                                <Image source={this.state.checkboxImage} style={styles.checkbox} />
                                <Text style={styles.checkboxText}>I have saved my seed</Text>
                            </TouchableOpacity>
                        )}
                        {!this.state.showCheckbox && <View style={{ flex: 1 }} />}
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    {this.state.hasSavedSeed && (
                        <OnboardingButtons
                            onLeftButtonPress={() => this.onBackPress()}
                            onRightButtonPress={() => this.onNextPress()}
                            leftText="BACK"
                            rightText="NEXT"
                        />
                    )}
                    {!this.state.hasSavedSeed && (
                        <TouchableOpacity onPress={() => this.onBackPress()}>
                            <View style={styles.backButton}>
                                <Text style={styles.backText}>BACK</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </ImageBackground>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#102e36',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
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
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    backText: {
        color: '#F7D002',
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
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
    infoTextRegular: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
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

export default SaveSeedConfirmation;
