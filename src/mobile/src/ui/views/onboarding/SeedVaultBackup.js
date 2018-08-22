import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { StyleSheet, View, Keyboard, TouchableWithoutFeedback, KeyboardAvoidingView } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { width, height } from 'mobile/src/libs/dimensions';
import DynamicStatusBar from 'mobile/src/ui/components/DynamicStatusBar';
import OnboardingButtons from 'mobile/src/ui/components/OnboardingButtons';
import { Icon } from 'mobile/src/ui/theme/icons.js';
import Header from 'mobile/src/ui/components/Header';
import { leaveNavigationBreadcrumb } from 'mobile/src/libs/bugsnag';
import StatefulDropdownAlert from 'mobile/src/ui/components/StatefulDropdownAlert';
import SeedVaultExportComponent from 'mobile/src/ui/components/SeedVaultExportComponent';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 1,
        justifyContent: 'flex-end',
    },
});

/** Seed Vault Backup component */
class SeedVaultBackup extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        seed: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            step: 'isViewingGeneralInfo',
            seed: props.seed,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SeedVaultBackup');
    }

    /**
     * Navigates back to SeedBackupOptions
     *
     * @method goBack
     */
    goBack() {
        const { theme: { body } } = this.props;
        this.props.navigator.pop({
            navigatorStyle: {
                navBarHidden: true,
                navBarTransparent: true,
                topBarElevationShadowEnabled: false,
                screenBackgroundColor: body.bg,
                drawUnderStatusBar: true,
                statusBarColor: body.bg,
            },
            animated: false,
        });
    }

    render() {
        const { t, theme: { body } } = this.props;
        const { step, seed } = this.state;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={[styles.container, { backgroundColor: body.bg }]}>
                    <View>
                        <DynamicStatusBar backgroundColor={body.bg} />
                        <View style={styles.topContainer}>
                            <Icon name="iota" size={width / 8} color={body.color} />
                            <View style={{ flex: 0.7 }} />
                            <Header textColor={body.color}>{t('exportSeedVault')}</Header>
                        </View>
                        <KeyboardAvoidingView behavior="padding" style={styles.midContainer}>
                            <SeedVaultExportComponent
                                step={step}
                                setProgressStep={(step) => this.setState({ step })}
                                goBack={() => this.goBack()}
                                onRef={(ref) => {
                                    this.SeedVaultExportComponent = ref;
                                }}
                                isAuthenticated
                                seed={seed}
                                setSeed={(seed) => this.setState({ seed })}
                            />
                        </KeyboardAvoidingView>
                        <View style={styles.bottomContainer}>
                            <OnboardingButtons
                                onLeftButtonPress={() => this.SeedVaultExportComponent.onBackPress()}
                                onRightButtonPress={() =>
                                    step === 'isExporting'
                                        ? this.SeedVaultExportComponent.onExportPress()
                                        : this.SeedVaultExportComponent.onNextPress()
                                }
                                leftButtonText={t('global:back')}
                                rightButtonText={step === 'isExporting' ? t('global:export') : t('global:next')}
                            />
                        </View>
                    </View>
                    <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
});

export default translate(['seedVault', 'global'])(connect(mapStateToProps, null)(SeedVaultBackup));
