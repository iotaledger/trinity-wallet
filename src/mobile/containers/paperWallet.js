import React from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, StatusBar } from 'react-native';
import { connect } from 'react-redux';
import RNHTMLtoPDF from 'react-native-html-to-pdf';
import { RNPrint } from 'NativeModules';
import QRCode from 'react-native-qrcode-svg';
import RNFS from 'react-native-fs';
import { iotaLogo, arrow } from 'iota-wallet-shared-modules/libs/html.js';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { isAndroid, isIOS } from '../util/device';
import { width, height } from '../util/dimensions';
import COLORS from '../theme/Colors';
const qrPath = RNFS.DocumentDirectoryPath + '/qr.png';

let results = '';

class PaperWallet extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            checkboxImage: require('iota-wallet-shared-modules/images/checkbox-checked.png'),
            showIotaLogo: true,
            iotaLogoVisibility: 'visible',
            pressedPrint: false,
        };
        this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
    }

    onDonePress() {
        this.props.navigator.pop({ animated: false });
        if (this.state.pressedPrint) {
            RNFS.unlink(RNFS.DocumentDirectoryPath + '/qr.png');

            // Doesn't convert to PDF for android.
            if (isIOS) {
                Promise.resolve(RNFS.readDir(RNFS.TemporaryDirectoryPath)).then(item =>
                    item.forEach(item => RNFS.unlink(item.path)),
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
        this.getDataURL();
        this.setState({ pressedPrint: true });
        const qrPathOverride = isAndroid ? `file://${qrPath}` : qrPath;

        const options = {
            html: `
        <html>
        <div id="item">
        <img id="arrow" src="${arrow}" />
        <table id="seedBox">
            <tr>
                <td>${this.props.tempAccount.seed.substring(0, 3)}</td>
                <td>${this.props.tempAccount.seed.substring(3, 6)}</td>
                <td>${this.props.tempAccount.seed.substring(6, 9)}</td>
                <td>${this.props.tempAccount.seed.substring(9, 12)}</td>
            </tr>
            <tr>
                <td>${this.props.tempAccount.seed.substring(12, 15)}</td>
                <td>${this.props.tempAccount.seed.substring(15, 18)}</td>
                <td>${this.props.tempAccount.seed.substring(18, 21)}</td>
                <td>${this.props.tempAccount.seed.substring(21, 24)}</td>
            </tr>
            <tr>
                <td>${this.props.tempAccount.seed.substring(24, 27)}</td>
                <td>${this.props.tempAccount.seed.substring(27, 30)}</td>
                <td>${this.props.tempAccount.seed.substring(30, 33)}</td>
                <td>${this.props.tempAccount.seed.substring(33, 36)}</td>
            </tr>
            <tr>
                <td>${this.props.tempAccount.seed.substring(36, 39)}</td>
                <td>${this.props.tempAccount.seed.substring(39, 42)}</td>
                <td>${this.props.tempAccount.seed.substring(42, 45)}</td>
                <td>${this.props.tempAccount.seed.substring(45, 48)}</td>
            </tr>
            <tr>
                <td>${this.props.tempAccount.seed.substring(48, 51)}</td>
                <td>${this.props.tempAccount.seed.substring(51, 54)}</td>
                <td>${this.props.tempAccount.seed.substring(54, 57)}</td>
                <td>${this.props.tempAccount.seed.substring(57, 60)}</td>
            </tr>
            <tr>
                <td>${this.props.tempAccount.seed.substring(60, 63)}</td>
                <td>${this.props.tempAccount.seed.substring(63, 66)}</td>
                <td>${this.props.tempAccount.seed.substring(66, 69)}</td>
                <td>${this.props.tempAccount.seed.substring(69, 72)}</td>
            </tr>
            <tr>
                <td>${this.props.tempAccount.seed.substring(72, 75)}</td>
                <td>${this.props.tempAccount.seed.substring(75, 78)}</td>
                <td>${this.props.tempAccount.seed.substring(78, MAX_SEED_LENGTH)}</td>
            </tr>
        </table>
        </div>
        <div id="midItem">
            <img id="iotaLogo" src="${iotaLogo}" />
            <p id="text">Never share your<br />seed with anyone.</p>
        </div>
        <div id="item">
            <img src="${qrPathOverride}" width="235" height="235" />
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
                padding-top: 37px
            }
            #item {
                float: left;
            }
            #midItem {
                float: left;
                margin: 25px
            }
            #iotaLogo {
                width: 109.1px;
                height: 36.73px;
                position: absolute;
                left: 315px;
                top: 5px;
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
                results = await RNHTMLtoPDF.convert(options);
                jobName = await RNPrint.print(results.filePath);
            }
        } catch (err) {
            console.error(err);
        }
    }

    _renderIotaLogo() {
        if (this.state.showIotaLogo) {
            return (
                <Image
                    style={styles.paperWalletLogo}
                    source={require('iota-wallet-shared-modules/images/iota-full.png')}
                />
            );
        } else {
            return null;
        }
    }

    onCheckboxPress() {
        if (this.state.checkboxImage == require('iota-wallet-shared-modules/images/checkbox-checked.png')) {
            this.setState({
                checkboxImage: require('iota-wallet-shared-modules/images/checkbox-unchecked.png'),
                showIotaLogo: false,
                iotaLogoVisibility: 'hidden',
            });
        } else {
            this.setState({
                checkboxImage: require('iota-wallet-shared-modules/images/checkbox-checked.png'),
                showIotaLogo: true,
                iotaLogoVisibility: 'visible',
            });
        }
    }

    getDataURL() {
        this.svg.toDataURL(this.callback);
    }

    callback(dataURL) {
        RNFS.writeFile(qrPath, dataURL, 'base64');
    }

    render() {
        const { t } = this.props;

        return (
            <View style={styles.container}>
                <StatusBar barStyle="light-content" />
                <View style={styles.topContainer}>
                    <Image
                        source={require('iota-wallet-shared-modules/images/iota-glow.png')}
                        style={styles.iotaLogo}
                    />
                    <Text style={styles.infoText}>
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
                                <Image
                                    source={require('iota-wallet-shared-modules/images/arrow-black.png')}
                                    style={styles.arrow}
                                />
                                <View style={styles.seedBoxTextContainer}>
                                    <View>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(0, 3)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(12, 15)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(24, 27)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(36, 39)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(48, 51)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(60, 63)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(72, 75)}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(3, 6)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(15, 18)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(27, 30)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(39, 42)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(51, 54)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(63, 66)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(75, 78)}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(6, 9)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(18, 21)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(30, 33)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(42, 45)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(54, 57)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(66, 69)}
                                        </Text>
                                        <Text style={styles.seedBoxTextLeft}>
                                            {this.props.tempAccount.seed.substring(78, MAX_SEED_LENGTH)}
                                        </Text>
                                    </View>
                                    <View>
                                        <Text style={styles.seedBoxTextRight}>
                                            {this.props.tempAccount.seed.substring(9, 12)}
                                        </Text>
                                        <Text style={styles.seedBoxTextRight}>
                                            {this.props.tempAccount.seed.substring(21, 24)}
                                        </Text>
                                        <Text style={styles.seedBoxTextRight}>
                                            {this.props.tempAccount.seed.substring(33, 36)}
                                        </Text>
                                        <Text style={styles.seedBoxTextRight}>
                                            {this.props.tempAccount.seed.substring(45, 48)}
                                        </Text>
                                        <Text style={styles.seedBoxTextRight}>
                                            {this.props.tempAccount.seed.substring(57, 60)}
                                        </Text>
                                        <Text style={styles.seedBoxTextRight}>
                                            {this.props.tempAccount.seed.substring(69, 72)}
                                        </Text>
                                    </View>
                                </View>
                            </View>
                        </View>
                        <View style={styles.paperWalletTextContainer}>
                            {this._renderIotaLogo()}
                            <Text style={styles.paperWalletText}>{t('neverShare')}</Text>
                        </View>
                        <QRCode value={this.props.tempAccount.seed} getRef={c => (this.svg = c)} size={width / 3.5} />
                    </View>
                    <TouchableOpacity style={styles.checkboxContainer} onPress={event => this.onCheckboxPress()}>
                        <Image source={this.state.checkboxImage} style={styles.checkbox} />
                        <Text style={styles.checkboxText}>{t('iotaLogo')}</Text>
                    </TouchableOpacity>
                    <View style={{ paddingTop: height / 25 }}>
                        <TouchableOpacity onPress={event => this.onPrintPress()}>
                            <View style={styles.printButton}>
                                <Text style={styles.printText}>{t('printWallet')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={event => this.onDonePress()}>
                        <View style={styles.doneButton}>
                            <Text style={styles.doneText}>{t('global:done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
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
        borderRadius: 15,
        width: width / 1.6,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 29,
        textAlign: 'left',
        paddingTop: height / 8,
        paddingHorizontal: width / 8,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 29,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 29,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    doneButton: {
        borderColor: '#9DFFAF',
        borderWidth: 1.2,
        borderRadius: 10,
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
    printButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: 8,
        width: width / 2.5,
        height: height / 16,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#009f3f',
    },
    printText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
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
        borderRadius: 15,
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
        height: height / 6.5,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingBottom: height / 4,
    },
    paperWalletText: {
        color: 'black',
        fontSize: width / 40,
        fontFamily: 'Lato-Regular',
        textAlign: 'center',
        position: 'absolute',
        paddingTop: height / 9.5,
        backgroundColor: 'transparent',
    },
    paperWalletLogo: {
        resizeMode: 'contain',
        width: width / 7,
        height: height / 20,
        paddingBottom: height / 10,
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
});

const mapStateToProps = state => ({
    tempAccount: state.tempAccount,
});

export default translate(['paperWallet', 'global'])(connect(mapStateToProps)(PaperWallet));
