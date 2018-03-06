import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { Image, StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import whiteNodeImagePath from 'iota-wallet-shared-modules/images/node-white.png';
import whiteSyncImagePath from 'iota-wallet-shared-modules/images/sync-white.png';
import whiteCrossImagePath from 'iota-wallet-shared-modules/images/cross-white.png';
import whiteSnapshotImagePath from 'iota-wallet-shared-modules/images/snapshot-white.png';
import blackNodeImagePath from 'iota-wallet-shared-modules/images/node-black.png';
import blackSyncImagePath from 'iota-wallet-shared-modules/images/sync-black.png';
import blackCrossImagePath from 'iota-wallet-shared-modules/images/cross-black.png';
import blackSnapshotImagePath from 'iota-wallet-shared-modules/images/snapshot-black.png';

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
class AdvancedSettings extends Component {
    static propTypes = {
        setSetting: PropTypes.func.isRequired,
        onResetWalletPress: PropTypes.func.isRequired,
        node: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        borderColor: PropTypes.object.isRequired,
        arrowLeftImagePath: PropTypes.number.isRequired,
        addImagePath: PropTypes.number.isRequired,
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, textColor, borderColor, secondaryBackgroundColor, arrowLeftImagePath, addImagePath } = this.props;
        const nodeImagePath = secondaryBackgroundColor === 'white' ? whiteNodeImagePath : blackNodeImagePath;
        const syncImagePath = secondaryBackgroundColor === 'white' ? whiteSyncImagePath : blackSyncImagePath;
        const crossImagePath = secondaryBackgroundColor === 'white' ? whiteCrossImagePath : blackCrossImagePath;
        const snapshotImagePath =
            secondaryBackgroundColor === 'white' ? whiteSnapshotImagePath : blackSnapshotImagePath;

        return (
            <View style={styles.container}>
                <View style={{ flex: 5.5 }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('nodeSelection')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={nodeImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('selectNode')}</Text>
                                <Text numberOfLines={1} style={[styles.settingText, textColor]}>
                                    {this.props.node}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('addCustomNode')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={addImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('addCustomNode')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('manualSync')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={syncImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('manualSync')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('snapshotTransition')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={snapshotImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('snapshotTransition')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separatorContainer}>
                        <View style={[styles.separator, borderColor]} />
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.onResetWalletPress()}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Image source={crossImagePath} style={styles.icon} />
                                <Text style={[styles.titleText, textColor]}>{t('settings:reset')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 4.5, justifyContent: 'flex-end' }}>
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

export default translate(['advancedSettings', 'settings', 'global'])(AdvancedSettings);
