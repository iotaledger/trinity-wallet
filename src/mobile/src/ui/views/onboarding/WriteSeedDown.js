import React, { Component } from 'react';
import { withNamespaces, Trans } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import FlagSecure from 'react-native-flag-secure-android';
import RNPrint from 'react-native-print';
import { paperWallet } from 'shared-modules/images/PaperWallets.js';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import SeedPicker from 'ui/components/SeedPicker';
import WithUserActivity from 'ui/components/UserActivity';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';
import { isAndroid } from 'libs/device';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import ChecksumComponent from 'ui/components/Checksum';

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
        width: Styling.contentWidth5,
        alignItems: 'center',
    },
    infoText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** Write Seed Down component */
class WriteSeedDown extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** @ignore */
        minimised: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isCopyComplete: false,
        };
        this.openModal = this.openModal.bind(this);
        Navigation.events().bindComponent(this);
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
        Navigation.pop(this.props.componentId);
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
            Navigation.mergeOptions('appStack', {
                topBar: {
                    visible: true,
                },
            });
            await RNPrint.print({ html: blankWalletHTML });
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
        }
    }

    /**
     * Hides navigation bar
     *
     * @method componentDidAppear
     */
    componentDidAppear() {
        Navigation.mergeOptions('appStack', {
            topBar: {
                visible: false,
            },
        });
    }

    openModal() {
        const { theme } = this.props;
        this.props.toggleModalActivity('checksum', {
            theme,
            closeModal: () => this.props.toggleModalActivity(),
        });
    }

    closeModal() {
        this.props.toggleModalActivity();
    }

    render() {
        const { t, theme, seed, minimised } = this.props;
        const { isCopyComplete } = this.state;
        const textColor = { color: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                {!minimised && (
                    <View>
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
                            <DualFooterButtons
                                onLeftButtonPress={() => this.onPrintPress()}
                                onRightButtonPress={() => (isCopyComplete ? this.onDonePress() : null)}
                                leftButtonText={t('saveYourSeed:printBlankWallet')}
                                rightButtonText={isCopyComplete ? t('global:done') : t('scrollToBottom')}
                                rightButtonStyle={{ wrapper: { opacity: isCopyComplete ? 1 : 0.2 } }}
                            />
                        </View>
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

const mapDispatchToProps = {
    toggleModalActivity,
};

export default WithUserActivity()(
    withNamespaces(['writeSeedDown', 'global'])(connect(mapStateToProps, mapDispatchToProps)(WriteSeedDown)),
);
