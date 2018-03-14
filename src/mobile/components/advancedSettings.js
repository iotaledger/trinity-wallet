import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { Icon } from '../theme/icons.js';

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
    backIcon: {
        width: width / 28,
        height: width / 28,
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
class AdvancedSettings extends Component {
    static propTypes = {
        setSetting: PropTypes.func.isRequired,
        onResetWalletPress: PropTypes.func.isRequired,
        node: PropTypes.string.isRequired,
        secondaryBackgroundColor: PropTypes.string.isRequired,
        textColor: PropTypes.object.isRequired,
        borderColor: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, textColor, borderColor, secondaryBackgroundColor } = this.props;

        return (
            <View style={styles.container}>
                <View style={{ flex: 6.5 }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('nodeSelection')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="node" size={width / 22} color={secondaryBackgroundColor} />
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
                                <Icon name="plus" size={width / 22} color={secondaryBackgroundColor} />
                                <Text style={[styles.titleText, textColor]}>{t('addCustomNode')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('pow')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="pow" size={width / 22} color={secondaryBackgroundColor} />
                                <Text style={[styles.titleText, textColor]}>Proof of Work</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separatorContainer}>
                        <View style={[styles.separator, borderColor]} />
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('snapshotTransition')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="snapshot" size={width / 22} color={secondaryBackgroundColor} />
                                <Text style={[styles.titleText, textColor]}>{t('snapshotTransition')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('manualSync')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="sync" size={width / 22} color={secondaryBackgroundColor} />
                                <Text style={[styles.titleText, textColor]}>{t('manualSync')}</Text>
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
                                <Icon name="trash" size={width / 22} color={secondaryBackgroundColor} />
                                <Text style={[styles.titleText, textColor]}>{t('settings:reset')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 3.5, justifyContent: 'flex-end' }}>
                    <View style={{ flex: 2.5 }} />
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('mainSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={secondaryBackgroundColor} />
                                <Text style={[styles.backText, textColor]}>{t('global:backLowercase')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </View>
        );
    }
}

export default translate(['advancedSettings', 'settings', 'global'])(AdvancedSettings);
