import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import RNIsDeviceRooted from 'react-native-is-device-rooted';
import RNExitApp from 'react-native-exit-app';
import { connect } from 'react-redux';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';
import RootDetectionModalComponent from '../components/RootDetectionModal';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import { sendAndVerify } from '../utils/safetynet';

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
        paddingTop: height / 16,
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
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    nextText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    infoTextContainer: {
        paddingHorizontal: width / 15,
        alignItems: 'center',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
});

/** Welcome screen component */
class Welcome extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            isModalVisible: false,
            modalContent: (
                <RootDetectionModalComponent
                    style={{ flex: 1 }}
                    hideModal={() => this.hideModal()}
                    closeApp={() => this.closeApp()}
                    backgroundColor={props.theme.body.bg}
                    textColor={{ color: props.theme.body.color }}
                    borderColor={{ borderColor: props.theme.body.color }}
                />
            ),
        };
    }

    componentDidMount() {
        this.showModalIfRooted();
    }

    onNextPress() {
        const { theme } = this.props;

        this.props.navigator.push({
            screen: 'walletSetup',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: theme.body.bg,
                drawUnderStatusBar: true,
                statusBarColor: theme.body.bg,
            },
            animated: false,
        });
    }

    showModalIfRooted() {
        const isDeviceRooted = RNIsDeviceRooted.isDeviceRooted();
        let rooted = false;
        if (Promise && Promise.resolve && Promise.resolve(isDeviceRooted) === isDeviceRooted) {
            isDeviceRooted.then((isRooted) => {
                if (isRooted) {
                    this.setState({ isModalVisible: true });
                    rooted = true;
                }
            });
        } else {
            if (isDeviceRooted) {
                this.setState({ isModalVisible: true });
                rooted = true;
            }
        }
        if (!rooted && isAndroid) {
            sendAndVerify()
                .then((isRooted) => {
                    if (isRooted) {
                        this.setState({ isModalVisible: true });
                    }
                })
                .catch((e) => {
                    /*eslint-disable no-console*/
                    console.log(e);
                    /*eslint-enable no-console*/
                    //  this.setState({ error: e });
                });
        }
    }

    hideModal() {
        this.setState({ isModalVisible: false });
    }

    closeApp() {
        this.hideModal();
        RNExitApp.exitApp();
    }

    render() {
        const { isModalVisible } = this.state;
        const { t, theme } = this.props;

        const textColor = { color: theme.body.color };
        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <DynamicStatusBar backgroundColor={theme.body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={theme.body.color} />
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.infoTextContainer}>
                        <Text style={[styles.infoTextLight, textColor]}>{t('thankYou')}</Text>
                        <Text style={[styles.infoTextLight, textColor]}>{t('weWillSpend')}</Text>
                        <Text style={[styles.infoTextRegular, textColor]}>{t('reminder')}</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onNextPress()} testID="welcome-next">
                        <View style={[styles.nextButton, { borderColor: theme.primary.color }]}>
                            <Text style={[styles.nextText, { color: theme.primary.color }]}>{t('global:next')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <Modal
                    animationIn="zoomIn"
                    animationOut="zoomOut"
                    animationInTiming={300}
                    animationOutTiming={200}
                    backdropTransitionInTiming={300}
                    backdropTransitionOutTiming={200}
                    backdropColor={theme.body.bg}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center', margin: 0 }}
                    isVisible={isModalVisible}
                    onBackButtonPress={() => this.setState({ isModalVisible: false })}
                    useNativeDriver={isAndroid ? true : false}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.body.bg }]}>
                        {this.state.modalContent}
                    </View>
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default translate(['welcome', 'global'])(connect(mapStateToProps)(Welcome));
