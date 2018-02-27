import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar, BackHandler, ToastAndroid } from 'react-native';
import RNExitApp from 'react-native-exit-app';
import PropTypes from 'prop-types';
import iotaGlowImagePath from 'iota-wallet-shared-modules/images/iota-glow.png';
import COLORS from '../theme/Colors';
import GENERAL from '../theme/general';
import { isRooted } from '../util/device';
import Modal from 'react-native-modal';
import RootDetectionModal from '../components/rootDetectionModal';
import RNIsDeviceRooted from 'react-native-is-device-rooted';

import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.backgroundGreen,
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 22,
    },
    midContainer: {
        flex: 2,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    nextButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    nextText: {
        color: '#9DFFAF',
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
});

class Welcome extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            isModalVisible: false,
            modalContent: (
                <RootDetectionModal
                    style={{ flex: 1 }}
                    hideModal={() => this.hideModal()}
                    closeApp={() => this.closeApp()}
                    backgroundColor={COLORS.backgroundGreen}
                    textColor={{ color: COLORS.white }}
                    borderColor={{ borderColor: COLORS.white }}
                />
            ),
        };
    }

    componentWillMount() {
        this.showModalIfRooted();
    }

    showModalIfRooted() {
        const isDeviceRooted = RNIsDeviceRooted.isDeviceRooted();
        if (Promise && Promise.resolve && Promise.resolve(isDeviceRooted) == isDeviceRooted) {
            isDeviceRooted.then((isRooted) => {
                if (isRooted) {
                    this.setState({ isModalVisible: true });
                }
            });
        } else {
            if (isDeviceRooted) {
                this.setState({ isModalVisible: true });
            }
        }
    }

    onNextPress() {
        this.props.navigator.push({
            screen: 'walletSetup',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: COLORS.backgroundGreen,
            },
            animated: false,
        });
    }

    hideModal() {
        this.setState({ isModalVisible: false });
    }

    closeApp() {
        this.hideModal();
        RNExitApp.exitApp();
    }

    render() {
        const { t } = this.props;
        const { isModalVisible } = this.state;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image source={iotaGlowImagePath} style={styles.iotaLogo} />
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.infoTextContainer}>
                        <Text style={styles.infoTextLight}>{t('thankYou')}</Text>
                        <Text style={styles.infoTextLight}>{t('weWillSpend')}</Text>
                        <Text style={styles.infoTextRegular}>{t('reminder')}</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onNextPress()} testID="welcome-next">
                        <View style={styles.nextButton}>
                            <Text style={styles.nextText}>{t('global:next')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <Modal
                    animationIn={'bounceInUp'}
                    animationOut={'bounceOut'}
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={COLORS.backgroundGreen}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center' }}
                    isVisible={isModalVisible}
                    onBackButtonPress={() => this.setState({ isModalVisible: false })}
                >
                    <View style={[styles.modalContent, { backgroundColor: COLORS.backgroundGreen }]}>
                        {this.state.modalContent}
                    </View>
                </Modal>
            </View>
        );
    }
}

export default translate(['welcome', 'global'])(Welcome);
