import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { translate } from 'react-i18next';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
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
    backIcon: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
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
        borderBottomWidth: 0.25,
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
        marginLeft: width / 12,
        width: width / 2.4,
        backgroundColor: 'transparent',
    },
});

/**
 * Account Management component
 */
class AccountManagement extends Component {
    static propTypes = {
        /** Total number of added seeds */
        seedCount: PropTypes.number.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
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
    };

    constructor() {
        super();

        this.deleteAccount = this.deleteAccount.bind(this);
    }

    deleteAccount() {
        const { seedCount, t } = this.props;

        if (seedCount === 1) {
            return this.props.generateAlert(
                'error',
                t('global:cannotPerformAction'),
                t('global:cannotPerformActionExplanation'),
            );
        }

        return this.props.setSetting('deleteAccount');
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;

        return (
            <View style={styles.advancedSettingsContainer}>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('viewSeed')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="eye" size={width / 22} color={bodyColor} />
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
                            <Icon name="addresses" size={width / 22} color={bodyColor} />
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
                            <Icon name="edit" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('editAccountName')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={this.deleteAccount}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="trash" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('deleteAccount')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.separatorContainer}>
                    <View style={[styles.separator, { borderBottomColor: bodyColor }]} />
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('addNewAccount')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="plus" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('addNewAccount')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 5 }} />
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
    seedCount: state.accounts.seedCount,
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    generateAlert,
    setSetting,
};

export default translate(['accountManagement', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(AccountManagement),
);
