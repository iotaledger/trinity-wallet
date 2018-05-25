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
import timer from 'react-native-timer';
import Modal from 'react-native-modal';
import tinycolor from 'tinycolor2';
import ModalButtons from '../containers/ModalButtons';
import GENERAL from '../theme/general';
import Button from '../components/Button';
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
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
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
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
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
        fontSize: GENERAL.fontSize1,
        textAlign: 'justify',
        letterSpacing: 2,
        backgroundColor: 'transparent',
        paddingRight: width / 70,
        paddingVertical: 1,
    },
    seedBoxTextRight: {
        color: 'black',
        fontFamily: 'Inconsolata-Bold',
        fontSize: GENERAL.fontSize1,
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
        fontSize: GENERAL.fontSize1,
        fontFamily: 'SourceSansPro-Regular',
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
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
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
        fontSize: GENERAL.fontSize1,
        color: 'black',
        fontFamily: 'SourceSansPro-Regular',
    },
    modalContainer: {
        width: width / 1.1,
        paddingVertical: height / 20,
    },
    modalCheckboxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: height / 14,
    },
    modalCheckboxText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
    },
    modalCheckbox: {
        width: width / 20,
        height: width / 20,
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
            iotaLogoCheckbox: true,
            publicWifiCheckbox: false,
            publicPrinterCheckbox: false,
            showIotaLogo: true,
            pressedPrint: false,
        };

        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    componentWillMount() {
        timer.clearTimeout('delayPrint');
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

    onIotaLogoCheckboxPress() {
        const { iotaLogoCheckbox, showIotaLogo } = this.state;
        this.setState({
            iotaLogoCheckbox: !iotaLogoCheckbox,
            showIotaLogo: !showIotaLogo,
        });
    }

    onPublicWifiCheckboxPress() {
        const { publicWifiCheckbox } = this.state;

        this.setState({
            publicWifiCheckbox: !publicWifiCheckbox,
        });
    }

    onPublicPrinterCheckboxPress() {
        const { publicPrinterCheckbox } = this.state;

        this.setState({
            publicPrinterCheckbox: !publicPrinterCheckbox,
        });
    }

    onPrintPress() {
        const { publicPrinterCheckbox, publicWifiCheckbox } = this.state;
        if (publicPrinterCheckbox && publicWifiCheckbox) {
            this.hideModal();
            timer.setTimeout('delayPrint', () => this.print(), 500);
        }
    }

    getCheckbox(checkboxChecked) {
        const { theme: { body } } = this.props;
        const isBgDark = tinycolor(body.bg).isDark();
        if (checkboxChecked) {
            return isBgDark ? whiteCheckboxCheckedImagePath : blackCheckboxCheckedImagePath;
        }
        return isBgDark ? whiteCheckboxUncheckedImagePath : blackCheckboxUncheckedImagePath;
    }

    getDataURL() {
        this.svg.toDataURL(PaperWallet.callback);
    }

    async print() {
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
            @font-face { font-family: "SourceSansPro"; src: "iota-wallet-shared-modules/custom-fonts/SourceSansPro-Regular.ttf" }
            @font-face { font-family: "Monospace"; src: "iota-wallet-shared-modules/custom-fonts/Inconsolata-Bold.ttf" }
            #text {
                font-family: "SourceSansPro";
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
                font-family: "SourceSansPro";
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
                visibility: ${this.state.showIotaLogo ? 'visible' : 'hidden'}
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

    openModal() {
        this.setState({ isModalActive: true });
    }

    hideModal() {
        this.setState({ isModalActive: false, publicPrinterCheckbox: false, publicWifiCheckbox: false });
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

    renderModalContent = () => {
        const { t, theme: { body } } = this.props;
        const { publicWifiCheckbox, publicPrinterCheckbox } = this.state;
        const textColor = { color: body.color };
        const opacity = publicWifiCheckbox && publicPrinterCheckbox ? 1 : 0.1;

        return (
            <View style={{ backgroundColor: body.bg, marginTop: height / 20 }}>
                <InfoBox
                    body={body}
                    width={width / 1.1}
                    text={
                        <View>
                            <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                                <Text style={styles.infoTextNormal}>{t('paperConvenience')} </Text>
                                <Text style={styles.infoTextBold}>{t('publicInsecure')}</Text>
                            </Text>
                            <Text style={[styles.infoTextBold, textColor, { paddingVertical: height / 30 }]}>
                                {t('tapCheckboxes')}
                            </Text>
                            <TouchableOpacity
                                style={[styles.modalCheckboxContainer, { paddingTop: height / 60 }]}
                                onPress={() => this.onPublicWifiCheckboxPress()}
                            >
                                <Text style={[styles.modalCheckboxText, textColor]}>{t('wifiCheckbox')}</Text>
                                <Image source={this.getCheckbox(publicWifiCheckbox)} style={styles.modalCheckbox} />
                            </TouchableOpacity>
                            <TouchableOpacity
                                style={styles.modalCheckboxContainer}
                                onPress={() => this.onPublicPrinterCheckboxPress()}
                            >
                                <Text style={[styles.modalCheckboxText, textColor]}>{t('printerCheckbox')}</Text>
                                <Image source={this.getCheckbox(publicPrinterCheckbox)} style={styles.modalCheckbox} />
                            </TouchableOpacity>
                            <View style={{ paddingTop: height / 18 }}>
                                <ModalButtons
                                    onLeftButtonPress={() => this.hideModal()}
                                    onRightButtonPress={() => this.onPrintPress()}
                                    leftText={t('global:back')}
                                    rightText={t('print')}
                                    opacity={opacity}
                                    containerWidth={{ width: width / 1.25 }}
                                    buttonWidth={{ width: width / 2.85 }}
                                />
                            </View>
                        </View>
                    }
                />
            </View>
        );
    };

    render() {
        const { t, seed, theme: { primary, body, secondary } } = this.props;
        const { isModalActive, iotaLogoCheckbox } = this.state;
        const textColor = { color: body.color };
        const checksum = getChecksum(seed);
        const isBgLight = tinycolor(body.bg).isLight();

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
                    <View
                        style={[
                            styles.paperWalletContainer,
                            isBgLight ? { borderColor: body.color, borderWidth: 1 } : null,
                        ]}
                    >
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
                    <TouchableOpacity style={styles.checkboxContainer} onPress={() => this.onIotaLogoCheckboxPress()}>
                        <Image source={this.getCheckbox(iotaLogoCheckbox)} style={styles.checkbox} />
                        <Text style={[styles.checkboxText, textColor]}>{t('iotaLogo')}</Text>
                    </TouchableOpacity>
                    <View style={{ flex: 0.3 }} />
                    <Button
                        style={{
                            wrapper: {
                                width: width / 1.1,
                                height: height / 13,
                                borderRadius: height / 90,
                                backgroundColor: secondary.color,
                            },
                            children: { color: secondary.body },
                        }}
                        onPress={() => this.openModal()}
                    >
                        {t('printWallet')}
                    </Button>
                    <View style={{ flex: 1.5 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <Button
                        onPress={() => this.onDonePress()}
                        style={{
                            wrapper: { backgroundColor: primary.color },
                            children: { color: primary.body },
                        }}
                    >
                        {t('global:doneLowercase')}
                    </Button>
                </View>
                <Modal
                    backdropTransitionInTiming={isAndroid ? 500 : 300}
                    backdropTransitionOutTiming={200}
                    backdropColor={body.bg}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center', margin: 0 }}
                    isVisible={isModalActive}
                    onBackButtonPress={() => this.hideModal()}
                    hideModalContentWhileAnimating
                    useNativeDriver={isAndroid}
                >
                    {this.renderModalContent()}
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
});

export default translate(['paperWallet', 'global'])(connect(mapStateToProps)(PaperWallet));
