import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import Seedbox from '../components/seedBox.js';
import { width, height } from '../util/dimensions';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import { getChecksum } from 'iota-wallet-shared-modules/libs/iota';

class WriteSeedDown extends Component {
    onDonePress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    render() {
        const { t } = this.props;
        const checksum = getChecksum(this.props.tempAccount.seed);
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midContainer}>
                    <Text style={styles.infoText}>
                        <Text style={styles.infoTextNormal}>
                            {`Your seed is ${MAX_SEED_LENGTH} characters read from left to right. Write down your seed and checksum and`}
                        </Text>
                        <Text style={styles.infoTextBold}> triple check </Text>
                        <Text style={styles.infoTextNormal}>they are correct.</Text>
                    </Text>
                    <Seedbox seed={this.props.tempAccount.seed} />
                    <View style={styles.checksum}>
                        <Text style={styles.checksumText}>{checksum}</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.onDonePress()}>
                        <View style={styles.doneButton}>
                            <Text style={styles.doneText}>DONE</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGreen,
    },
    topContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 4.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        justifyContent: 'flex-end',
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
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.6,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        paddingTop: height / 25,
        marginBottom: height / 30,
        paddingHorizontal: width / 7,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    doneButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
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
    seedBox: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.65,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height / 80,
    },
    seedBoxTextContainer: {
        width: width / 1.65,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: height / 160,
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
        paddingVertical: 2,
    },
    seedBoxTextRight: {
        color: 'white',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 25,
        textAlign: 'justify',
        letterSpacing: 8,
        backgroundColor: 'transparent',
        paddingVertical: 2,
    },
    arrow: {
        width: width / 2,
        height: height / 80,
    },
    checksum: {
        width: width / 8,
        height: height / 20,
        borderRadius: GENERAL.borderRadiusSmall,
        borderColor: 'white',
        borderWidth: height / 1000,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 30,
    },
    checksumText: {
        fontSize: width / 29.6,
        color: 'white',
        fontFamily: 'Lato-Regular',
    },
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
});

export default connect(mapStateToProps)(WriteSeedDown);
