import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { setSetting } from 'shared-modules/actions/wallet';
import { getThemeFromState } from 'shared-modules/selectors/global';
import SeedVaultExportComponent from 'ui/components/SeedVaultExportComponent';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { isAndroid } from 'libs/device';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';
import { width } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
        width,
    },
    bottomContainer: {
        flex: 1,
    },
    topContainer: {
        flex: 11,
        justifyContent: 'center',
    },
});

/** Seed Vault Setting component */
class SeedVaultSettings extends Component {
    static propTypes = {
        /** Set new setting
         * @param {string} setting
         */
        setSetting: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    constructor() {
        super();
        this.state = {
            step: 'isValidatingWalletPassword',
            isAuthenticated: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SeedVaultSettings');
    }

    /**
     * Determines course of action on right button press dependent on current progress step
     *
     * @method onRightButtonPress
     */
    onRightButtonPress() {
        const { step } = this.state;
        if (step === 'isExporting' && !isAndroid) {
            return this.SeedVaultExportComponent.onExportPress();
        } else if (step === 'isSelectingSaveMethodAndroid') {
            return this.props.setSetting('accountManagement');
        }
        this.SeedVaultExportComponent.onNextPress();
    }

    render() {
        const { t, theme } = this.props;
        const { step, isAuthenticated } = this.state;
        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <SeedVaultExportComponent
                            step={step}
                            setProgressStep={(step) => this.setState({ step })}
                            goBack={() => this.props.setSetting('accountManagement')}
                            onRef={(ref) => {
                                this.SeedVaultExportComponent = ref;
                            }}
                            isAuthenticated={isAuthenticated}
                            setAuthenticated={() => this.setState({ isAuthenticated: true })}
                        />
                        <View style={{ flex: 0.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <SettingsDualFooter
                            theme={theme}
                            backFunction={() => this.SeedVaultExportComponent.onBackPress()}
                            actionFunction={() => this.onRightButtonPress()}
                            actionName={
                                step === 'isExporting' && !isAndroid
                                    ? t('global:export')
                                    : step === 'isSelectingSaveMethodAndroid'
                                    ? t('global:done')
                                    : t('global:next')
                            }
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setSetting,
};

export default withNamespaces(['seedVault', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(SeedVaultSettings),
);
