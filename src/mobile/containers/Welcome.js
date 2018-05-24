import isBoolean from 'lodash/isBoolean';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import Modal from 'react-native-modal';
import RNExitApp from 'react-native-exit-app';
import RNIsDeviceRooted from 'react-native-is-device-rooted';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';
import StatefulDropdownAlert from './StatefulDropdownAlert';
import RootDetectionModalComponent from '../components/RootDetectionModal';
import DynamicStatusBar from '../components/DynamicStatusBar';
import Button from '../components/Button';
import { width, height } from '../utils/dimensions';
import { isAndroid } from '../utils/device';
import { doAttestationFromSafetyNet } from '../utils/safetynet';

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
    infoTextContainer: {
        paddingHorizontal: width / 15,
        alignItems: 'center',
    },
    infoTextLight: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize4,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize4,
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
        /** Generate a notification alert
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /**
         * Determines if wallet has an active internet connection
         */
        hasConnection: PropTypes.bool.isRequired,
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
        // FIXME: Have UI indicators for this request
        if (isAndroid) {
            RNIsDeviceRooted.isDeviceRooted()
                .then((isRooted) => {
                    if (isRooted) {
                        throw new Error('device rooted.');
                    }

                    return doAttestationFromSafetyNet();
                })
                .then((isRooted) => {
                    if (isBoolean(isRooted) && isRooted) {
                        this.setState({ isModalVisible: true });
                    }
                })
                .catch((error) => {
                    if (error.message === 'device rooted.') {
                        this.setState({ isModalVisible: true });
                    }

                    if (error.message === 'play services not available.') {
                        this.props.generateAlert(
                            'error',
                            this.props.t('global:googlePlayServicesNotAvailable'),
                            this.props.t('global:couldNotVerifyDeviceIntegrity'),
                        );
                    }
                });
        } else {
            RNIsDeviceRooted.isDeviceRooted()
                .then((isRooted) => {
                    if (isRooted) {
                        this.setState({ isModalVisible: true });
                    }
                })
                .catch((err) => console.error(err)); // eslint-disable-line no-console
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
        const { t, theme, hasConnection } = this.props;

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
                    <Button
                        onPress={() => {
                            if (hasConnection) {
                                this.onNextPress();
                            }
                        }}
                        style={{ wrapper: { opacity: hasConnection ? 1 : 0.6 } }}
                        testID="welcome-next"
                    >
                        {t('global:next')}
                    </Button>
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
                    useNativeDriver={!!isAndroid}
                >
                    <View style={[styles.modalContent, { backgroundColor: theme.body.bg }]}>
                        {this.state.modalContent}
                    </View>
                </Modal>
                <StatefulDropdownAlert backgroundColor={theme.body.bg} />
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    hasConnection: state.wallet.hasConnection,
});

const mapDispatchToProps = {
    generateAlert,
};

export default translate(['welcome', 'global'])(connect(mapStateToProps, mapDispatchToProps)(Welcome));
