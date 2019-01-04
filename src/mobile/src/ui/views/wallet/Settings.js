import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, TouchableWithoutFeedback } from 'react-native';
import timer from 'react-native-timer';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import KeepAwake from 'react-native-keep-awake';
import SettingsContent from 'ui/components/SettingsContent';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { height } from 'libs/dimensions';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
    },
    settingsContainer: {
        flex: 40,
        justifyContent: 'center',
        alignItems: 'flex-start',
        zIndex: 1,
        paddingVertical: height / 40,
    },
});

/** Settings component */
class Settings extends Component {
    static propTypes = {
        /** @ignore */
        currentSetting: PropTypes.string.isRequired,
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        closeTopBar: PropTypes.func.isRequired,
        /** @ignore */
        navStack: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            nextSetting: props.currentSetting,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('Settings');
    }

    componentWillReceiveProps(newProps) {
        if (!this.props.isSyncing && newProps.isSyncing) {
            KeepAwake.activate();
        } else if (this.props.isSyncing && !newProps.isSyncing) {
            KeepAwake.deactivate();
        }
        if (this.props.currentSetting !== newProps.currentSetting) {
            this.animationOutType = this.getAnimation(this.props.currentSetting, newProps.currentSetting, false);
            this.animationInType = this.getAnimation(this.props.currentSetting, newProps.currentSetting);
            timer.setTimeout(
                'delaySettingChange' + newProps.currentSetting,
                () => {
                    this.setState({ nextSetting: newProps.currentSetting });
                },
                150,
            );
        }
        if (this.props.navStack !== newProps.navStack) {
            this.animationInType = ['slideInLeftSmall', 'fadeIn'];
            if (newProps.navStack.length === 1) {
                this.animationOutType = ['fadeOut'];
                return;
            }
            this.animationOutType = ['slideOutLeftSmall', 'fadeOut'];
        }
    }

    componentWillUnmount() {
        timer.clearTimeout('delaySettingChange' + this.props.currentSetting);
    }

    /**
     * Gets children props for SettingsContent component
     *
     * @param {string} child
     * @returns {object}
     */
    getChildrenProps(child) {
        const props = {
            nodeSelection: {
                backPress: () => this.props.setSetting('advancedSettings'),
            },
            addCustomNode: {
                backPress: () => this.props.setSetting('advancedSettings'),
            },
        };

        return props[child] || {};
    }

    /**
     * Gets settings animation according to current and next menu tier
     * 0 = main settings menu, 1 = first tier settings menu, 2 = second tier settings menu, 3 = final tier settings menu
     *
     * @param {string} currentSetting
     * @param {string} nextSetting
     * @param {bool} animationIn
     * @returns {object}
     */
    getAnimation(currentSetting, nextSetting, animationIn = true) {
        const indexedSettings = {
            mainSettings: 0,
            accountManagement: 1,
            securitySettings: 1,
            advancedSettings: 1,
            addNewAccount: 2,
            addExistingSeed: 3,
            modeSelection: 3,
            themeCustomisation: 3,
            currencySelection: 3,
            languageSelection: 3,
            viewAddresses: 3,
            editAccountName: 3,
            deleteAccount: 3,
            viewSeed: 3,
            exportSeedVault: 3,
            changePassword: 3,
            nodeSelection: 3,
            addCustomNode: 3,
            pow: 3,
            autoPromotion: 3,
            snapshotTransition: 3,
            manualSync: 3,
            about: 3,
        };

        if (animationIn) {
            if (indexedSettings[currentSetting] === indexedSettings[nextSetting]) {
                return ['fadeIn'];
            } else if (indexedSettings[currentSetting] < indexedSettings[nextSetting]) {
                return ['slideInRightSmall', 'fadeIn'];
            } else if (indexedSettings[currentSetting] > indexedSettings[nextSetting]) {
                return ['slideInLeftSmall', 'fadeIn'];
            }
        }
        if (indexedSettings[currentSetting] < indexedSettings[nextSetting]) {
            return ['slideOutLeftSmall', 'fadeOut'];
        } else if (indexedSettings[currentSetting] > indexedSettings[nextSetting]) {
            return ['slideOutRightSmall', 'fadeOut'];
        }
    }

    render() {
        const childrenProps = this.getChildrenProps(this.props.currentSetting);

        return (
            <TouchableWithoutFeedback style={styles.container} onPress={() => this.props.closeTopBar()}>
                <View style={{ flex: 1 }}>
                    <View style={{ flex: 1 }} />
                    <AnimatedComponent
                        animateOnMount={false}
                        animateOnNavigation={false}
                        animationInType={this.animationInType}
                        animationOutType={this.animationOutType}
                        animateInTrigger={this.state.nextSetting}
                        animateOutTrigger={this.props.currentSetting}
                        duration={150}
                        style={styles.settingsContainer}
                    >
                        <SettingsContent component={this.state.nextSetting} {...childrenProps} />
                    </AnimatedComponent>
                    <View style={{ flex: 1 }} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    currentSetting: state.wallet.currentSetting,
    isSyncing: state.ui.isSyncing,
    navStack: state.wallet.navStack,
});

const mapDispatchToProps = {
    setSetting,
};

export default connect(mapStateToProps, mapDispatchToProps)(Settings);
