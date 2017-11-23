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
    StatusBar,
} from 'react-native';
import { connect } from 'react-redux';
import DropdownAlert from '../node_modules/react-native-dropdownalert/DropdownAlert';
import PropTypes from 'prop-types';
import Seedbox from '../components/seedBox.js';
const width = Dimensions.get('window').width;
const height = global.height;
const StatusBarDefaultBarStyle = 'light-content';

class CopySeedToClipboard extends React.Component {
    constructor() {
        super();

        this.timeout = null;
    }

    generateSeedClearanceAlert() {
        if (this.dropdown) {
            this.dropdown.alertWithType(
                'info',
                'Seed cleared',
                'The seed has been cleared from the clipboard for your security.',
            );
        }
    }

    componentWillUnmount() {
        this.clearTimeout();
        Clipboard.setString('');
    }

    clearTimeout() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    onDonePress() {
        this.clearTimeout();
        Clipboard.setString('');

        this.props.navigator.pop({
            animated: false,
        });
    }

    onCopyPress() {
        Clipboard.setString(this.props.tempAccount.seed);
        this.dropdown.alertWithType(
            'success',
            'Seed copied',
            'The seed has been copied to the clipboard and will be cleared once you press "DONE" or 60 seconds have passed, whichever comes first.',
        );

        this.timeout = setTimeout(() => {
            Clipboard.setString('');
            this.generateSeedClearanceAlert();
        }, 60000);
    }

    render() {
        return (
            <ImageBackground source={require('../../shared/images/bg-blue.png')} style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
                </View>
                <View style={styles.midContainer}>
                    <Text style={styles.infoTextNormal}>
                        Click the button below and copy your seed to a password manager.
                    </Text>
                    <Text style={styles.infoTextBold}> Do not store the seed in plain text.</Text>
                    <Seedbox seed={this.props.tempAccount.seed} />
                    <TouchableOpacity onPress={event => this.onCopyPress()} style={{ paddingTop: height / 22 }}>
                        <View style={styles.copyButton}>
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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#102e36',
    },
    topContainer: {
        flex: 0.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
        paddingHorizontal: width / 20,
    },
    midContainer: {
        flex: 4.6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'flex-end',
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
    infoTextNormal: {
        paddingTop: height / 12,
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingHorizontal: width / 6,
    },
    infoTextBold: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingTop: height / 80,
        paddingBottom: height / 40,
    },
    doneButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    doneText: {
        color: '#9DFFAF',
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    iotaLogo: {
        height: width / 5,
        width: width / 5,
    },
    copyButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2,
        height: height / 12,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#009f3f',
    },
    copyText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 29.6,
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
});

export default connect(mapStateToProps)(CopySeedToClipboard);
