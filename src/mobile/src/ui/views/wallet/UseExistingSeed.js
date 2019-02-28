import size from 'lodash/size';
import trim from 'lodash/trim';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import PropTypes from 'prop-types';
import { navigator } from 'libs/navigation';
import { StyleSheet, View, Text, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { MAX_SEED_TRITS, MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'shared-modules/libs/iota/utils';
import { setSetting } from 'shared-modules/actions/wallet';
import { setAccountInfoDuringSetup } from 'shared-modules/actions/accounts';
import { generateAlert } from 'shared-modules/actions/alerts';
import { shouldPreventAction, getThemeFromState } from 'shared-modules/selectors/global';
import { getAccountNamesFromState } from 'shared-modules/selectors/accounts';
import { toggleModalActivity, setDoNotMinimise } from 'shared-modules/actions/ui';
import timer from 'react-native-timer';
import SeedStore from 'libs/SeedStore';
import SeedVaultImport from 'ui/components/SeedVaultImportComponent';
import CustomTextInput from 'ui/components/CustomTextInput';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { trytesToTrits } from 'shared-modules/libs/iota/converter';

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
        /** Determines whether addition of new seed is allowed */
        shouldPreventAction: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
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
        delete this.state.seed;
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
        this.hideModal();
        if (data.toString().length === 81 && data.toString().match(VALID_SEED_REGEX)) {
            this.setState({
                seed: trytesToTrits(data),
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
        const seedStore = await new SeedStore.keychain(global.passwordHash);
        await seedStore.addAccount(accountName, seed);

        this.props.setAccountInfoDuringSetup({
            name: accountName,
            meta: { type: 'keychain' },
            completed: true,
            usedExistingSeed: true,
        });

        navigator.setStackRoot('loading');
    }

    /**
     * Validates seed and dispatches an action to fetch associated information
     *
     * @method addExistingSeed
     * @param {string} seed
     * @param {string} accountName
     */
    async addExistingSeed(seed, accountName) {
        const { t, accountNames, shouldPreventAction } = this.props;
        if (seed.length < MAX_SEED_TRITS) {
            this.props.generateAlert(
                'error',
                t('addAdditionalSeed:seedTooShort'),
                t('addAdditionalSeed:seedTooShortExplanation', {
                    maxLength: MAX_SEED_LENGTH,
                    currentLength: size(seed) / 3,
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
            const seedStore = await new SeedStore.keychain(global.passwordHash);
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
                    displayTopBar: true,
                });
            case 'passwordValidation':
                return this.props.toggleModalActivity(modalContent, {
                    theme,
                    validatePassword: (password) => this.SeedVaultImport.validatePassword(password),
                    hideModal: () => this.hideModal(),
                    isDashboard: true,
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
                        <View style={{ flex: 0.5 }} />
                        <View style={styles.titleContainer}>
                            <Text style={[styles.title, textColor]}>{t('useExistingSeed:title')}</Text>
                        </View>
                        <View style={{ flex: 0.5 }} />
                        <CustomTextInput
                            onRef={(c) => {
                                this.accountNameField = c;
                            }}
                            label={t('addAdditionalSeed:accountName')}
                            onValidTextChange={(value) => this.setState({ accountName: value })}
                            containerStyle={{ width: Styling.contentWidth }}
                            autoCapitalize="words"
                            maxLength={MAX_SEED_LENGTH}
                            autoCorrect={false}
                            enablesReturnKeyAutomatically
                            returnKeyType="done"
                            theme={theme}
                            value={accountName}
                        />
                        <View style={{ flex: 0.25 }} />
                        <CustomTextInput
                            label={t('global:seed')}
                            onValidTextChange={(text) => this.setState({ seed: text })}
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
                            isSeedInput
                        />
                        <View style={{ flex: 0.5 }} />
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
                        <View style={{ flex: 0.5 }} />
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
    theme: getThemeFromState(state),
    shouldPreventAction: shouldPreventAction(state),
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
    setAccountInfoDuringSetup,
    toggleModalActivity,
    setDoNotMinimise,
};

export default withNamespaces(['addAdditionalSeed', 'useExistingSeed', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(UseExistingSeed),
);
