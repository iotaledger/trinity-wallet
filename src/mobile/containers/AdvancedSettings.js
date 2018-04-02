import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { Navigation } from 'react-native-navigation';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { Icon } from '../theme/icons.js';
import { width, height } from '../utils/dimensions';

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

/**
 * Advanced Settings component
 */
class AdvancedSettings extends PureComponent {
    static propTypes = {
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Currently selected IRI node */
        node: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.reset = this.reset.bind(this);
    }

    reset() {
        const { theme } = this.props;

        Navigation.startSingleScreenApp({
            screen: {
                screen: 'walletResetConfirm',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    screenBackgroundColor: theme.body.bg,
                    drawUnderStatusBar: true,
                    statusBarColor: theme.body.bg,
                },
            },
            appStyle: {
                orientation: 'portrait',
                keepStyleAcrossPush: false,
            },
        });
    }

    render() {
        const { t, theme, node } = this.props;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;
        const borderColor = { borderColor: theme.body.color };

        return (
            <View style={styles.container}>
                <View style={{ flex: 7 }}>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('nodeSelection')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="node" size={width / 22} color={bodyColor} />
                                <Text style={[styles.titleText, textColor]}>{t('selectNode')}</Text>
                                <Text numberOfLines={1} style={[styles.settingText, textColor]}>
                                    {node}
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
                                <Icon name="plus" size={width / 22} color={bodyColor} />
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
                                <Icon name="pow" size={width / 22} color={bodyColor} />
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
                                <Icon name="snapshot" size={width / 22} color={bodyColor} />
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
                                <Icon name="sync" size={width / 22} color={bodyColor} />
                                <Text style={[styles.titleText, textColor]}>{t('manualSync')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                    <View style={styles.separatorContainer}>
                        <View style={[styles.separator, borderColor]} />
                    </View>
                    <View style={styles.itemContainer}>
                        <TouchableOpacity
                            onPress={this.reset}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="trash" size={width / 22} color={bodyColor} />
                                <Text style={[styles.titleText, textColor]}>{t('settings:reset')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
                <View style={{ flex: 3, justifyContent: 'flex-end' }}>
                    <View style={{ flex: 2 }} />
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
    node: state.settings.node,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
};

export default translate(['advancedSettings', 'settings', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings),
);
