import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import whiteNodeImagePath from 'iota-wallet-shared-modules/images/node-white.png';
import blackNodeImagePath from 'iota-wallet-shared-modules/images/node-black.png';
import whiteFingerprintImagePath from 'iota-wallet-shared-modules/images/fingerprint-icon-white.png';
import blackFingerprintImagePath from 'iota-wallet-shared-modules/images/fingerprint-icon-black.png';
import { width, height } from '../util/dimensions';

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
    icon: {
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
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
        secondaryBackgroundColor: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
        t: PropTypes.func.isRequired,
        on2FASetupPress: PropTypes.func.isRequired,
        onFingerprintSetupPress: PropTypes.func.isRequired,
    };

    render() {
        const { t, textColor, secondaryBackgroundColor, arrowLeftImagePath } = this.props;
        const nodeImagePath = secondaryBackgroundColor === 'white' ? whiteNodeImagePath : blackNodeImagePath;
        const fingerprintImagePath =
            secondaryBackgroundColor === 'white' ? whiteFingerprintImagePath : blackFingerprintImagePath;

        return (
            <View style={styles.container}>
                <View style={{ flex: 9, justifyContent: 'flex-start' }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.on2FASetupPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={nodeImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('twoFA')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.onFingerprintSetupPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={fingerprintImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('fingerprint')}</Text>
                            </View>
                        </TouchableOpacity>
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
                                <Image source={arrowLeftImagePath} style={styles.backIcon} />
                                <Text style={[styles.titleText, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

export default translate(['settings', 'global'])(SecuritySettings);
