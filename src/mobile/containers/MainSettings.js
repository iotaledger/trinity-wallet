import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import Modal from 'react-native-modal';
import { Navigation } from 'react-native-navigation';
import i18next from 'i18next';
import { selectLocale } from 'iota-wallet-shared-modules/libs/locale';
import { setSetting, clearWalletData, setPassword } from 'iota-wallet-shared-modules/actions/wallet';
import LogoutConfirmationModal from '../components/LogoutConfirmationModal';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons';

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

export class MainSettings extends Component {
    static propTypes = {
        mode: PropTypes.string.isRequired,
        currency: PropTypes.string.isRequired,
        themeName: PropTypes.string.isRequired,
        bodyColor: PropTypes.string.isRequired,
        bg: PropTypes.string.isRequired,
        borderBottomColor: PropTypes.shape({
            borderBottomColor: PropTypes.string.isRequired,
        }).isRequired,
        textColor: PropTypes.shape({
            color: PropTypes.string.isRequired,
        }).isRequired,
        setSetting: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        clearWalletData: PropTypes.func.isRequired,
        setPassword: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            isModalActive: false,
        };
    }

    toggleModalDisplay() {
        this.setState({ isModalActive: !this.state.isModalActive });
    }

    logout() {
        this.props.clearWalletData();
        this.props.setPassword('');
        Navigation.startSingleScreenApp({
            screen: {
                screen: 'login',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: this.props.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: this.props.bg,
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
        const { textColor, bg, bodyColor } = this.props;
        return (
            <LogoutConfirmationModal
                style={{ flex: 1 }}
                hideModal={this.toggleModalDisplay}
                logout={this.logout}
                backgroundColor={bg}
                textColor={textColor}
                borderColor={{ borderColor: bodyColor }}
            />
        );
    }

    render() {
        return (
            <View style={styles.container}>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('modeSelection')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <View style={styles.innerItemContainerLeft}>
                                <Icon name="mode" size={width / 22} color={this.props.bodyColor} />
                                <Text style={[styles.titleText, this.props.textColor]}>{this.props.t('mode')}</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text style={[styles.settingText, this.props.textColor]}>{this.props.mode}</Text>
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
                                <Icon name="theme" size={width / 22} color={this.props.bodyColor} />
                                <Text style={[styles.titleText, this.props.textColor]}>{this.props.t('theme')}</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text style={[styles.settingText, this.props.textColor]}>{this.props.themeName}</Text>
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
                                <Icon name="currency" size={width / 22} color={this.props.bodyColor} />
                                <Text style={[styles.titleText, this.props.textColor]}>{this.props.t('currency')}</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text style={[styles.settingText, this.props.textColor]}>{this.props.currency}</Text>
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
                                <Icon name="language" size={width / 22} color={this.props.bodyColor} />
                                <Text style={[styles.titleText, this.props.textColor]}>{this.props.t('language')}</Text>
                            </View>
                            <View style={styles.innerItemContainerRight}>
                                <Text numberOfLines={1} style={[styles.settingText, this.props.textColor]}>
                                    {selectLocale(i18next.language)}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.separatorContainer}>
                    <View style={[styles.separator, this.props.borderBottomColor]} />
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('accountManagement')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="user" size={width / 22} color={this.props.bodyColor} />
                            <Text style={[styles.titleText, this.props.textColor]}>
                                {this.props.t('accountManagement')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('changePassword')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="password" size={width / 22} color={this.props.bodyColor} />
                            <Text style={[styles.titleText, this.props.textColor]}>
                                {this.props.t('changePassword')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('securitySettings')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="security" size={width / 22} color={this.props.bodyColor} />
                            <Text style={[styles.titleText, this.props.textColor]}>
                                {this.props.t('securitySettings')}
                            </Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.separatorContainer}>
                    <View style={[styles.separator, this.props.borderBottomColor]} />
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('advancedSettings')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="advanced" size={width / 22} color={this.props.bodyColor} />
                            <Text style={[styles.titleText, this.props.textColor]}>{this.props.t('advanced')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={this.toggleModalDisplay}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="logout" size={width / 22} color={this.props.bodyColor} />
                            <Text style={[styles.titleText, this.props.textColor]}>{this.props.t('logout')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <Modal
                    animationIn="bounceInUp"
                    animationOut="bounceOut"
                    animationInTiming={1000}
                    animationOutTiming={200}
                    backdropTransitionInTiming={500}
                    backdropTransitionOutTiming={200}
                    backdropColor={this.props.bg}
                    backdropOpacity={0.8}
                    style={{ alignItems: 'center' }}
                    isVisible={this.state.isModalActive}
                    onBackButtonPress={this.toggleModalDisplay}
                    useNativeDriver
                    hideModalContentWhileAnimating
                >
                    {this.renderModalContent()}
                </Modal>
            </View>
        );
    }
}

const mapStateToProps = (state) => {
    const theme = state.settings.theme;
    const color = theme.body.color;
    const bg = theme.body.bg;

    return {
        mode: state.settings.mode,
        currency: state.settings.currency,
        themeName: state.settings.themeName,
        bodyColor: color,
        borderBottomColor: { borderBottomColor: color },
        textColor: { color },
        bg,
    };
};

const mapDispatchToProps = {
    setSetting,
    clearWalletData,
    setPassword,
};

export default translate(['settings', 'global'])(connect(mapStateToProps, mapDispatchToProps)(MainSettings));
