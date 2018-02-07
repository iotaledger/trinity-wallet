import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { translate } from 'react-i18next';
import whiteAddressesImagePath from 'iota-wallet-shared-modules/images/addresses-white.png';
import whiteEditImagePath from 'iota-wallet-shared-modules/images/edit-white.png';
import whiteDeleteImagePath from 'iota-wallet-shared-modules/images/delete-white.png';
import blackAddressesImagePath from 'iota-wallet-shared-modules/images/addresses-black.png';
import blackEditImagePath from 'iota-wallet-shared-modules/images/edit-black.png';
import blackDeleteImagePath from 'iota-wallet-shared-modules/images/delete-black.png';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'flex-start',
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
        borderBottomWidth: 0.3,
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
class AdvancedSettings extends Component {
    static propTypes = {
        arrowLeftImagePath: PropTypes.number.isRequired,
        addImagePath: PropTypes.number.isRequired,
        keyImagePath: PropTypes.number.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        setSetting: PropTypes.func.isRequired,
        onDeleteAccountPress: PropTypes.func.isRequired,
        t: PropTypes.func.isRequired,
        textColor: PropTypes.string.isRequired,
    };

    render() {
        const { t, secondaryBackgroundColor, textColor, arrowLeftImagePath, addImagePath, keyImagePath } = this.props;
        const addressesImagePath =
            secondaryBackgroundColor === 'white' ? whiteAddressesImagePath : blackAddressesImagePath;
        const editImagePath = secondaryBackgroundColor === 'white' ? whiteEditImagePath : blackEditImagePath;
        const deleteImagePath = secondaryBackgroundColor === 'white' ? whiteDeleteImagePath : blackDeleteImagePath;

        return (
            <View style={styles.advancedSettingsContainer}>
                <View style={{ flex: 5.5 }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('viewSeed')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={keyImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('viewSeed')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('viewAddresses')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={addressesImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('viewAddresses')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('editAccountName')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={editImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('editAccountName')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.onDeleteAccountPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={deleteImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('deleteAccount')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separatorContainer}>
                        <View style={[styles.separator, { borderBottomColor: secondaryBackgroundColor }]} />
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('addNewAccount')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={addImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('addNewAccount')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 4.5 }}>
                    <View style={{ flex: 3.5 }} />
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

export default translate(['accountManagement', 'global'])(AdvancedSettings);
