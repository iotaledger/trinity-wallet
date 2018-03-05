import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import i18next from 'i18next';
import { width, height } from '../util/dimensions';
import { selectLocale } from '../components/locale';
import { Icon } from '../theme/icons.js';

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
    titleText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 25,
    },
    separator: {
        borderBottomWidth: height / 1500,
        width: width / 1.16,
        alignSelf: 'center',
    },
    separatorContainer: {
        flex: 0.5,
        justifyContent: 'center',
    },
    settingText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        marginLeft: width / 12,
        width: width / 2.2,
        backgroundColor: 'transparent',
    },
});

const MainSettings = (props) => (
    <View style={styles.container}>
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={() => props.onModePress()}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.item}>
                    <View style={styles.innerItemContainerLeft}>
                        <Icon name="mode" size={width / 22} color={props.secondaryBackgroundColor} />
                        <Text style={[styles.titleText, props.textColor]}>{props.t('mode')}</Text>
                    </View>
                    <View style={styles.innerItemContainerRight}>
                        <Text style={[styles.settingText, props.textColor]}>{props.mode}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={() => props.onThemePress()}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.item}>
                    <View style={styles.innerItemContainerLeft}>
                        <Icon name="theme" size={width / 22} color={props.secondaryBackgroundColor} />
                        <Text style={[styles.titleText, props.textColor]}>{props.t('theme')}</Text>
                    </View>
                    <View style={styles.innerItemContainerRight}>
                        <Text style={[styles.settingText, props.textColor]}>{props.themeName}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={() => props.setSetting('currencySelection')}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.item}>
                    <View style={styles.innerItemContainerLeft}>
                        <Icon name="currency" size={width / 22} color={props.secondaryBackgroundColor} />
                        <Text style={[styles.titleText, props.textColor]}>{props.t('currency')}</Text>
                    </View>
                    <View style={styles.innerItemContainerRight}>
                        <Text style={[styles.settingText, props.textColor]}>{props.currency}</Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={() => props.onLanguagePress()}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.item}>
                    <View style={styles.innerItemContainerLeft}>
                        <Icon name="language" size={width / 22} color={props.secondaryBackgroundColor} />
                        <Text style={[styles.titleText, props.textColor]}>{props.t('language')}</Text>
                    </View>
                    <View style={styles.innerItemContainerRight}>
                        <Text numberOfLines={1} style={[styles.settingText, props.textColor]}>
                            {selectLocale(i18next.language)}
                        </Text>
                    </View>
                </View>
            </TouchableOpacity>
        </View>
        <View style={styles.separatorContainer}>
            <View style={[styles.separator, props.borderBottomColor]} />
        </View>
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={() => props.setSetting('accountManagement')}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.item}>
                    <Icon name="user" size={width / 22} color={props.secondaryBackgroundColor} />
                    <Text style={[styles.titleText, props.textColor]}>{props.t('accountManagement')}</Text>
                </View>
            </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={() => props.setSetting('changePassword')}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.item}>
                    <Icon name="password" size={width / 22} color={props.secondaryBackgroundColor} />
                    <Text style={[styles.titleText, props.textColor]}>{props.t('changePassword')}</Text>
                </View>
            </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={() => props.setSetting('securitySettings')}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.item}>
                    <Icon name="twoFA" size={width / 22} color={props.secondaryBackgroundColor} />
                    <Text style={[styles.titleText, props.textColor]}>{props.t('securitySettings')}</Text>
                </View>
            </TouchableOpacity>
        </View>
        <View style={styles.separatorContainer}>
            <View style={[styles.separator, props.borderBottomColor]} />
        </View>
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={() => props.setSetting('advancedSettings')}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.item}>
                    <Icon name="advanced" size={width / 22} color={props.secondaryBackgroundColor} />
                    <Text style={[styles.titleText, props.textColor]}>{props.t('advanced')}</Text>
                </View>
            </TouchableOpacity>
        </View>
        <View style={styles.itemContainer}>
            <TouchableOpacity
                onPress={() => props.setModalContent('logoutConfirmation')}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.item}>
                    <Icon name="logout" size={width / 22} color={props.secondaryBackgroundColor} />
                    <Text style={[styles.titleText, props.textColor]}>{props.t('logout')}</Text>
                </View>
            </TouchableOpacity>
        </View>
    </View>
);

MainSettings.propTypes = {
    currency: PropTypes.string.isRequired,
    themeName: PropTypes.string.isRequired,
    mode: PropTypes.string.isRequired,
    onModePress: PropTypes.func.isRequired,
    onLanguagePress: PropTypes.func.isRequired,
    setSetting: PropTypes.func.isRequired,
    setModalContent: PropTypes.func.isRequired,
    onThemePress: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    themeImagePath: PropTypes.number.isRequired,
    advancedImagePath: PropTypes.number.isRequired,
    logoutImagePath: PropTypes.number.isRequired,
    passwordImagePath: PropTypes.number.isRequired,
    twoFactorAuthImagePath: PropTypes.number.isRequired,
    accountImagePath: PropTypes.number.isRequired,
    languageImagePath: PropTypes.number.isRequired,
    currencyImagePath: PropTypes.number.isRequired,
    borderBottomColor: PropTypes.object.isRequired,
    textColor: PropTypes.object.isRequired,
    modeImagePath: PropTypes.number.isRequired,
    secondaryBackgroundColor: PropTypes.string.isRequired,
};

export default MainSettings;
