import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Navigation } from 'react-native-navigation';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: width / 15,
    },
    backIcon: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 25,
    },
    backText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
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
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        marginLeft: width / 12,
        width: width / 2.4,
        backgroundColor: 'transparent',
    },
});

/* eslint-disable react/prefer-stateless-function */
class SecuritySettings extends Component {
    static propTypes = {
        setSetting: PropTypes.func.isRequired,
        bodyColor: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        on2FASetupPress: PropTypes.func.isRequired,
        //onFingerprintSetupPress: PropTypes.func.isRequired,
    };

    on2FASetupPress() {
        const { is2FAEnabled, body } = this.props;
        if (!is2FAEnabled) {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'twoFactorSetupAddKey',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: body.bg,
                        drawUnderStatusBar: true,
                        statusBarColor: body.bg,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                    keepStyleAcrossPush: false,
                },
            });
        } else {
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'disable2FA',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: body.bg,
                        drawUnderStatusBar: true,
                        statusBarColor: body.bg,
                    },
                },
                appStyle: {
                    orientation: 'portrait',
                    keepStyleAcrossPush: false,
                },
            });
        }
    }

    render() {
        const { t, textColor, bodyColor } = this.props;

        return (
            <View style={styles.container}>
                <View style={{ flex: 9, justifyContent: 'flex-start' }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.on2FASetupPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="twoFA" size={width / 22} color={bodyColor} />
                                <Text style={[styles.titleText, textColor]}>{t('twoFA')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableWithoutFeedback
                            onPress={() => {
                                /*this.props.onFingerprintSetupPress()*/
                            }}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={[styles.item, { opacity: 0.2 }]}>
                                <Icon name="biometric" size={width / 22} color={bodyColor} />
                                <Text style={[styles.titleText, textColor]}>{t('fingerprint')}</Text>
                            </View>
                        </TouchableWithoutFeedback>
                    </View>
                    <View style={{ flex: 7 }} />
                </View>
                <View style={{ flex: 1, justifyContent: 'flex-end' }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('mainSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={bodyColor} />
                                <Text style={[styles.backText, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    is2FAEnabled: state.account.is2FAEnabled,
    body: state.settings.theme.body,
    fullNode: state.settings.fullNode,
});

const mapDispatchToProps = {
    setSetting,
};

export default translate(['settings', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SecuritySettings));
