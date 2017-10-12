import React from 'react';
import {
    StyleSheet,
    View,
    Dimensions,
    Text,
    TouchableOpacity,
    Image,
    ImageBackground,
    Clipboard,
    StatusBar
} from 'react-native';
import { connect } from 'react-redux';
import DropdownAlert from 'react-native-dropdownalert';
import DropdownHolder from './dropdownHolder';

const { height, width } = Dimensions.get('window');
const StatusBarDefaultBarStyle = StatusBar._defaultProps.barStyle.value;

const dropdown = DropdownHolder.getDropDown();

function clearClipboard() {
    Clipboard.setString('');
    const dropdown = DropdownHolder.getDropDown();
    dropdown.alertWithType('info', 'Seed cleared', 'The seed has been cleared from the clipboard for your security.');
}
class CopySeedToClipboard extends React.Component {
    constructor(props) {
        super(props);
    }

    /* clearClipboard() {
        Clipboard.setString('');
        const dropdown = DropdownHolder.getDropDown();
        dropdown.alertWithType(
            'info',
            'Seed cleared',
            'The seed has been cleared from the clipboard for your security.',
        );
    } */

    componentWillUnmount() {
        clearClipboard();
    }

    onDonePress() {
        this.props.navigator.pop({
            animated: false
        });
    }

    onCopyPress() {
        Clipboard.setString(this.props.iota.seed);
        const dropdown = DropdownHolder.getDropDown();
        dropdown.alertWithType(
            'success',
            'Seed copied',
            'The seed has been copied to the clipboard and will be cleared once you press "DONE" or 60 seconds have passed, whichever comes first.'
        );
        setTimeout(function() {
            Clipboard.setString('');
            //  const dropdown = DropdownHolder.getDropDown();
            dropdown.alertWithType(
                'info',
                'Seed cleared',
                'The seed has been cleared from the clipboard for your security.'
            );
        }, 60000);
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                    <View style={styles.titleContainer}>
                        <Text style={styles.title}>SAVE YOUR SEED</Text>
                    </View>
                    <View style={styles.subtitlesContainer}>
                        <View style={styles.subtitleContainer}>
                            <Text style={styles.subtitle}>Manual Copy</Text>
                        </View>
                        <View style={styles.lineContainer}>
                            <Text style={styles.line}>────────</Text>
                        </View>
                        <View style={styles.subtitleContainer}>
                            <Text style={styles.subtitle}>Paper Wallet</Text>
                        </View>
                        <View style={styles.lineContainer}>
                            <Text style={styles.line}>────────</Text>
                        </View>
                        <View style={styles.subtitleContainer}>
                            <Text style={styles.currentSubtitle}>Copy To Clipboard</Text>
                        </View>
                    </View>
                    <Text style={styles.infoTextNormal}>
                        Click the button below and copy your seed to a password manager.
                    </Text>
                    <Text style={styles.infoTextBold}> Do not store the seed in plain text.</Text>
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.seedBox}>
                        <Image source={require('../../shared/images/arrow-white.png')} style={styles.arrow} />
                        <View style={styles.seedBoxTextContainer}>
                            <View>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(0, 3)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(12, 15)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(24, 27)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(36, 39)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(48, 51)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(60, 63)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(72, 75)}</Text>
                            </View>
                            <View>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(3, 6)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(15, 18)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(27, 30)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(39, 42)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(51, 54)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(63, 66)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(75, 78)}</Text>
                            </View>
                            <View>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(6, 9)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(18, 21)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(30, 33)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(42, 45)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(54, 57)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(66, 69)}</Text>
                                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(78, 81)}</Text>
                            </View>
                            <View>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(9, 12)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(21, 24)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(33, 36)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(45, 48)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(57, 60)}</Text>
                                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(69, 72)}</Text>
                            </View>
                        </View>
                    </View>
                    <TouchableOpacity onPress={event => this.onCopyPress()} style={{ paddingTop: height / 30 }}>
                        <View style={styles.copyButton}>
                            <Image style={styles.copyImage} source={require('../../shared/images/clipboard.png')} />
                            <Text style={styles.copyText}>COPY TO CLIPBOARD</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.onDonePress()}>
                        <View style={styles.doneButton}>
                            <Text style={styles.doneText}>DONE</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <DropdownAlert
                    ref={ref => DropdownHolder.setDropDown(ref)}
                    successColor="#009f3f"
                    titleStyle={{
                        fontSize: 16,
                        textAlign: 'left',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: 'transparent',
                        fontFamily: 'Lato-Regular'
                    }}
                    defaultTextContainer={{ flex: 1, padding: 15 }}
                    messageStyle={{
                        fontSize: 14,
                        textAlign: 'left',
                        fontWeight: 'bold',
                        color: 'white',
                        backgroundColor: 'transparent',
                        fontFamily: 'Lato-Regular'
                    }}
                    imageStyle={{ padding: 8, width: 36, height: 36, alignSelf: 'center' }}
                    inactiveStatusBarStyle={StatusBar._defaultProps.barStyle.value}
                />
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
        flex: 1.2,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
        paddingHorizontal: width / 20,
    },
    midContainer: {
        flex: 3.8,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: height / 5,
    },
    bottomContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'flex-end',
        paddingBottom: height / 25,
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
    currentSubtitle: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 33,
        textAlign: 'center',
        backgroundColor: 'transparent',
        flexWrap: 'wrap',
    },
    subtitle: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 33,
        textAlign: 'center',
        backgroundColor: 'transparent',
        flexWrap: 'wrap',
        opacity: 0.5,
    },
    subtitlesContainer: {
        flexDirection: 'row',
        flex: 1,
        paddingTop: height / 40,
    },
    subtitleContainer: {
        paddingHorizontal: width / 75,
        flex: 1,
        justifyContent: 'center',
    },
    line: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 33,
        textAlign: 'center',
        backgroundColor: 'transparent',
        opacity: 0.5,
    },
    lineContainer: {
        flex: 1.5,
        justifyContent: 'center',
    },
    infoTextNormal: {
        paddingTop: height / 12,
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 29,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: width / 6,
    },
    infoTextBold: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 29,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingTop: height / 80,
    },
    doneButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 16,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    doneText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    copyButton: {
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
    copyText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 40.5,
        backgroundColor: 'transparent',
        paddingRight: width / 50,
    },
    copyImage: {
        height: width / 27,
        width: width / 27,
        paddingLeft: width / 50,
    },
    seedBox: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: 15,
        width: width / 1.65,
        height: height / 3.5,
        alignItems: 'center',
        justifyContent: 'center',
        paddingTop: height / 20,
    },
    seedBoxTextContainer: {
        width: width / 1.65,
        height: height / 3.5,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: height / 80,
        paddingLeft: width / 70,
    },
    seedBoxTextLeft: {
        color: 'white',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 25,
        textAlign: 'justify',
        letterSpacing: 8,
        backgroundColor: 'transparent',
        paddingRight: width / 70,
        paddingVertical: 3,
    },
    seedBoxTextRight: {
        color: 'white',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 25,
        textAlign: 'justify',
        letterSpacing: 8,
        backgroundColor: 'transparent',
        paddingVertical: 3,
    },
    arrow: {
        width: width / 2,
        height: height / 80,
    },
});

const mapStateToProps = state => ({
    iota: state.iota,
});

export default connect(mapStateToProps)(CopySeedToClipboard);
