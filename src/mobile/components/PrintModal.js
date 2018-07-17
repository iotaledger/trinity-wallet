import React, { PureComponent } from 'react';
import { translate } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import tinycolor from 'tinycolor2';
import whiteCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-white.png';
import whiteCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-white.png';
import blackCheckboxCheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-checked-black.png';
import blackCheckboxUncheckedImagePath from 'iota-wallet-shared-modules/images/checkbox-unchecked-black.png';
import ModalButtons from '../containers/ModalButtons';
import GENERAL from '../theme/general';
import { width, height } from '../utils/dimensions';
import InfoBox from '../components/InfoBox';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';

const styles = StyleSheet.create({
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        height: height / 14,
    },
    checkboxText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        paddingLeft: width / 20,
        flex: 6,
    },
    checkbox: {
        width: width / 20,
        height: width / 20,
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
});

export class RootDetectionModal extends PureComponent {
    static propTypes = {
        /** Hides active modal */
        hideModal: PropTypes.func.isRequired,
        /** Prints paper wallet */
        print: PropTypes.func.isRequired,
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
            publicWifiChecked: false,
            publicPrinterChecked: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('PrintModal');
    }

    onPublicWifiCheckboxPress() {
        this.setState({
            publicWifiChecked: !this.state.publicWifiChecked,
        });
    }

    onPublicPrinterCheckboxPress() {
        this.setState({
            publicPrinterChecked: !this.state.publicPrinterChecked,
        });
    }

    onPrintPress() {
        const { publicPrinterChecked, publicWifiChecked } = this.state;
        if (publicWifiChecked && publicPrinterChecked) {
            this.props.print();
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

    render() {
        const { t, theme: { body } } = this.props;
        const { publicPrinterChecked, publicWifiChecked } = this.state;
        const opacity = publicWifiChecked && publicPrinterChecked ? 1 : 0.1;
        const textColor = { color: body.color };

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
                            <View>
                                <TouchableOpacity
                                    style={[styles.checkboxContainer, { paddingTop: height / 60 }]}
                                    onPress={() => this.onPublicWifiCheckboxPress()}
                                >
                                    <Image source={this.getCheckbox(publicWifiChecked)} style={styles.checkbox} />
                                    <Text style={[styles.checkboxText, textColor]}>{t('wifiCheckbox')}</Text>
                                </TouchableOpacity>
                                <TouchableOpacity
                                    style={styles.checkboxContainer}
                                    onPress={() => this.onPublicPrinterCheckboxPress()}
                                >
                                    <Image source={this.getCheckbox(publicPrinterChecked)} style={styles.checkbox} />
                                    <Text style={[styles.checkboxText, textColor]}>{t('printerCheckbox')}</Text>
                                </TouchableOpacity>
                            </View>
                            <View style={{ paddingTop: height / 18 }}>
                                <ModalButtons
                                    onLeftButtonPress={() => this.props.hideModal()}
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
    }
}

export default translate(['paperWallet', 'global'])(RootDetectionModal);
