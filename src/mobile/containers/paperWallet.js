import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image } from 'react-native';
import { connect } from 'react-redux';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { RNPrint } from 'NativeModules'; // eslint-disable-line import/no-unresolved
import PropTypes from 'prop-types';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import { iotaLogo, arrow } from 'iota-wallet-shared-modules/libs/html';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import iotaFullImagePath from 'iota-wallet-shared-modules/images/iota-full.png';
import whiteCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-white.png';
import whiteCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-white.png';
import blackCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-black.png';
import blackCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-black.png';
import arrowBlackImagePath from 'iota-wallet-shared-modules/images/arrow-black.png';
import { getChecksum } from 'iota-wallet-shared-modules/libs/iota/utils';
import tinycolor from 'tinycolor2';
import GENERAL from '../theme/general';
import CtaButton from '../components/ctaButton';
import { isAndroid, isIOS } from '../util/device';
import { width, height } from '../util/dimensions';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        paddingTop: height / 14,
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
        fontFamily: 'Lato-Light',
        fontSize: width / 29,
        paddingTop: height / 8,
        paddingHorizontal: width / 8,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'Lato-Light',
        fontSize: width / 29,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 29,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    doneButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    doneText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    paperWalletContainer: {
        width: width / 1.1,
        height: height / 4.3,
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: width / 30,
        paddingVertical: height / 50,
    },
    seedBox: {
        borderColor: 'black',
        borderWidth: 1,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 3.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    seedBoxTextContainer: {
        width: width / 1.65,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: height / 100,
    },
    seedBoxTextLeft: {
        color: 'black',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 40,
        textAlign: 'justify',
        letterSpacing: 2,
        backgroundColor: 'transparent',
        paddingRight: width / 70,
        paddingVertical: 1,
    },
    seedBoxTextRight: {
        color: 'black',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 40,
        textAlign: 'justify',
        letterSpacing: 2,
        backgroundColor: 'transparent',
        paddingVertical: 1,
    },
    arrow: {
        width: width / 4,
        height: height / 160,
    },
    paperWalletTextContainer: {
        width: width / 5,
        height: height / 6,
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    paperWalletText: {
        color: 'black',
        fontSize: width / 40,
        fontFamily: 'Lato-Regular',
        textAlign: 'center',
        backgroundColor: 'transparent',
        paddingBottom: height / 80,
    },
    paperWalletLogo: {
        resizeMode: 'contain',
        width: width / 7,
        height: height / 18,
        paddingBottom: height / 20,
    },
    checkboxContainer: {
        height: height / 15,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 50,
    },
    checkbox: {
        width: width / 30,
        height: width / 30,
    },
    checkboxText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        color: 'white',
        backgroundColor: 'transparent',
        paddingLeft: width / 80,
    },
    checksum: {
        width: width / 12,
        height: height / 35,
        borderRadius: GENERAL.borderRadiusSmall,
        borderColor: 'black',
        borderWidth: height / 1000,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checksumText: {
        fontSize: width / 37.6,
        color: 'black',
        fontFamily: 'Lato-Regular',
    },
});

const qrPath = `${RNFS.DocumentDirectoryPath}/qr.png`;
class PaperWallet extends Component {
    static propTypes = {
        body: PropTypes.object.isRequired,
        navigator: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        seed: PropTypes.string.isRequired,
        positive: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        secondary: PropTypes.object.isRequired,
    };

    static callback(dataURL) {
        RNFS.writeFile(qrPath, dataURL, 'base64');
    }

