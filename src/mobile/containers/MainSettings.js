import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Navigation } from 'react-native-navigation';
import i18next from 'i18next';
import { toggleModalActivity } from 'iota-wallet-shared-modules/actions/ui';
import { selectLocale } from 'iota-wallet-shared-modules/libs/locale';
import { setSetting, clearWalletData, setPassword } from 'iota-wallet-shared-modules/actions/wallet';
import LogoutConfirmationModalComponent from '../components/LogoutConfirmationModal';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons';
import { isAndroid } from '../utils/device';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    innerItemContainerLeft: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    innerItemContainerRight: {
        flex: 2.3,
        justifyContent: 'center',
        alignItems: 'flex-start',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: width / 15,
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 25,
    },
    separator: {
        borderBottomWidth: 0.25,
        width: width / 1.16,
        alignSelf: 'center',
    },
    separatorContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    settingText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        marginLeft: width / 12,
        width: width / 2.2,
        backgroundColor: 'transparent',
    },
});

/** Main Settings component */
export class MainSettings extends Component {
    static propTypes = {
        /** Currently selected application mode (Expert or Standard) */
        mode: PropTypes.string.isRequired,
        /** Currently selected currency */
        currency: PropTypes.string.isRequired,
        /** Currently selected theme name */
        themeName: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Clears wallet reducer data */
        clearWalletData: PropTypes.func.isRequired,
        /** Set new password hash
         * @param {string} passwordHash
         */
        setPassword: PropTypes.func.isRequired,
        /** Sets whether modal is active or inactive */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            isModalActive: false,
        };

        this.toggleModalDisplay = this.toggleModalDisplay.bind(this);
        this.logout = this.logout.bind(this);
    }

    toggleModalDisplay() {
        this.props.toggleModalActivity();
        this.setState({ isModalActive: !this.state.isModalActive });
    }

    logout() {
        const { theme: { body } } = this.props;

        this.props.clearWalletData();
        this.props.setPassword('');

        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
                    screenBackgroundColor: body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: body.bg,
                },
                overrideBackPress: true,
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: true,
            },
        });
    }

    renderModalContent() {
        const { theme: { body, bar } } = this.props;
        const textColor = { color: body.color };
        const bodyColor = body.color;

        return (
            <LogoutConfirmationModalComponent
                style={{ flex: 1 }}
                hideModal={this.toggleModalDisplay}
                logout={this.logout}
                backgroundColor={{ backgroundColor: body.bg }}
                textColor={textColor}
                borderColor={{ borderColor: bodyColor }}
                barBg={bar.bg}
            />
        );
    }

    render() {
        const { theme, mode, t, themeName, currency } = this.props;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;
        const borderBottomColor = { borderBottomColor: theme.body.color };

        return (
            <View style={styles.container}>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('modeSelection')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <View style={styles.innerItemContainerLeft}>
                                <Icon name="mode" size={width / 22} color={bodyColor} />
                                <Text style={[styles.titleText, textColor]}>{t('mode')}</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text style={[styles.settingText, textColor]}>{mode}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('themeCustomisation')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <View style={styles.innerItemContainerLeft}>
                                <Icon name="theme" size={width / 22} color={bodyColor} />
                                <Text style={[styles.titleText, textColor]}>{t('theme')}</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text style={[styles.settingText, textColor]}>{themeName}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('currencySelection')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <View style={styles.innerItemContainerLeft}>
                                <Icon name="currency" size={width / 22} color={bodyColor} />
                                <Text style={[styles.titleText, textColor]}>{t('currency')}</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text style={[styles.settingText, textColor]}>{currency}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('languageSelection')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <View style={styles.innerItemContainerLeft}>
                                <Icon name="language" size={width / 22} color={bodyColor} />
                                <Text style={[styles.titleText, textColor]}>{t('language')}</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text numberOfLines={1} style={[styles.settingText, textColor]}>
                                    {selectLocale(i18next.language)}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.separatorContainer}>
                    <View style={[styles.separator, borderBottomColor]} />
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('accountManagement')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="user" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('accountManagement')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('securitySettings')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="security" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('securitySettings')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('advancedSettings')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="advanced" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('advanced')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.separatorContainer}>
                    <View style={[styles.separator, borderBottomColor]} />
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('about')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="info" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('aboutTrinity')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={this.toggleModalDisplay}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="logout" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('logout')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 1 }}/>
                <Modal
                    animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                    animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                    animationInTiming={isAndroid ? 1000 : 300}
                    animationOutTiming={200}
                    backdropTransitionInTiming={isAndroid ? 500 : 300}
                    backdropTransitionOutTiming={200}
                    backdropColor={theme.body.bg}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center', justifyContent: 'center', margin: 0 }}
                    isVisible={this.state.isModalActive}
                    onBackButtonPress={this.toggleModalDisplay}
                    useNativeDriver={isAndroid ? true : false}
                    hideModalContentWhileAnimating
                >
                    {this.renderModalContent()}
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    mode: state.settings.mode,
    currency: state.settings.currency,
    themeName: state.settings.themeName,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
    clearWalletData,
    setPassword,
    toggleModalActivity,
};

export default translate(['settings', 'global'])(connect(mapStateToProps, mapDispatchToProps)(MainSettings));
