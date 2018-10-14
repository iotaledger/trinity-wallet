import trim from 'lodash/trim';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { Navigation } from 'react-native-navigation';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'shared-modules/libs/iota/utils';
import { setSetting, setAdditionalAccountInfo } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { shouldPreventAction } from 'shared-modules/selectors/global';
import { getAccountNamesFromState } from 'shared-modules/selectors/accounts';
import { toggleModalActivity, setDoNotMinimise } from 'shared-modules/actions/ui';
import timer from 'react-native-timer';
import SeedStore from 'libs/SeedStore';
import SeedVaultImport from 'ui/components/SeedVaultImportComponent';
import CustomTextInput from 'ui/components/CustomTextInput';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { isIPhone11 } from 'libs/device';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 1,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'center',
        alignItems: 'center',
    },
    titleContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingBottom: height / 30,
    },
    title: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    itemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    itemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    titleTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
});

/** Use Existing Seed component */
class UseExistingSeed extends Component {
    static propTypes = {
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** Determines whether addition of new seed is allowed */
        shouldPreventAction: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        /** @ignore */
        setDoNotMinimise: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            seed: '',
            accountName: '',
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('UseExistingSeed');
    }

    componentWillUnmount() {
        timer.clearTimeout('invalidSeedAlert');
    }

    /**
     * Displays QR scanner modal
     * @method onQRPress
     */
    onQRPress() {
        this.showModal('qrScanner');
    }

    /**
     * Validates scanned QR data
     * Generates an alert if invalid data is scanned
     *
     * @method onQRRead
     * @param {string} data
     */
    onQRRead(data) {
        const { t } = this.props;
        const dataString = data.toString();
        this.hideModal();
        if (dataString.length === 81 && dataString.match(VALID_SEED_REGEX)) {
            this.setState({
                seed: data,
            });
        } else {
            timer.setTimeout(
                'invalidSeedAlert',
                () =>
                    this.props.generateAlert(
                        'error',
                        t('useExistingSeed:incorrectFormat'),
                        t('useExistingSeed:validSeedExplanation'),
                    ),
                500,
            );
        }
    }

    /**
     * Adds additional account information to store
     * Navigates to loading screen
     * @method fetchAccountInfo
     */
    async fetchAccountInfo(seed, accountName) {
        const { password, theme: { body } } = this.props;

        const seedStore = new SeedStore.keychain(password);
        await seedStore.addAccount(accountName, seed);

        this.props.setAdditionalAccountInfo({
            addingAdditionalAccount: true,
            additionalAccountName: accountName,
            additionalAccountType: 'keychain',
            seed,
            usedExistingSeed: true,
        });

        Navigation.setStackRoot('appStack', {
            component: {
                name: 'loading',
                options: {
                    animations: {
                        setStackRoot: {
                            enable: false,
                        },
                    },
                    layout: {
                        backgroundColor: body.bg,
                        orientation: ['portrait'],
                    },
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                    statusBar: {
                        drawBehind: true,
                        backgroundColor: body.bg,
                    },
                },
            },
        });
    }

