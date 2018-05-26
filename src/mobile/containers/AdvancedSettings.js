import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { Icon } from '../theme/icons.js';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    container: {
        flex: 1,
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
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between'
    },
    backIcon: {
        width: width / 28,
        height: width / 28,
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 25,
    },
    backText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    separator: {
        borderBottomWidth: height / 1500,
        width: width / 1.16,
        alignSelf: 'center',
    },
    separatorContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    settingText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        width: width / 2.4,
        backgroundColor: 'transparent',
    },
});

/**
 * Advanced Settings component
 */
export class AdvancedSettings extends PureComponent {
    static propTypes = {
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Generate a notification alert
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         */
        generateAlert: PropTypes.func.isRequired,
        /** Currently selected IRI node */
        node: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Determines if wallet is making a transaction */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
    };

    constructor() {
        super();

        this.reset = this.reset.bind(this);
        this.onNodeSelection = this.onNodeSelection.bind(this);
        this.onAddCustomNode = this.onAddCustomNode.bind(this);
    }

    onNodeSelection() {
        if (this.props.isSendingTransfer) {
            this.generateChangeNodeAlert();
        } else {
            this.props.setSetting('nodeSelection');
        }
    }

    onAddCustomNode() {
        if (this.props.isSendingTransfer) {
            this.generateChangeNodeAlert();
        } else {
            this.props.setSetting('addCustomNode');
        }
    }

    generateChangeNodeAlert() {
        this.props.generateAlert(
            'error',
            this.props.t('settings:cannotChangeNode'),
            `${this.props.t('settings:cannotChangeNodeWhileSending')} ${this.props.t(
                'settings:transferSendingExplanation',
            )}`,
        );
    }

    reset() {
        const { theme } = this.props;
        this.props.navigator.push({
            screen: 'walletResetConfirm',
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: theme.body.bg,
                drawUnderStatusBar: true,
                statusBarColor: theme.body.bg,
            },
            animated: false,
        });
    }

    render() {
        const { t, theme, node } = this.props;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;
        const borderColor = { borderBottomColor: theme.body.color };

        return (
            <View style={styles.container}>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={this.onNodeSelection}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="node" size={width / 22} color={bodyColor} />
                            <View style={styles.content}>
                                <Text style={[styles.titleText, textColor]}>{t('selectNode')}</Text>
                                <Text numberOfLines={1} style={[styles.settingText, textColor]}>
                                    {node}
                                </Text>
                            </View>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={this.onAddCustomNode}
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
                            <Text style={[styles.titleText, textColor]}>{t('pow')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('autoPromotion')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="sync" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('autoPromotion')}</Text>
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
                <View style={{ flex: 2 }}/>
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
        );
    }
}

const mapStateToProps = (state) => ({
    node: state.settings.node,
    theme: state.settings.theme,
    isSendingTransfer: state.ui.isSendingTransfer,
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default translate(['advancedSettings', 'settings', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(AdvancedSettings),
);
