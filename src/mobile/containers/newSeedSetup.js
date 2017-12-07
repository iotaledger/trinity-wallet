import split from 'lodash/split';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Text,
    TouchableHighlight,
    ImageBackground,
    ListView,
    TouchableOpacity,
    Image,
    StatusBar,
} from 'react-native';
import OnboardingButtons from '../components/onboardingButtons.js';
import { connect } from 'react-redux';
import { randomiseSeed, setSeed, clearSeed } from 'iota-wallet-shared-modules/actions/tempAccount';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { randomBytes } from 'react-native-randombytes';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import { Navigation } from 'react-native-navigation';

import { width, height } from '../util/dimensions';
import { isIPhoneX } from '../util/device';

const StatusBarDefaultBarStyle = 'light-content';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

/* eslint-disable react/jsx-filename-extension */
/* eslint-disable global-require */

class NewSeedSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            randomised: false,
            infoTextHeight: 0,
            flashComplete: false,
        };

        this.bind(['flashText1', 'flashText2']);
    }

    bind(methods) {
        methods.forEach(method => (this[method] = this[method].bind(this)));
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    onGeneratePress() {
        this.props.randomiseSeed(randomBytes);
        this.setState({ randomised: true });
        if (!this.state.flashComplete) {
            this.timeout = setTimeout(this.flashText1, 1000);
            this.timeout = setTimeout(this.flashText2, 1250);
            this.timeout = setTimeout(this.flashText1, 1400);
            this.timeout = setTimeout(this.flashText2, 1650);

            this.timeout = setTimeout(this.flashText1, 2400);
            this.timeout = setTimeout(this.flashText2, 2650);
            this.timeout = setTimeout(this.flashText1, 2800);
            this.timeout = setTimeout(this.flashText2, 3050);

            this.timeout = setTimeout(this.flashText1, 3800);
            this.timeout = setTimeout(this.flashText2, 4050);
            this.timeout = setTimeout(this.flashText1, 4200);
            this.timeout = setTimeout(this.flashText2, 4450);
            this.setState({ flashComplete: true });
        }
    }

    flashText1() {
        this.setState({
            infoTextHeight: 0,
        });
    }
    flashText2() {
        this.setState({
            infoTextHeight: height / 38,
        });
    }
    onNextPress() {
        const { t } = this.props;
        if (this.state.randomised) {
            this.props.navigator.push({
                screen: 'saveYourSeed',
                navigatorStyle: { navBarHidden: true, navBarTransparent: true },
                animated: false,
                overrideBackPress: true,
            });
        } else {
            this.dropdown.alertWithType('error', t('seedNotGenerated'), t('seedNotGeneratedExplanation'));
        }
    }

    onBackPress() {
        this.props.clearSeed();
        if (!this.props.account.onboardingComplete) {
            this.props.navigator.push({
                screen: 'walletSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                },
                animated: false,
                overrideBackPress: true,
            });
        } else {
            // FIXME: A quick workaround to stop UI text fields breaking on android due to react-native-navigation.
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'home',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundImageName: 'bg-blue.png',
                        screenBackgroundColor: '#102e36',
                    },
                    overrideBackPress: true,
                },
            });
        }
    }

    onItemPress(sectionID) {
        if (this.state.randomised) {
            const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
            randomBytes(5, (error, bytes) => {
                if (!error) {
                    let i = 0;
                    let seed = this.props.tempAccount.seed;
                    Object.keys(bytes).map((key, index) => {
                        if (bytes[key] < 243 && i < 1) {
                            const randomNumber = bytes[key] % 27;
                            const randomLetter = charset.charAt(randomNumber);
                            const substr1 = seed.substr(0, sectionID);
                            sectionID++;
                            const substr2 = seed.substr(sectionID, 80);
                            seed = substr1 + randomLetter + substr2;
                            i++;
                        }
                    });
                    this.props.setSeed(seed);
                } else {
                    console.log(error);
                }
            });
        }
    }

    render() {
        const { tempAccount: { seed }, t } = this.props;
        return (
            <ImageBackground source={require('iota-wallet-shared-modules/images/bg-blue.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image
                        source={require('iota-wallet-shared-modules/images/iota-glow.png')}
                        style={styles.iotaLogo}
                    />
                    <TouchableOpacity onPress={event => this.onGeneratePress()} style={{ paddingTop: height / 30 }}>
                        <View style={styles.generateButton}>
                            <Text style={styles.generateText}>{t('pressForNewSeed')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.midContainer}>
                    <ListView
                        contentContainerStyle={styles.list}
                        dataSource={ds.cloneWithRows(split(seed, ''))}
                        renderRow={(rowData, rowID, sectionID) => (
                            <TouchableHighlight
                                key={sectionID}
                                onPress={event => this.onItemPress(sectionID)}
                                underlayColor="#F7D002"
                            >
                                <View style={styles.tile}>
                                    <Text
                                        style={{
                                            backgroundColor: 'white',
                                            width: width / 14.5,
                                            height: width / 14.5,
                                            color: '#1F4A54',
                                            fontFamily: 'Lato-Bold',
                                            fontSize: width / 28.9,
                                            textAlign: 'center',
                                            paddingTop: height / 130,
                                            opacity: this.state.randomised ? 1 : 0.1,
                                        }}
                                    >
                                        {rowData}
                                    </Text>
                                </View>
                            </TouchableHighlight>
                        )}
                        style={styles.gridContainer}
                        initialListSize={MAX_SEED_LENGTH}
                        scrollEnabled={false}
                        enableEmptySections
                    />
                </View>
                <View style={styles.bottomContainer}>
                    <View style={{ justifyContent: 'center', flex: 0.4 }}>
                        <Text
                            style={{
                                color: 'white',
                                fontFamily: 'Lato-Light',
                                textAlign: 'center',
                                fontSize: width / 27.6,
                                backgroundColor: 'transparent',
                                height: this.state.infoTextHeight,
                            }}
                        >
                            {t('individualLetters')}
                        </Text>
                    </View>
                    <View style={styles.buttonsContainer}>
                        <TouchableOpacity onPress={event => this.onBackPress()}>
                            <View style={styles.leftButton}>
                                <Text style={styles.leftText}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity onPress={event => this.onNextPress()}>
                            <View
                                style={{
                                    borderColor: '#9DFFAF',
                                    borderWidth: 1.2,
                                    borderRadius: 10,
                                    width: width / 3,
                                    height: height / 14,
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                    opacity: this.state.randomised ? 1 : 0.3,
                                }}
                            >
                                <Text style={styles.rightText}>{t('global:next')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <DropdownAlert
                    ref={ref => (this.dropdown = ref)}
                    successColor="#009f3f"
                    errorColor="#A10702"
                    titleStyle={styles.dropdownTitle}
                    defaultTextContainer={styles.dropdownTextContainer}
                    messageStyle={styles.dropdownMessage}
                    imageStyle={styles.dropdownImage}
                    inactiveStatusBarStyle={StatusBarDefaultBarStyle}
                />
            </ImageBackground>
        );
    }
}

NewSeedSetup.propTypes = {
    navigator: PropTypes.object.isRequired,
    tempAccount: PropTypes.object.isRequired,
    setSeed: PropTypes.func.isRequired,
    randomiseSeed: PropTypes.func.isRequired,
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#102e36',
    },
    topContainer: {
        flex: 2.1,
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
        flex: 1.3,
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
    },
    list: {
        justifyContent: isIPhoneX ? 'flex-start' : 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
        height: isIPhoneX ? width / 1.1 : width / 1.15,
        width: isIPhoneX ? width / 1.1 : width / 1.15,
        flex: 1,
    },

    gridContainer: {
        height: width / 1.15,
        width: width / 1.15,
    },
    tile: {
        padding: height / 150,
        justifyContent: 'center',
        alignItems: 'center',
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
    generateButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2.2,
        height: height / 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#009f3f',
    },
    generateText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    buttonsContainer: {
        flex: 1,
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    rightText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    leftButton: {
        borderColor: '#F7D002',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginRight: width / 14,
    },
    leftText: {
        color: '#F7D002',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        backgroundColor: 'transparent',
    },
    dropdownTitle: {
        fontSize: width / 25.9,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        paddingLeft: width / 20,
        paddingRight: width / 15,
        paddingVertical: height / 30,
    },
    dropdownMessage: {
        fontSize: width / 29.6,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        paddingTop: height / 60,
    },
    dropdownImage: {
        marginLeft: width / 25,
        width: width / 12,
        height: width / 12,
        alignSelf: 'center',
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    setSeed: seed => {
        dispatch(setSeed(seed));
    },
    clearSeed: () => {
        dispatch(clearSeed());
    },
    randomiseSeed: randomBytes => {
        dispatch(randomiseSeed(randomBytes));
    },
});

export default translate(['newSeedSetup', 'global'])(connect(mapStateToProps, mapDispatchToProps)(NewSeedSetup));
