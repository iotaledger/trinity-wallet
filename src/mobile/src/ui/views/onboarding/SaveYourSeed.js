import each from 'lodash/each';
import React, { Component } from 'react';
import { withNamespaces, Trans } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import RNPrint from 'react-native-print';
import { Navigation } from 'react-native-navigation';
import { getChecksum } from 'shared-modules/libs/iota/utils';
import { generateAlert } from 'shared-modules/actions/alerts';
import { paperWalletFilled } from 'shared-modules/images/PaperWallets.js';
import { setSeedShareTutorialVisitationStatus } from 'shared-modules/actions/settings';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import timer from 'react-native-timer';
import QRCode from 'qr.js/lib/QRCode';
import Button from 'ui/components/Button';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import Header from 'ui/components/Header';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { isAndroid, isIPhone11 } from 'libs/device';
import { Icon } from 'ui/theme/icons';

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
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        paddingHorizontal: width / 9,
        textAlign: 'center',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    infoTextSmall: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    line: {
        borderLeftWidth: 0.5,
        width: 1,
        height: height / 40,
        marginVertical: height / 150,
    },
});

/** Save Your Seed component */
class SaveYourSeed extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('SaveYourSeed');
        Navigation.events().bindComponent(this);
    }

    componentWillUnmount() {
        timer.clearTimeout('delayPrint');
        timer.clearTimeout('clipboardClear');
        timer.clearTimeout('delayAlert');
    }

    /**
     * Navigates to save seed confirmation screen
     * @method onDonePress
     */
    onDonePress() {
        const { theme: { body } } = this.props;
        Navigation.push('appStack', {
            component: {
                name: 'saveSeedConfirmation',
                options: {
                    animations: {
                        push: {
                            enable: false,
                        },
                        pop: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: body.bg,
                    },
                },
            },
        });
    }

    /**
     * Pops the active screen from the navigation stack
     * @method onBackPress
     */
    onBackPress() {
        Navigation.pop(this.props.componentId);
    }

    /**
     * Navigates to write seed down screen
     * @method onWriteSeedDownPress
     */
    onWriteSeedDownPress() {
        const { theme: { body } } = this.props;
        Navigation.push('appStack', {
            component: {
                name: 'writeSeedDown',
                options: {
                    animations: {
                        push: {
                            enable: false,
                        },
                        pop: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: body.bg,
                    },
                },
            },
        });
    }

    /**
     * Shows modal
     * @method onPrintPaperWalletPress
     */
    onPrintPaperWalletPress() {
        this.showModal('print');
    }

    onExportSeedVaultPress() {
        const { theme: { body } } = this.props;
        Navigation.push('appStack', {
            component: {
                name: 'seedVaultBackup',
                options: {
                    animations: {
                        push: {
                            enable: false,
                        },
                        pop: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: body.bg,
                    },
                },
            },
        });
    }

    /**
     * Generates html for seed qr
     * @method getQrHTMLString
     */
    getQrHTMLString(seed) {
        const qr = new QRCode(-1, 1);
        each(seed, (char) => {
            qr.addData(char);
        });
        qr.make();
        const cells = qr.modules;

        let qrString = '';
        cells.forEach((row, rowIndex) => {
            row.forEach((cell, cellIndex) => {
                qrString += `<rect
                        height="1.6"
                        key="${cellIndex}"
                        style="fill: ${cell ? '#000000' : 'none'}"
                        width="1.6"
                        x="${161 + cellIndex * 1.6}"
                        y="${699 + rowIndex * 1.6}"
                    />`;
            });
        });
        return qrString;
    }

    /**
     * Constructs html text components for all seed characters
     * @method getSeedHTMLString
     */
    getSeedHTMLString(seed) {
        let seedChars = '';
        for (let i = 0; i < seed.length; i++) {
            const space = i % 9 > 5 ? 38 : i % 9 > 2 ? 19 : 0;
            const x = 193 + (i % 9) * 26 + space;
            const y = 365 + Math.floor(i / 9) * 32.8;
            const currentChar = `<text transform="matrix(1 0 0 1 ${x} ${y})" font-size="16">
                    ${seed.charAt(i)}
                </text>`;
            seedChars = seedChars + currentChar;
        }
        return seedChars;
    }

    /**
     * Constructs paper wallet html string for printing
     * @method getHTMLContent
     */
    getHTMLContent() {
        const { seed } = this.props;
        const checksumString = `<text x="372.7" y="735">${getChecksum(seed)}</text>`;
        const qrString = this.getQrHTMLString(seed);
        const seedString = this.getSeedHTMLString(seed);

        return (
            '<svg viewBox="0 0 595 841" xmlns="http://www.w3.org/2000/svg">' +
            seedString +
            qrString +
            checksumString +
            '</svg>'
        );
    }

    /**
     * Hide navigation bar when returning from print
     * @method componentDidAppear
     */
    componentDidAppear() {
        Navigation.mergeOptions('appStack', {
            topBar: {
                visible: false,
                color: 'white',
            },
        });
    }

    /**
     *  Triggers paper wallet print
     *  @method print
     */
    async print() {
        this.props.toggleModalActivity();
        const paperWalletHTML = `
        <!DOCTYPE html>
        <html>
          <head>
             <meta charset="utf-8">
          </head>
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
             svg {
                height: ${isAndroid ? '100vh' : '120vh'};
                width: ${isAndroid ? '100vw' : '120vw'};
                position: absolute;
                top: 0;
                left: 0;
             }
             text {
               font-size: 20px;
               fill: #231f20;
               font-family: Monospace;
             }
             @font-face { font-family: "Monospace"; src: "shared-modules/custom-fonts/SourceCodePro-Medium.ttf"
          </style>
          <body>
            ${this.getHTMLContent()}
            ${paperWalletFilled}
          </body>
        </html>`;
        try {
            // Delay print to allow for modal close animation
            timer.setTimeout(
                'delayPrint',
                () => {
                    Navigation.mergeOptions('appStack', {
                        topBar: {
                            visible: true,
                        },
                    });
                    RNPrint.print({ html: paperWalletHTML });
                },
                500,
            );
        } catch (err) {
            console.error(err); // eslint-disable-line no-console
        }
    }

    showModal = (modalContent) => {
        const { theme } = this.props;
        switch (modalContent) {
            case 'print':
                return this.props.toggleModalActivity(modalContent, {
                    theme,
                    print: () => this.print(),
                    hideModal: () => this.props.toggleModalActivity(),
                });
        }
    };

    render() {
        const { t, theme: { body, secondary } } = this.props;
        const textColor = { color: body.color };
        const lineColor = { borderLeftColor: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                    <View style={{ flex: 0.7 }} />
                    <Header textColor={body.color}>{t('saveYourSeed')}</Header>
                </View>
                <View style={styles.midContainer}>
                    <Trans i18nKey="saveYourSeed:mustSaveYourSeed">
                        <Text style={[styles.infoText, textColor]}>
                            <Text style={styles.infoTextNormal}>You must save your seed with </Text>
                            <Text style={styles.infoTextBold}>at least one</Text>
                            <Text style={styles.infoTextNormal}> of the options listed below.</Text>
                        </Text>
                    </Trans>
                    <View style={{ flex: 0.5 }} />
                    <Text style={[styles.infoTextSmall, textColor]}>{t('mostSecure')}</Text>
                    <View style={[styles.line, lineColor]} />
                    {!isIPhone11 && (
                        <Button
                            onPress={() => this.onExportSeedVaultPress()}
                            style={{
                                wrapper: {
                                    width: width / 1.36,
                                    height: height / 13,
                                    borderRadius: height / 90,
                                    backgroundColor: secondary.color,
                                },
                                children: {
                                    color: secondary.body,
                                },
                            }}
                        >
                            {t('seedVault:exportSeedVault')}
                        </Button>
                    )}
                    {!isIPhone11 && <View style={[styles.line, lineColor]} />}
                    <Button
                        onPress={() => this.onWriteSeedDownPress()}
                        style={{
                            wrapper: {
                                width: width / 1.36,
                                height: height / 13,
                                borderRadius: height / 90,
                                backgroundColor: secondary.color,
                            },
                            children: {
                                color: secondary.body,
                            },
                        }}
                    >
                        {t('saveYourSeed:writeYourSeedDown')}
                    </Button>
                    <View style={[styles.line, lineColor]} />
                    {/* FIXME Temporarily disable paper wallet on Android */}
                    {!isAndroid && (
                        <View style={{ alignItems: 'center' }}>
                            <Button
                                onPress={() => this.onPrintPaperWalletPress()}
                                style={{
                                    wrapper: {
                                        width: width / 1.36,
                                        height: height / 13,
                                        borderRadius: height / 90,
                                        backgroundColor: secondary.color,
                                    },
                                    children: {
                                        color: secondary.body,
                                    },
                                }}
                            >
                                {t('global:paperWallet')}
                            </Button>
                            <View style={[styles.line, lineColor]} />
                        </View>
                    )}
                    <Text style={[styles.infoTextSmall, textColor]}>{t('leastSecure')}</Text>
                    <View style={{ flex: 1 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <DualFooterButtons
                        onLeftButtonPress={() => this.onBackPress()}
                        onRightButtonPress={() => this.onDonePress()}
                        leftButtonText={t('global:goBack')}
                        rightButtonText={t('iHavesavedMySeed')}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    onboardingComplete: state.accounts.onboardingComplete,
    seed: state.wallet.seed,
});

const mapDispatchToProps = {
    setSeedShareTutorialVisitationStatus,
    generateAlert,
    toggleModalActivity,
};

export default withNamespaces(['saveYourSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SaveYourSeed));
