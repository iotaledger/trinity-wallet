import React from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import i18next from 'i18next';
import { width, height } from '../util/dimensions';
import { selectLocale } from '../components/locale';
import modeImagePath from 'iota-wallet-shared-modules/images/mode.png';
import themeImagePath from 'iota-wallet-shared-modules/images/theme.png';
import currencyImagePath from 'iota-wallet-shared-modules/images/currency.png';
import languageImagePath from 'iota-wallet-shared-modules/images/language.png';
import accountImagePath from 'iota-wallet-shared-modules/images/account.png';
import twoFactorAuthImagePath from 'iota-wallet-shared-modules/images/2fa.png';
import passwordImagePath from 'iota-wallet-shared-modules/images/password.png';
import advancedImagePath from 'iota-wallet-shared-modules/images/advanced.png';
import logoutImagePath from 'iota-wallet-shared-modules/images/logout.png';
import { translate } from 'react-i18next';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    topContainer: {
        flex: 10,
        justifyContent: 'flex-end',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-end',
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
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    separator: {
        borderBottomColor: 'white',
        borderBottomWidth: height / 1500,
        width: width / 1.16,
        alignSelf: 'center',
    },
    separatorContainer: {
        flex: 0.5,
        justifyContent: 'center',
    },
    settingText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        marginLeft: width / 12,
        width: width / 2.2,
        backgroundColor: 'transparent',
    },
});

var t;

const MainSettings = props => (
    (t = props.t),
    (
        <View style={styles.container}>
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => props.onModePress()}>
                    <View style={styles.item}>
                        <View style={styles.innerItemContainerLeft}>
                            <Image source={modeImagePath} style={styles.icon} />
                            <Text style={styles.titleText}>{t('mode')}</Text>
                        </View>
                        <View style={styles.innerItemContainerRight}>
                            <Text style={styles.settingText}>{props.mode}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => props.onThemePress()}>
                    <View style={styles.item}>
                        <View style={styles.innerItemContainerLeft}>
                            <Image source={themeImagePath} style={styles.icon} />
                            <Text style={styles.titleText}>{t('theme')}</Text>
                        </View>
                        <View style={styles.innerItemContainerRight}>
                            <Text style={styles.settingText}>{props.themeName}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => props.setSetting('currencySelection')}>
                    <View style={styles.item}>
                        <View style={styles.innerItemContainerLeft}>
                            <Image source={currencyImagePath} style={styles.icon} />
                            <Text style={styles.titleText}>{t('currency')}</Text>
                        </View>
                        <View style={styles.innerItemContainerRight}>
                            <Text style={styles.settingText}>{props.currency}</Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => props.onLanguagePress()}>
                    <View style={styles.item}>
                        <View style={styles.innerItemContainerLeft}>
                            <Image source={languageImagePath} style={styles.icon} />
                            <Text style={styles.titleText}>{t('language')}</Text>
                        </View>
                        <View style={styles.innerItemContainerRight}>
                            <Text numberOfLines={1} style={styles.settingText}>
                                {selectLocale(i18next.language)}
                            </Text>
                        </View>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.separatorContainer}>
                <View style={styles.separator} />
            </View>
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => props.setSetting('accountManagement')}>
                    <View style={styles.item}>
                        <Image source={accountImagePath} style={styles.icon} />
                        <Text style={styles.titleText}>{t('accountManagement')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => props.on2FASetupPress()}>
                    <View style={styles.item}>
                        <Image source={twoFactorAuthImagePath} style={styles.icon} />
                        <Text style={styles.titleText}>{t('twoFA')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => props.setSetting('changePassword')}>
                    <View style={styles.item}>
                        <Image source={passwordImagePath} style={styles.icon} />
                        <Text style={styles.titleText}>{t('changePassword')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.separatorContainer}>
                <View style={styles.separator} />
            </View>
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => props.setSetting('advancedSettings')}>
                    <View style={styles.item}>
                        <Image source={advancedImagePath} style={styles.icon} />
                        <Text style={styles.titleText}>{t('advanced')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
            <View style={styles.itemContainer}>
                <TouchableOpacity onPress={() => props.setModalContent('logoutConfirmation')}>
                    <View style={styles.item}>
                        <Image source={logoutImagePath} style={styles.icon} />
                        <Text style={styles.titleText}>{t('logout')}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        </View>
    )
);

MainSettings.propTypes = {
    currency: PropTypes.string.isRequired,
    themeName: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    onModePress: PropTypes.func.isRequired,
    onLanguagePress: PropTypes.func.isRequired,
    setSetting: PropTypes.func.isRequired,
    setModalContent: PropTypes.func.isRequired,
    on2FASetupPress: PropTypes.func.isRequired,
    onThemePress: PropTypes.func.isRequired,
};

export default MainSettings;
