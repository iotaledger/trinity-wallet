import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, Clipboard, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import StatefulDropdownAlert from './statefulDropdownAlert';
import PropTypes from 'prop-types';
import Seedbox from '../components/seedBox.js';
import COLORS from '../theme/Colors';
import { width, height } from '../util/dimensions';
import { setCopiedToClipboard } from '../../shared/actions/tempAccount';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import GENERAL from '../theme/general';

class CopySeedToClipboard extends Component {
    static propTypes = {
        setCopiedToClipboard: PropTypes.func.isRequired,
        generateAlert: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.timeout = null;
    }

    generateClipboardClearAlert() {
        const { t, generateAlert } = this.props;

        return generateAlert('info', t('seedCleared'), t('seedClearedExplanation'));
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
        this.props.setCopiedToClipboard(true);

        this.props.navigator.pop({
            animated: false,
        });
    }

    onCopyPress() {
        const { t, generateAlert } = this.props;

        Clipboard.setString(this.props.tempAccount.seed);

        generateAlert('success', t('seedCopied'), t('seedCopiedExplanation'));

        this.timeout = setTimeout(() => {
            Clipboard.setString('');
            this.generateClipboardClearAlert();
        }, 60000);
    }

    render() {
        const { t } = this.props;
        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midContainer}>
                    <Text style={styles.infoTextNormal}>{t('clickToCopy')}</Text>
                    <Text style={styles.infoTextBold}>{t('doNotStore')}</Text>
                    <Seedbox seed={this.props.tempAccount.seed} />
                    <TouchableOpacity onPress={event => this.onCopyPress()} style={{ marginTop: height / 22 }}>
                        <View style={styles.copyButton}>
                            <Text style={styles.copyText}>{t('copyToClipboard').toUpperCase()}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.onDonePress()}>
                        <View style={styles.doneButton}>
                            <Text style={styles.doneText}>{t('global:done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
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
        backgroundColor: COLORS.backgroundGreen,
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
        borderRadius: GENERAL.borderRadiusLarge,
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
        paddingHorizontal: width / 5,
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
    copyButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
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

const mapDispatchToProps = {
    setCopiedToClipboard,
    generateAlert,
};

export default translate(['copyToClipboard', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(CopySeedToClipboard),
);
