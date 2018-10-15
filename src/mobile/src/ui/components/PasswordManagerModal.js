import React, { PureComponent } from 'react';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, Image, Linking } from 'react-native';
import tinycolor from 'tinycolor2';
import whiteCheckboxCheckedImagePath from 'shared-modules/images/checkbox-checked-white.png';
import whiteCheckboxUncheckedImagePath from 'shared-modules/images/checkbox-unchecked-white.png';
import blackCheckboxCheckedImagePath from 'shared-modules/images/checkbox-checked-black.png';
import blackCheckboxUncheckedImagePath from 'shared-modules/images/checkbox-unchecked-black.png';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import InfoBox from './InfoBox';
import ModalButtons from './ModalButtons';

const styles = StyleSheet.create({
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoLinkWrapper: {
        paddingTop: height / 40,
        textAlign: 'center',
    },
    infoLink: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: width / 27.6,
        textDecorationLine: 'underline',
    },
    checkboxContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        height: height / 14,
        marginVertical: height / 30,
    },
    checkboxText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
    },
    checkbox: {
        width: width / 20,
        height: width / 20,
    },
});

export class PasswordManagerModal extends PureComponent {
    static propTypes = {
        /** Hides active modal */
        hideModal: PropTypes.func.isRequired,
        /** Copy or add to password manager */
        copy: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        hasVisitedSeedShareTutorial: PropTypes.bool.isRequired,
        /** @ignore */
        setSeedShareTutorialVisitationStatus: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            checked: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('PasswordManagerModal');
    }

    onCopyPress() {
        if (this.state.checked || this.props.hasVisitedSeedShareTutorial) {
            this.props.copy();
        }
    }

    getCheckbox() {
        const { theme: { body } } = this.props;
        const { checked } = this.state;
        const isBgDark = tinycolor(body.bg).isDark();
        if (checked) {
            return isBgDark ? whiteCheckboxCheckedImagePath : blackCheckboxCheckedImagePath;
        }
        return isBgDark ? whiteCheckboxUncheckedImagePath : blackCheckboxUncheckedImagePath;
    }

    render() {
        const { t, theme: { body }, hasVisitedSeedShareTutorial } = this.props;
        const { checked } = this.state;
        const textColor = { color: body.color };
        const iOSOpacity = checked ? 1 : 0.1;
        const androidOpacity = hasVisitedSeedShareTutorial ? 1 : 0.1;

        return (
            <View style={{ backgroundColor: body.bg, marginTop: height / 20 }}>
                <InfoBox
                    body={body}
                    width={width / 1.1}
                    text={
                        isAndroid ? (
                            <View>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                                    <Text style={styles.infoTextNormal}>{t('global:masterKey')} </Text>
                                    <Text style={styles.infoTextNormal}>
                                        {t('global:mustBeStoredAppropriately')}{' '}
                                        {t('global:androidInsecureClipboardWarning')}
                                    </Text>
                                </Text>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                                    <Text style={styles.infoTextNormal}>{`${t(
                                        'followTutorialToSecurelyShareSeed',
                                    )}:`}</Text>
                                </Text>
                                <Text style={[styles.infoLinkWrapper, textColor]}>
                                    <Text
                                        style={styles.infoLink}
                                        onPress={() => {
                                            this.props.setSeedShareTutorialVisitationStatus(true);
                                            Linking.openURL(
                                                'https://gist.github.com/marcusjang/0491b719ace4b1875147568431b70ebd',
                                            );
                                        }}
                                    >
                                        {t('global:usingTrinityWalletWithKeePass')}
                                    </Text>
                                </Text>
                                <Text style={[styles.infoTextBold, textColor, { paddingTop: height / 40 }]}>
                                    {t('global:androidCopyPasteWarning')}
                                </Text>
                                <View style={{ paddingTop: height / 18 }}>
                                    <ModalButtons
                                        onLeftButtonPress={() => this.props.hideModal()}
                                        onRightButtonPress={() => this.onCopyPress(hasVisitedSeedShareTutorial)}
                                        leftText={t('global:back')}
                                        rightText={t('global:proceed').toUpperCase()}
                                        opacity={androidOpacity}
                                        containerWidth={{ width: width / 1.25 }}
                                        buttonWidth={{ width: width / 2.85 }}
                                    />
                                </View>
                            </View>
                        ) : (
                            <View>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                                    <Text style={styles.infoTextNormal}>{t('global:masterKey')} </Text>
                                    <Text style={styles.infoTextNormal}>{t('storeEncrypted')} </Text>
                                </Text>
                                <Text style={[styles.infoTextBold, textColor, { paddingTop: height / 30 }]}>
                                    {t('tapConfirm')}
                                </Text>
                                <TouchableOpacity
                                    style={[styles.checkboxContainer]}
                                    onPress={() => this.setState({ checked: !checked })}
                                >
                                    <Image source={this.getCheckbox()} style={styles.checkbox} />
                                    <Text style={[styles.checkboxText, textColor]}>{t('passwordManagerCheckbox')}</Text>
                                </TouchableOpacity>
                                <Text style={[styles.infoTextBold, textColor]}>{t('doNotOpen')} </Text>
                                <View style={{ paddingTop: height / 18 }}>
                                    <ModalButtons
                                        onLeftButtonPress={() => this.props.hideModal()}
                                        onRightButtonPress={() => this.onCopyPress()}
                                        leftText={t('global:back')}
                                        rightText={t('copy')}
                                        opacity={iOSOpacity}
                                        containerWidth={{ width: width / 1.25 }}
                                        buttonWidth={{ width: width / 2.85 }}
                                    />
                                </View>
                            </View>
                        )
                    }
                />
            </View>
        );
    }
}

export default withNamespaces(['copyToClipboard', 'global'])(PasswordManagerModal);
