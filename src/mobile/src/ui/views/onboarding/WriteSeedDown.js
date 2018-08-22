import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FlagSecure from 'react-native-flag-secure-android';
import Modal from 'react-native-modal';
import RNPrint from 'react-native-print';
import { paperWallet } from 'shared/images/PaperWallets.js';
import SeedPicker from 'mobile/src/ui/components/SeedPicker';
import WithUserActivity from 'mobile/src/ui/components/UserActivity';
import OnboardingButtons from 'mobile/src/ui/components/OnboardingButtons';
import { width, height } from 'mobile/src/libs/dimensions';
import GENERAL from 'mobile/src/ui/theme/general';
import DynamicStatusBar from 'mobile/src/ui/components/DynamicStatusBar';
import { Icon } from 'mobile/src/ui/theme/icons.js';
import { isAndroid } from 'mobile/src/libs/device';
import Header from 'mobile/src/ui/components/Header';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';
import ChecksumComponent from 'mobile/src/ui/components/Checksum';
import ChecksumModalComponent from 'mobile/src/ui/components/ChecksumModal';

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
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        justifyContent: 'flex-end',
    },
    textContainer: {
        width: width / 1.155,
        alignItems: 'center',
    },
    infoText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** Write Seed Down component */
class WriteSeedDown extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** @ignore */
        minimised: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isCopyComplete: false,
            isModalActive: false,
        };
        this.openModal = this.openModal.bind(this);
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('WriteSeedDown');
        if (isAndroid) {
            FlagSecure.activate();
        }
    }

    componentWillUnmount() {
        if (isAndroid) {
            FlagSecure.deactivate();
        }
    }

    /**
     * Hides navigation bar
     *
     * @method onNavigatorEvent
     * @param {object} event
     */
    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.props.navigator.toggleNavBar({
                to: 'hidden',
            });
        }
    }

    /**
     * Wrapper method for printing a blank paper wallet
     * @method onPrintPress
     */
    onPrintPress() {
        this.print();
    }

    /**
     * Navigates back to the previous active screen in navigation stack
     * @method onDonePress
     */
    onDonePress() {
        this.props.navigator.pop({ animated: false });
    }

    /**
     *  Triggers blank paper wallet print
     *  @method print
     */
    async print() {
        const blankWalletHTML = `
            <!DOCTYPE html>
            <html>
            <head>
               <meta charset="utf-8">
               <style>
                  html,
                  body,
                  #wallet {
                     padding: 0px;
                     margin: 0px;
                     text-align: center;
                     overflow: hidden;
                     height: ${isAndroid ? '100vh' : null};
                     width: ${isAndroid ? '100vw' : null};
                  }
                  svg{
                     height: ${isAndroid ? '100vh' : '110vh'};
                     width: 100vw;
                  }
               </style>
            </head>
            <body>
              ${paperWallet}
            </body>
            </html>`;
        try {
            this.props.navigator.toggleNavBar({
                to: 'shown',
            });
            await RNPrint.print({ html: blankWalletHTML });
        } catch (err) {
            console.error(err);
        }
    }

    openModal() {
        this.setState({ isModalActive: true });
    }

    closeModal() {
        this.setState({ isModalActive: false });
    }

    renderModalContent = () => {
        const { theme: { body, primary } } = this.props;
        return <ChecksumModalComponent body={body} primary={primary} closeModal={() => this.closeModal()} />;
    };

    render() {
        const { t, theme, seed, minimised } = this.props;
        const { isModalActive, isCopyComplete } = this.state;
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                {!minimised && (
                    <View>
                        <DynamicStatusBar backgroundColor={theme.body.bg} />
                        <View style={styles.topContainer}>
                            <Icon name="iota" size={width / 8} color={theme.body.color} />
                            <View style={{ flex: 0.7 }} />
                            <Header textColor={theme.body.color}>{t('saveYourSeed:writeYourSeedDown')}</Header>
                        </View>
                        <View style={styles.midContainer}>
                            <View style={styles.textContainer}>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                                    <Trans i18nKey="writeDownYourSeed">
                                        <Text style={styles.infoTextNormal}>
                                            Write down your seed and checksum and{' '}
                                        </Text>
                                        <Text style={styles.infoTextBold}>triple check</Text>
                                        <Text style={styles.infoTextNormal}> that they are correct.</Text>
                                    </Trans>
                                </Text>
                            </View>
                            <View style={{ flex: 0.5 }} />
                            <SeedPicker
                                seed={seed}
                                theme={theme}
                                onValueChange={(index) => {
                                    if (index === 8) {
                                        this.setState({ isCopyComplete: true });
                                    }
                                }}
                            />
                            <View style={{ flex: 0.5 }} />
                            <ChecksumComponent seed={seed} theme={theme} showModal={this.openModal} />
                            <View style={{ flex: 0.25 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.onPrintPress()}
                                onRightButtonPress={() => (isCopyComplete ? this.onDonePress() : null)}
                                leftButtonText={t('saveYourSeed:printBlankWallet')}
                                rightButtonText={isCopyComplete ? t('global:done') : t('scrollToBottom')}
                                rightButtonStyle={{ wrapper: { opacity: isCopyComplete ? 1 : 0.2 } }}
                            />
                        </View>
                        <Modal
                            backdropTransitionInTiming={isAndroid ? 500 : 300}
                            backdropTransitionOutTiming={200}
                            backdropColor={theme.body.bg}
                            backdropOpacity={0.9}
                            style={{ alignItems: 'center', margin: 0 }}
                            isVisible={isModalActive}
                            onBackButtonPress={() => this.closeModal()}
                            closeModalContentWhileAnimating
                            useNativeDriver={!!isAndroid}
                        >
                            {this.renderModalContent()}
                        </Modal>
                    </View>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
    minimised: state.ui.minimised,
});

export default WithUserActivity()(translate(['writeSeedDown', 'global'])(connect(mapStateToProps)(WriteSeedDown)));