    /**
     * Validates seed and dispatches an action to fetch associated information
     *
     * @method addExistingSeed
     * @param {string} seed
     * @param {string} accountName
     */
    async addExistingSeed(seed, accountName) {
        const { t, accountNames, password, shouldPreventAction } = this.props;
        if (!seed.match(VALID_SEED_REGEX) && seed.length === MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:seedInvalidChars'),
                t('addAdditionalSeed:seedInvalidCharsExplanation'),
            );
        } else if (seed.length < MAX_SEED_LENGTH) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:seedTooShort'),
                t('addAdditionalSeed:seedTooShortExplanation', {
                    maxLength: MAX_SEED_LENGTH,
                    currentLength: seed.length,
                }),
            );
        } else if (!(accountName.length > 0)) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:noNickname'),
                t('addAdditionalSeed:noNicknameExplanation'),
            );
        } else if (accountNames.map((name) => name.toLowerCase()).indexOf(accountName.toLowerCase()) > -1) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:nameInUse'),
                t('addAdditionalSeed:nameInUseExplanation'),
            );
        } else {
            if (shouldPreventAction) {
                return this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
            }

            const seedStore = new SeedStore.keychain(password);
            const isUniqueSeed = await seedStore.isUniqueSeed(seed);

            if (!isUniqueSeed) {
                return this.props.generateAlert(
                    'error',
                    t('addAdditionalSeed:seedInUse'),
                    t('addAdditionalSeed:seedInUseExplanation'),
                );
            }

            return this.fetchAccountInfo(seed, accountName);
        }
    }

    showModal = (modalContent) => {
        const { theme } = this.props;
        switch (modalContent) {
            case 'qrScanner':
                return this.props.toggleModalActivity(modalContent, {
                    theme,
                    onQRRead: (data) => this.onQRRead(data),
                    hideModal: () => this.hideModal(),
                    onMount: () => this.props.setDoNotMinimise(true),
                    onUnmount: () => this.props.setDoNotMinimise(false),
                });
            case 'passwordValidation':
                return this.props.toggleModalActivity(modalContent, {
                    theme,
                    validatePassword: (password) => this.SeedVaultImport.validatePassword(password),
                    hideModal: () => this.hideModal(),
                });
        }
    };

    hideModal = () => this.props.toggleModalActivity();

    render() {
        const { t, theme } = this.props;
        const { seed, accountName } = this.state;
        const textColor = { color: theme.body.color };

        return (
            <TouchableWithoutFeedback style={{ flex: 1 }} onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.8 }} />
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, textColor]}>{t('useExistingSeed:title')}</Text>
                        </View>
                        <View style={{ flex: 0.4 }} />
                        <CustomTextInput
                            label={t('global:seed')}
                            onChangeText={(text) => {
                                if (text.match(VALID_SEED_REGEX) || text.length === 0) {
                                    this.setState({ seed: text.toUpperCase() });
                                }
                            }}
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="characters"
                            maxLength={MAX_SEED_LENGTH}
                            value={seed}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="next"
                            onSubmitEditing={() => {
                                if (seed) {
                                    this.accountNameField.focus();
                                }
                            }}
                            theme={theme}
                            widget="qr"
                            onQRPress={() => this.onQRPress()}
                            seed={seed}
                        />
                        <View style={{ flex: 0.45 }} />
                        {!isIPhone11 && (
                            <SeedVaultImport
                                openPasswordValidationModal={() => this.showModal('passwordValidation')}
                                onSeedImport={(seed) => {
                                    this.setState({ seed });
                                    this.hideModal();
                                }}
                                onRef={(ref) => {
                                    this.SeedVaultImport = ref;
                                }}
                            />
                        )}
                        <View style={{ flex: 0.45 }} />
                        <CustomTextInput
                            onRef={(c) => {
                                this.accountNameField = c;
                            }}
                            label={t('addAdditionalSeed:accountName')}
                            onChangeText={(value) => this.setState({ accountName: value })}
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="words"
                            maxLength={MAX_SEED_LENGTH}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            theme={theme}
                            value={accountName}
                        />
                        <View style={{ flex: 1.2 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('addNewAccount')}
                            style={{ flex: 1 }}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.itemLeft}>
                                <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                                <Text style={[styles.titleTextLeft, textColor]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                        <TouchableOpacity
                            onPress={() => this.addExistingSeed(seed, trim(accountName))}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                            style={{ flex: 1 }}
                        >
                            <View style={styles.itemRight}>
                                <Text style={[styles.titleTextRight, textColor]}>{t('global:done')}</Text>
                                <Icon name="chevronRight" size={width / 28} color={theme.body.color} />
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    password: state.wallet.password,
    theme: state.settings.theme,
    shouldPreventAction: shouldPreventAction(state),
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    setAdditionalAccountInfo,
    toggleModalActivity,
    setDoNotMinimise,
};

export default withNamespaces(['addAdditionalSeed', 'useExistingSeed', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(UseExistingSeed),
);
