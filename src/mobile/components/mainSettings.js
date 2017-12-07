import React, { Component } from 'react';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { width, height } from '../util/dimensions';
import { selectLocale } from '../components/locale';
import i18next from 'i18next';

class MainSettings extends React.Component {
    render() {
        const { t } = this.props;
        return (
            <View style={styles.container}>
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={event => this.props.onModePress()}>
                        <View style={styles.item}>
                            <View style={styles.innerItemContainerLeft}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/mode.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Mode</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text style={styles.settingText}>{this.props.mode}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={event => this.props.onThemePress()}>
                        <View style={styles.item}>
                            <View style={styles.innerItemContainerLeft}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/theme.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Theme</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text style={styles.settingText}>{this.props.theme}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={event => this.props.setSetting('currencySelection')}>
                        <View style={styles.item}>
                            <View style={styles.innerItemContainerLeft}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/currency.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Currency</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text style={styles.settingText}>{this.props.currency}</Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={event => this.props.setSetting('languageSelection')}>
                        <View style={styles.item}>
                            <View style={styles.innerItemContainerLeft}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/language.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Language</Text>
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
                    <TouchableOpacity onPress={event => this.props.setSetting('accountManagement')}>
                        <View style={styles.item}>
                            <Image
                                source={require('iota-wallet-shared-modules/images/account.png')}
                                style={styles.icon}
                            />
                            <Text style={styles.titleText}>Account management</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={event => this.props.on2FASetupPress()}>
                        <View style={styles.item}>
                            <Image source={require('iota-wallet-shared-modules/images/2fa.png')} style={styles.icon} />
                            <Text style={styles.titleText}>Two-factor authentication</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={event => this.props.setSetting('changePassword')}>
                        <View style={styles.item}>
                            <Image
                                source={require('iota-wallet-shared-modules/images/password.png')}
                                style={styles.icon}
                            />
                            <Text style={styles.titleText}>Change password</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.separatorContainer}>
                    <View style={styles.separator} />
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={event => this.props.setSetting('advancedSettings')}>
                        <View style={styles.item}>
                            <Image
                                source={require('iota-wallet-shared-modules/images/advanced.png')}
                                style={styles.icon}
                            />
                            <Text style={styles.titleText}>Advanced settings</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity onPress={event => this.props.setModalContent('logoutConfirmation')}>
                        <View style={styles.item}>
                            <Image
                                source={require('iota-wallet-shared-modules/images/logout.png')}
                                style={styles.icon}
                            />
                            <Text style={styles.titleText}>Log out</Text>
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
        width: width,
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
        borderBottomWidth: 0.3,
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

export default MainSettings;
