import merge from 'lodash/merge';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    Image,
    ImageBackground,
    Platform,
    StatusBar,
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import OnboardingButtons from '../components/onboardingButtons.js';

const width = Dimensions.get('window').width;
const height = global.height;

class SaveYourSeed extends Component {
    onDonePress() {
        this.props.navigator.push({
            screen: 'seedReentry',
            navigatorStyle: { navBarHidden: true, navBarTransparent: true, screenBackgroundImageName: 'bg-blue.png' },
            animated: false,
            overrideBackPress: true,
        });
    }

    onBackPress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    onWriteClick() {
        this.props.navigator.push({
            screen: 'writeSeedDown',
            navigatorStyle: { navBarHidden: true, navBarTransparent: true, screenBackgroundImageName: 'bg-blue.png' },
            animated: false,
            overrideBackPress: true,
        });
    }
    onPrintClick() {
        this.props.navigator.push({
            screen: 'paperWallet',
            navigatorStyle: { navBarHidden: true, navBarTransparent: true, screenBackgroundImageName: 'bg-blue.png' },
            animated: false,
            overrideBackPress: true,
        });
    }
    onCopyClick() {
        this.props.navigator.push({
            screen: 'copySeedToClipboard',
            navigatorStyle: { navBarHidden: true, navBarTransparent: true, screenBackgroundImageName: 'bg-blue.png' },
            animated: false,
            overrideBackPress: true,
        });
    }

    render() {
        return (
            <ImageBackground source={require('iota-wallet-shared-modules/images/bg-blue.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image
                        source={require('iota-wallet-shared-modules/images/iota-glow.png')}
                        style={styles.iotaLogo}
                    />
                    <Text style={styles.infoText}>
                        <Text style={styles.infoTextNormal}>You must save your seed with</Text>
                        <Text style={styles.infoTextBold}>{t('text2')}</Text>
                        <Text style={styles.infoTextNormal}>of the options listed below.</Text>
                    </Text>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ paddingTop: height / 20 }}>
                        <TouchableOpacity onPress={event => this.onWriteClick()}>
                            <View style={styles.optionButton}>
                                <Text style={styles.optionButtonText}>{t('optionA')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingTop: height / 25 }}>
                        <TouchableOpacity onPress={event => this.onPrintClick()}>
                            <View style={styles.optionButton}>
                                <Text style={styles.optionButtonText}>{t('optionB')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={{ paddingTop: height / 25 }}>
                        <TouchableOpacity onPress={event => this.onCopyClick()}>
                            <View style={styles.optionButton}>
                                <Text style={styles.optionButtonText}>{t('optionC')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onBackPress()}
                        onRightButtonPress={() => this.onDonePress()}
                        leftText={t('button2')}
                        rightText={'DONE'}
                    />
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
        flex: 4,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: height / 20,
    },
    optionButtonText: {
        color: '#8BD4FF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        textAlign: 'center',
        paddingHorizontal: width / 20,
        backgroundColor: 'transparent',
    },
    optionButton: {
        borderColor: '#8BD4FF',
        borderWidth: 1.5,
        borderRadius: 15,
        width: width / 1.6,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 35,
        paddingBottom: height / 30,
    },
    title: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 23,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.9,
        textAlign: 'left',
        paddingTop: height / 10,
        paddingHorizontal: width / 6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.9,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 25.9,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
});

SaveYourSeed.propTypes = {
    navigator: PropTypes.object.isRequired,
};

export default connect(mapStateToProps)(SaveYourSeed);
