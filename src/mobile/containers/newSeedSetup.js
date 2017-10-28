import merge from 'lodash/merge';
import split from 'lodash/split';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableHighlight,
    ImageBackground,
    ListView,
    TouchableOpacity,
    Image,
    Platform,
    StatusBar,
} from 'react-native';
import OnboardingButtons from '../components/onboardingButtons.js';
import { connect } from 'react-redux';
import { randomiseSeed, setSeed } from '../../shared/actions/iotaActions';
import { randomBytes } from 'react-native-randombytes';
import DropdownAlert from 'react-native-dropdownalert';

const { height, width } = Dimensions.get('window');
const StatusBarDefaultBarStyle = 'light-content';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

/* eslint-disable react/jsx-filename-extension */
/* eslint-disable global-require */

class NewSeedSetup extends Component {
    constructor(props) {
        super(props);
        this.state = {
            randomised: false,
            infoTextHeight: height / 38,
            flashComplete: false,
        };
    }

    onGeneratePress() {
        this.props.randomiseSeed(randomBytes);
        this.setState({
            randomised: true,
        });
        if (!this.state.flashComplete) {
            this.timeout = setTimeout(this.flashText1.bind(this), 1000);
            this.timeout = setTimeout(this.flashText2.bind(this), 1250);
            this.timeout = setTimeout(this.flashText1.bind(this), 1400);
            this.timeout = setTimeout(this.flashText2.bind(this), 1650);

            this.timeout = setTimeout(this.flashText1.bind(this), 2400);
            this.timeout = setTimeout(this.flashText2.bind(this), 2650);
            this.timeout = setTimeout(this.flashText1.bind(this), 2800);
            this.timeout = setTimeout(this.flashText2.bind(this), 3050);

            this.timeout = setTimeout(this.flashText1.bind(this), 3800);
            this.timeout = setTimeout(this.flashText2.bind(this), 4050);
            this.timeout = setTimeout(this.flashText1.bind(this), 4200);
            this.timeout = setTimeout(this.flashText2.bind(this), 4450);
            this.setState({
                flashComplete: true,
            });
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
        if (this.state.randomised) {
            this.props.navigator.push({
                screen: 'saveYourSeed',
                navigatorStyle: { navBarHidden: true },
                animated: false,
            });
        } else {
            this.dropdown.alertWithType(
                'error',
                'Seed has not been generated',
                'Please click the Generate New Seed button.',
            );
        }
    }
    onBackPress() {
        this.props.setSeed('                                                                                 ');
        this.props.navigator.pop({
            animated: false,
        });
    }

    onItemPress(sectionID) {
        const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
        randomBytes(5, (error, bytes) => {
            if (!error) {
                let i = 0;
                let seed = this.props.iota.seed;
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

    render() {
        const isAndroid = Platform.OS === 'android';
        const styles = isAndroid ? merge({}, baseStyles, androidStyles) : baseStyles;

        const { iota: { seed } } = this.props;
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>GENERATE A NEW SEED</Text>
                    </View>
                    <TouchableOpacity onPress={event => this.onGeneratePress()}>
                        <View style={styles.generateButton}>
                            <Image style={styles.generateImage} source={require('../../shared/images/plus.png')} />
                            <Text style={styles.generateText}>GENERATE NEW SEED</Text>
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
                                    <Text style={styles.item}>{rowData}</Text>
                                </View>
                            </TouchableHighlight>
                        )}
                        style={styles.squareContainer}
                        initialListSize={81}
                        scrollEnabled={false}
                        enableEmptySections
                    />
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
                        Press individual letters to randomise them.
                    </Text>
                </View>
                <View style={styles.bottomContainer}>
                    <OnboardingButtons
                        onLeftButtonPress={() => this.onBackPress()}
                        onRightButtonPress={() => this.onNextPress()}
                        leftText={'BACK'}
                        rightText={'NEXT'}
                    />
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
    iota: PropTypes.object.isRequired,
    setSeed: PropTypes.func.isRequired,
    randomiseSeed: PropTypes.func.isRequired,
};

const baseStyles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#102e36',
    },
    topContainer: {
        flex: 2.3,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.3,
    },
    bottomContainer: {
        flex: 0.8,
        justifyContent: 'flex-end',
        paddingBottom: height / 20,
        paddingHorizontal: width / 5,
    },
    squareContainer: {
        flex: 1,
        height: width / 1.1,
        width: width / 1.1,
    },
    list: {
        justifyContent: 'center',
        flexDirection: 'row',
        flexWrap: 'wrap',
    },
    item: {
        backgroundColor: 'white',
        width: width / 14,
        height: width / 14,
        color: '#1F4A54',
        fontFamily: 'Lato-Bold',
        fontSize: width / 28.9,
        textAlign: 'center',
        paddingTop: height / 130,
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
        flexDirection: 'row',
        borderColor: 'rgba(255,255,255,0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2.5,
        height: height / 20,
        alignItems: 'center',
        justifyContent: 'space-around',
        backgroundColor: '#009f3f',
    },
    generateText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 40.5,
        backgroundColor: 'transparent',
        paddingRight: width / 50,
    },
    buttonsContainer: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        flexDirection: 'row',
    },
    nextButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    nextText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
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
    generateImage: {
        height: width / 30,
        width: width / 30,
        paddingLeft: width / 50,
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
});

const androidStyles = StyleSheet.create({
    squareContainer: {
        height: width / 1.2,
        width: width / 1.2,
    },
    midContainer: {
        flex: 3,
        paddingTop: height / 30,
    },
});

const mapStateToProps = state => ({
    iota: state.iota,
});

const mapDispatchToProps = dispatch => ({
    setSeed: seed => {
        dispatch(setSeed(seed));
    },
    randomiseSeed: randomBytes => {
        dispatch(randomiseSeed(randomBytes));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(NewSeedSetup);
