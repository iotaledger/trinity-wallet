import map from 'lodash/map';
import React, { Component } from 'react';
import { translate } from 'react-i18next';
import { Animated, StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import nodejs from 'nodejs-mobile-react-native';
import Share from 'react-native-share';
import RNFetchBlob from 'rn-fetch-blob';
import { generateAlert } from 'iota-wallet-shared-modules/actions/alerts';
import WithUserActivity from '../components/UserActivity';
import OnboardingButtons from '../containers/OnboardingButtons';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { Icon } from '../theme/icons.js';
import Header from '../components/Header';
import { leaveNavigationBreadcrumb } from '../utils/bugsnag';
import StatefulDropdownAlert from '../containers/StatefulDropdownAlert';
import SetPasswordFields from '../components/SetPasswordFields';
import InfoBox from '../components/InfoBox';

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
        flex: 0.5,
        justifyContent: 'flex-end',
    },
    infoText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
});

/** Seed Vault Export component */
class SeedVaultExport extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        seed: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            isSettingPassword: false,
            isExporting: false,
            password: '',
            reentry: '',
        };
    }

    componentWillMount() {
        this.firstAnimatedValue = new Animated.Value(0);
        this.secondAnimatedValue = new Animated.Value(width);
        this.thirdAnimatedValue = new Animated.Value(width);
        nodejs.start('main.js');
        nodejs.channel.addListener(
            'message',
            async (vault) => {
                this.onGenerateVault(vault);
            },
            this,
        );
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SeedVaultExport');
    }

    /**
     * Creates SeedVault file and opens share dialog for that file
     *
     * @method onGenerateVault
     * @param {string} Vault - Seed vault Uint8Array as string
     */
    onGenerateVault(vault) {
        const { t } = this.props;
        const now = new Date();
        const path =
            RNFetchBlob.fs.dirs.CacheDir +
            `/trinity-${now
                .toISOString()
                .slice(0, 16)
                .replace(/[-:]/g, '')
                .replace('T', '-')}.kdbx`;
        const vaultParsed = map(vault.split(','), (num) => parseInt(num));
        RNFetchBlob.fs
            .createFile(path, vaultParsed, 'ascii')
            .then(() => {
                Share.open({
                    url: path,
                })
                    .then(() => this.onExportSuccess(path))
                    .catch(() => RNFetchBlob.fs.unlink(path));
            })
            .catch(() =>
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                ),
            );
    }

    /**
     * Initiates screen transition animation or password check, depending on user progress
     *
     * @method onNextPress
     */
    onNextPress() {
        if (!this.state.isSettingPassword) {
            this.setState({ isSettingPassword: true });
            return Animated.parallel([
                Animated.spring(this.firstAnimatedValue, {
                    toValue: -width,
                    velocity: 3,
                    tension: 2,
                    friction: 8,
                }),
                Animated.spring(this.secondAnimatedValue, {
                    toValue: 0,
                    velocity: 3,
                    tension: 2,
                    friction: 8,
                }),
            ]).start();
        }
        this.SetPasswordFields.checkPassword();
    }

    /**
     * Initiates screen transition animation
     *
     * @method onAcceptPassword
     */
    onAcceptPassword() {
        this.setState({ isExporting: true, isSettingPassword: false });
        return Animated.parallel([
            Animated.spring(this.secondAnimatedValue, {
                toValue: -width,
                velocity: 3,
                tension: 2,
                friction: 8,
            }),
            Animated.spring(this.thirdAnimatedValue, {
                toValue: 0,
                velocity: 3,
                tension: 2,
                friction: 8,
            }),
        ]).start();
    }

    /**
     * Deletes SeedVault file from cache memory
     *
     * @method onExportSuccess
     */
    onExportSuccess(path) {
        const { t } = this.props;
        RNFetchBlob.fs
            .unlink(path)
            .then(() => this.goBack())
            .catch(() =>
                this.props.generateAlert(
                    'error',
                    t('global:somethingWentWrong'),
                    t('global:somethingWentWrongTryAgain'),
                ),
            );
    }

    /**
     * Sends message to nodejs thread to generate SeedVault file
     *
     * @method onExportPress
     */
    onExportPress() {
        return nodejs.channel.send(this.props.seed + ':' + this.state.password);
    }

    /**
     * Initiates screen transition animation or navigates back to SeedBackupOptions, depending on user progress
     *
     * @method onBackPress
     */
    onBackPress() {
        if (this.state.isSettingPassword) {
            this.setState({ isSettingPassword: false });
            return Animated.parallel([
                Animated.spring(this.firstAnimatedValue, {
                    toValue: 0,
                    velocity: 3,
                    tension: 2,
                    friction: 8,
                }),
                Animated.spring(this.secondAnimatedValue, {
                    toValue: width,
                    velocity: 3,
                    tension: 2,
                    friction: 8,
                }),
            ]).start();
        } else if (this.state.isExporting) {
            this.setState({ isExporting: false, isSettingPassword: true });
            return Animated.parallel([
                Animated.spring(this.secondAnimatedValue, {
                    toValue: 0,
                    velocity: 3,
                    tension: 2,
                    friction: 8,
                }),
                Animated.spring(this.thirdAnimatedValue, {
                    toValue: width,
                    velocity: 3,
                    tension: 2,
                    friction: 8,
                }),
            ]).start();
        }
        this.goBack();
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
        const { isExporting, reentry, password } = this.state;
        const textColor = { color: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View>
                    <DynamicStatusBar backgroundColor={body.bg} />
                    <View style={styles.topContainer}>
                        <Icon name="iota" size={width / 8} color={body.color} />
                        <View style={{ flex: 0.7 }} />
                        <Header textColor={body.color}>{t('exportSeedVault')}</Header>
                    </View>
                    <View style={styles.midContainer}>
                        <Animated.View
                            style={[
                                { position: 'absolute', top: height / 10 },
                                { transform: [{ translateX: this.firstAnimatedValue }] },
                            ]}
                        >
                            <InfoBox
                                body={body}
                                text={<Text style={[styles.infoText, textColor]}>{t('seedVaultExplanation')}</Text>}
                            />
                        </Animated.View>
                        <Animated.View
                            style={[
                                { position: 'absolute', top: height / 10 },
                                { transform: [{ translateX: this.secondAnimatedValue }] },
                            ]}
                        >
                            <SetPasswordFields
                                onRef={(ref) => {
                                    this.SetPasswordFields = ref;
                                }}
                                onAcceptPassword={() => this.onAcceptPassword()}
                                password={password}
                                reentry={reentry}
                                setPassword={(password) => this.setState({ password })}
                                setReentry={(reentry) => this.setState({ reentry })}
                            />
                        </Animated.View>
                        <Animated.View
                            style={[
                                { position: 'absolute', top: height / 10 },
                                { transform: [{ translateX: this.thirdAnimatedValue }] },
                            ]}
                        >
                            <InfoBox
                                body={body}
                                text={<Text style={[styles.infoText, textColor]}>{t('seedVaultWarning')}</Text>}
                            />
                        </Animated.View>
                    </View>
                    <View style={styles.bottomContainer}>
                        <OnboardingButtons
                            onLeftButtonPress={() => this.onBackPress()}
                            onRightButtonPress={() => (isExporting ? this.onExportPress() : this.onNextPress())}
                            leftButtonText={t('global:back')}
                            rightButtonText={isExporting ? t('global:export') : t('global:next')}
                        />
                    </View>
                    <StatefulDropdownAlert textColor={body.color} backgroundColor={body.bg} />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
    minimised: state.ui.minimised,
});

const mapDispatchToProps = {
    generateAlert,
};

export default WithUserActivity()(
    translate(['seedVault', 'global'])(connect(mapStateToProps, mapDispatchToProps)(SeedVaultExport)),
);
