import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { BackHandler, View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { setSetting } from 'iota-wallet-shared-modules/actions/wallet';
import { translate } from 'react-i18next';
import timer from 'react-native-timer';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    titleText: {
        color: 'white',
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
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
    },
});

/**
 * Add new account component
 */
class AddNewAccount extends Component {
    static propTypes = {
        /** Change current setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.addNewSeed = this.addNewSeed.bind(this);
    }

    addNewSeed() {
        const { theme } = this.props;

        Navigation.startSingleScreenApp({
            screen: {
                screen: 'newSeedSetup',
                navigatorStyle: {
                    navBarHidden: true,
                    navBarTransparent: true,
                    topBarElevationShadowEnabled: false,
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
        timer.clearInterval('inactivityTimer');
        BackHandler.removeEventListener('homeBackPress');
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const bodyColor = theme.body.color;

        return (
            <View style={styles.container}>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('addExistingSeed')}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="key" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('useExistingSeed')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={this.addNewSeed}
                        hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    >
                        <View style={styles.item}>
                            <Icon name="plus" size={width / 22} color={bodyColor} />
                            <Text style={[styles.titleText, textColor]}>{t('createNewSeed')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
                <View style={{ flex: 9 }} />
                <View style={styles.itemContainer}>
                    <TouchableOpacity
                        onPress={() => this.props.setSetting('accountManagement')}
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
    theme: state.settings.theme,
});

const mapDispatchToProps = {
    setSetting,
};

export default translate(['addNewAccount', 'global'])(connect(mapStateToProps, mapDispatchToProps)(AddNewAccount));