    constructor(props) {
        super(props);

        this.state = {
            checkboxImage: tinycolor(props.body.bg).isDark()
                ? whiteCheckboxCheckedImagePath
                : blackCheckboxCheckedImagePath,
            showIotaLogo: true,
            iotaLogoVisibility: 'visible',
            pressedPrint: false,
        };

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onDonePress() {
        const { body } = this.props;
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
        if (this.state.pressedPrint) {
            RNFS.unlink(qrPath);

            // Doesn't convert to PDF for android.
            if (isIOS) {
                Promise.resolve(RNFS.readDir(RNFS.TemporaryDirectoryPath)).then((item) =>
                    item.forEach((i) => RNFS.unlink(i.path)),
                );
            }
        }
    }

    onNavigatorEvent(event) {
        if (event.id === 'willAppear') {
            this.props.navigator.toggleNavBar({
                to: 'hidden',
            });
        }
    }

    async onPrintPress() {
        const { seed } = this.props;
        this.getDataURL();
        this.setState({ pressedPrint: true });
        const qrPathOverride = isAndroid ? `file://${qrPath}` : qrPath;
        const checksum = getChecksum(seed);
        const options = {
            html: `
        <html>
        <div id="item">
        <img id="arrow" src="${arrow}" />
        <table id="seedBox">
            <tr>
                <td>${seed.substring(0, 3)}</td>
                <td>${seed.substring(3, 6)}</td>
                <td>${seed.substring(6, 9)}</td>
                <td>${seed.substring(9, 12)}</td>
            </tr>
            <tr>
                <td>${seed.substring(12, 15)}</td>
                <td>${seed.substring(15, 18)}</td>
                <td>${seed.substring(18, 21)}</td>
                <td>${seed.substring(21, 24)}</td>
            </tr>
            <tr>
                <td>${seed.substring(24, 27)}</td>
                <td>${seed.substring(27, 30)}</td>
                <td>${seed.substring(30, 33)}</td>
                <td>${seed.substring(33, 36)}</td>
            </tr>
            <tr>
                <td>${seed.substring(36, 39)}</td>
                <td>${seed.substring(39, 42)}</td>
                <td>${seed.substring(42, 45)}</td>
                <td>${seed.substring(45, 48)}</td>
            </tr>
            <tr>
                <td>${seed.substring(48, 51)}</td>
                <td>${seed.substring(51, 54)}</td>
                <td>${seed.substring(54, 57)}</td>
                <td>${seed.substring(57, 60)}</td>
            </tr>
            <tr>
                <td>${seed.substring(60, 63)}</td>
                <td>${seed.substring(63, 66)}</td>
                <td>${seed.substring(66, 69)}</td>
                <td>${seed.substring(69, 72)}</td>
            </tr>
            <tr>
                <td>${seed.substring(72, 75)}</td>
                <td>${seed.substring(75, 78)}</td>
                <td>${seed.substring(78, MAX_SEED_LENGTH)}</td>
            </tr>
        </table>
        </div>
        <div id="midItem">
            <img id="iotaLogo" src="${iotaLogo}" />
            <p id="text">Never share your<br />seed with anyone.</p>
            <div id="checksumContainer">
                <p id="checksum">${checksum}</p>
            </div>
        </div>
        <div id="item">
            <img src="${qrPathOverride}" width="226" height="226" />
        </div>
        <style>
            #seedBox {
                margin-left: 20px;
                padding-left: 6px;
                padding-right: 6px;
                padding-top: 30px;
                padding-bottom: 10px;
                border: solid #000;
                border-width: 2px;
                border-radius: 20px
            }
            @font-face { font-family: "Lato"; src: "iota-wallet-shared-modules/custom-fonts/Lato-Regular.ttf" }
            @font-face { font-family: "Monospace"; src: "iota-wallet-shared-modules/custom-fonts/Inconsolata-Bold.ttf" }
            #text {
                font-family: "Lato";
                font-size: 20px;
                text-align: center;
                padding-top: 42px;
                margin-bottom: 57px;

            }
            #checksumContainer {
                text-align: center;
                marginTop: 100px;
            }
            #checksum {
                font-family: "Lato";
                font-size: 20px;
                margin-top: 100px;
                border: solid #000;
                border-width: 2px;
                border-radius: 9px;
                padding-top: 7px;
                padding-bottom: 7px;
                padding-right: 10px;
                padding-left: 10px;
                display: inline;
                text-align: center;
            }
            #item {
                float: left;
            }
            #midItem {
                float: left;
                margin: 25px;
            }
            #iotaLogo {
                width: 109.1px;
                height: 36.73px;
                position: absolute;
                left: 310px;
                top: 18px;
                visibility: ${this.state.iotaLogoVisibility}
            }
            td {
                padding-left: 7px;
                padding-right: 7px;
                font-size: 21px;
                font-family: Monospace
            }
            #arrow {
                position: absolute;
                left: 45px;
                top: 25px;
                width: 200px;
                height: 9.68px
            }
        </style>
        </html>`,
            fileName: 'paperWallet',
            base64: true,
            fonts: ['iota-wallet-shared-modules/custom-fonts/Inconsolata-Bold.ttf'],
        };

        try {
            this.props.navigator.toggleNavBar({
                to: 'shown',
            });
            if (isAndroid) {
                await RNPrint.printhtml(options.html);
            } else {
                const results = await RNHTMLtoPDF.convert(options);
                await RNPrint.print(results.filePath);
            }
        } catch (err) {
            console.error(err);
        }
    }

    onCheckboxPress() {
        const { body } = this.props;
        const checkboxUncheckedImagePath = tinycolor(body.bg).isDark()
            ? whiteCheckboxUncheckedImagePath
            : blackCheckboxUncheckedImagePath;
        const checkboxCheckedImagePath = tinycolor(body.bg).isDark()
            ? whiteCheckboxCheckedImagePath
            : blackCheckboxCheckedImagePath;

        if (this.state.checkboxImage === checkboxCheckedImagePath) {
            this.setState({
                checkboxImage: checkboxUncheckedImagePath,
                showIotaLogo: false,
                iotaLogoVisibility: 'hidden',
            });
        } else {
            this.setState({
                checkboxImage: checkboxCheckedImagePath,
                showIotaLogo: true,
                iotaLogoVisibility: 'visible',
            });
        }
    }

    getDataURL() {
        this.svg.toDataURL(PaperWallet.callback);
    }

    renderIotaLogo() {
        if (this.state.showIotaLogo) {
            return (
                <View style={{ flex: 0.5 }}>
                    <Image style={styles.paperWalletLogo} source={iotaFullImagePath} />
                </View>
            );
        }
        return <View style={{ flex: 0.5 }} />;
    }

    render() {
        const { t, seed, body, positive, primary, secondary } = this.props;
        const textColor = { color: body.color };
        const checksum = getChecksum(seed);
        const positiveColorText = { color: positive.color };
        const positiveColorBorder = { borderColor: positive.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                    <Text style={[styles.infoText, textColor]}>
                        <Text style={styles.infoTextNormal}>{t('clickToPrint')}</Text>
                        <Text style={styles.infoTextBold}> {t('storeSafely')}</Text>
                    </Text>
                </View>
                <View style={styles.midContainer}>
                    <View style={styles.paperWalletContainer}>
                        <View style={styles.seedBox}>
                            <View
                                style={{ paddingVertical: height / 80, alignItems: 'center', justifyContent: 'center' }}
                            >
                                <Image source={arrowBlackImagePath} style={styles.arrow} />
                                <View style={styles.seedBoxTextContainer}>
                                    <View>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(0, 3)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(12, 15)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(24, 27)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(36, 39)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(48, 51)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(60, 63)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(72, 75)}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(3, 6)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(15, 18)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(27, 30)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(39, 42)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(51, 54)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(63, 66)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(75, 78)}</Text>
                                    </View>
                                    <View>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(6, 9)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(18, 21)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(30, 33)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(42, 45)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(54, 57)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>{seed.substring(66, 69)}</Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {seed.substring(78, MAX_SEED_LENGTH)}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.seedBoxTextRight}>{seed.substring(9, 12)}</Text>
                                        <Text style={styles.seedBoxTextRight}>{seed.substring(21, 24)}</Text>
                                        <Text style={styles.seedBoxTextRight}>{seed.substring(33, 36)}</Text>
                                        <Text style={styles.seedBoxTextRight}>{seed.substring(45, 48)}</Text>
                                        <Text style={styles.seedBoxTextRight}>{seed.substring(57, 60)}</Text>
                                        <Text style={styles.seedBoxTextRight}>{seed.substring(69, 72)}</Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.paperWalletTextContainer}>
                            {this.renderIotaLogo()}
                            <Text style={styles.paperWalletText}>{t('neverShare')}</Text>
                            <View style={styles.checksum}>
                                <Text style={styles.checksumText}>{checksum}</Text>
                            </View>
                        </View>
                        <QRCode
                            value={seed}
                            getRef={(c) => {
                                this.svg = c;
                            }}
                            size={width / 3.4}
                        />
                    </View>
                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => this.onCheckboxPress()}>
                        <Image source={this.state.checkboxImage} style={styles.checkbox} />
                        <Text style={[styles.checkboxText, textColor]}>{t('iotaLogo')}</Text>
                    </TouchableOpacity>
                    <View style={{ paddingTop: height / 25 }}>
                        <CtaButton
                            ctaColor={primary.color}
                            ctaBorderColor={primary.hover}
                            secondaryCtaColor={secondary.color}
                            text={t('printWallet')}
                            onPress={() => {
                                this.onPrintPress();
                            }}
                            ctaWidth={width / 1.1}
                        />
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onDonePress()}>
                        <View style={[styles.doneButton, positiveColorBorder]}>
                            <Text style={[styles.doneText, positiveColorText]}>{t('global:done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.tempAccount.seed,
    backgroundColor: state.settings.theme.backgroundColor,
    positive: state.settings.theme.positive,
    primary: state.settings.theme.primary,
    body: state.settings.theme.body,
    secondary: state.settings.theme.secondary,
});

export default translate(['paperWallet', 'global'])(connect(mapStateToProps)(PaperWallet));
