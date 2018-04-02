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
import { MAX_SEED_LENGTH, getChecksum } from 'iota-wallet-shared-modules/libs/iota/utils';
import iotaFullImagePath from 'iota-wallet-shared-modules/images/iota-full.png';
import whiteCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-white.png';
import whiteCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-white.png';
import blackCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-black.png';
import blackCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-black.png';
import tinycolor from 'tinycolor2';
import GENERAL from '../theme/general';
import CtaButton from '../components/CtaButton';
import { isAndroid, isIOS } from '../utils/device';
import { width, height } from '../utils/dimensions';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { Icon } from '../theme/icons.js';
import InfoBox from '../components/InfoBox';
import Seedbox from '../components/SeedBox';

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
        paddingHorizontal: width / 20,
    },
    midContainer: {
        flex: 4,
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
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'justify',
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
        backgroundColor: 'white',
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-around',
        paddingHorizontal: width / 60,
        paddingVertical: height / 40,
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
        borderWidth: 1,
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

/** Paper Wallet component */
class PaperWallet extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    static callback(dataURL) {
        RNFS.writeFile(qrPath, dataURL, 'base64');
    }

    constructor(props) {
        super(props);

        this.state = {
            checkboxImage: tinycolor(props.theme.body.bg).isDark()
                ? whiteCheckboxCheckedImagePath
                : blackCheckboxCheckedImagePath,
            showIotaLogo: true,
            iotaLogoVisibility: 'visible',
            pressedPrint: false,
        };

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onDonePress() {
        const { theme: { body } } = this.props;
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
        const { theme: { body } } = this.props;
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
        const { t, seed, theme: { body, primary } } = this.props;
        const textColor = { color: body.color };
        const checksum = getChecksum(seed);

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.3 }} />
                    <InfoBox
                        body={body}
                        width={width / 1.1}
                        text={
                            <Text style={[styles.infoText, textColor]}>
                                <Text style={styles.infoTextNormal}>{t('clickToPrint')}</Text>
                                <Text style={styles.infoTextBold}> {t('storeSafely')}</Text>
                            </Text>
                        }
                    />
                    <View style={{ flex: 0.5 }} />
                    <View style={styles.paperWalletContainer}>
                        <Seedbox
                            scale={0.51}
                            bodyColor="black"
                            borderColor={{ borderColor: 'black' }}
                            textColor={{ color: 'black' }}
                            seed={seed}
                        />
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
                            size={width / 3.5}
                        />
                    </View>
                    <View style={{ flex: 0.3 }} />
                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => this.onCheckboxPress()}>
                        <Image source={this.state.checkboxImage} style={styles.checkbox} />
                        <Text style={[styles.checkboxText, textColor]}>{t('iotaLogo')}</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 0.3 }} />
                    <CtaButton
                        ctaColor={primary.color}
                        ctaBorderColor={primary.hover}
                        secondaryCtaColor={primary.body}
                        text={t('printWallet')}
                        onPress={() => {
                            this.onPrintPress();
                        }}
                        ctaWidth={width / 1.1}
                    />
                    <View style={{ flex: 1.5 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onDonePress()}>
                        <View style={[styles.doneButton, { borderColor: primary.color }]}>
                            <Text style={[styles.doneText, { color: primary.color }]}>{t('global:done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
});

export default translate(['paperWallet', 'global'])(connect(mapStateToProps)(PaperWallet));
