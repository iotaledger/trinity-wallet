import isEqual from 'lodash/isEqual';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { View, Text, StyleSheet, TouchableOpacity, Keyboard, TouchableWithoutFeedback, AppState } from 'react-native';
import { setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { getSelectedAccountName, getSelectedAccountMeta } from 'shared-modules/selectors/accounts';
import { getThemeFromState } from 'shared-modules/selectors/global';
import FlagSecure from 'react-native-flag-secure-android';
import Fonts from 'ui/theme/fonts';
import Seedbox from 'ui/components/SeedBox';
import CustomTextInput from 'ui/components/CustomTextInput';
import SeedStore from 'libs/SeedStore';
import { hash } from 'libs/keychain';
import { width, height } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import CtaButton from 'ui/components/CtaButton';
import InfoBox from 'ui/components/InfoBox';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { tritsToChars } from 'shared-modules/libs/iota/converter';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    generalText: {
        fontFamily: Fonts.secondary,
        fontSize: Styling.fontSize4,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'space-around',
    },
    passwordTextContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    textFieldContainer: {
        flex: 2,
        justifyContent: 'flex-start',
        alignItems: 'center',
        paddingTop: height / 20,
    },
    viewButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    seedBoxContainer: {
        flex: 5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    hideButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
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
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    viewSeedButton: {
        borderWidth: 1.2,
        borderRadius: Styling.borderRadius,
        width: width / 2.7,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    viewSeedText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
});

/** View Seed screen component */
class ViewSeed extends Component {
    static propTypes = {
        /** @ignore */
        seedIndex: PropTypes.number.isRequired,
        /** Name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Type for selected account */
        selectedAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    constructor() {
        super();

        this.state = {
            password: null,
            showSeed: false,
            seed: '',
            appState: AppState.currentState, // eslint-disable-line react/no-unused-state
            isConfirming: true,
        };

        this.handleAppStateChange = this.handleAppStateChange.bind(this);
        this.hideSeed = this.hideSeed.bind(this);
        this.viewSeed = this.viewSeed.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('ViewSeed');
        AppState.addEventListener('change', this.handleAppStateChange);
    }

    componentWillReceiveProps(newProps) {
        if (this.props.seedIndex !== newProps.seedIndex) {
            this.hideSeed();
        }
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
        if (isAndroid) {
            FlagSecure.deactivate();
        }
        delete this.state.seed;
        delete this.state.password;
    }

    /**
     * Gets seed from keychain if correct password is provided
     *
     * @method viewSeed
     * @returns {Promise<void>}
     */
    async viewSeed() {
        const { selectedAccountName, selectedAccountMeta, t } = this.props;
        if (!this.state.password) {
            return this.props.generateAlert('error', t('login:emptyPassword'), t('emptyPasswordExplanation'));
        }
        const pwdHash = await hash(this.state.password);
        if (isEqual(global.passwordHash, pwdHash)) {
            const seedStore = await new SeedStore[selectedAccountMeta.type](pwdHash, selectedAccountName);
            if (isAndroid) {
                FlagSecure.activate();
            }
            this.setState({ seed: await seedStore.getSeed() });
            this.setState({ showSeed: true });
        } else {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        }
    }

    /**
     * Hides seed from screen if application goes into inactive or background state
     *
     * @method handleAppStateChange
     * @param {string} nextAppState
     */
    handleAppStateChange(nextAppState) {
        if (nextAppState.match(/inactive|background/)) {
            this.hideSeed();
        }

        this.setState({ appState: nextAppState }); // eslint-disable-line react/no-unused-state
    }

    /**
     * Resets internal state of the component
     * @method hideSeed
     */
    hideSeed() {
        this.setState({ showSeed: false });
        delete this.state.password;
        delete this.state.seed;
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };
        const borderColor = { borderColor: theme.body.color };
        const { isConfirming, password, showSeed } = this.state;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 1 }} />
                        {!showSeed &&
                            !isConfirming && (
                                <View style={styles.passwordTextContainer}>
                                    <Text style={[styles.generalText, textColor]}>{t('viewSeed:enterPassword')}</Text>
                                </View>
                            )}
                        <View style={{ flex: 0.8 }} />
                        {showSeed &&
                            !isConfirming && (
                                <View style={styles.seedBoxContainer}>
                                    <Seedbox
                                        seed={tritsToChars(this.state.seed)}
                                        bodyColor={theme.body.color}
                                        borderColor={borderColor}
                                        textColor={textColor}
                                    />
                                </View>
                            )}
                        {!showSeed &&
                            !isConfirming && (
                                <View style={styles.textFieldContainer}>
                                    <CustomTextInput
                                        label={t('global:password')}
                                        onValidTextChange={(password) => this.setState({ password })}
                                        containerStyle={{ width: Styling.contentWidth }}
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        enablesReturnKeyAutomatically
                                        returnKeyType="done"
                                        secureTextEntry
                                        value={password}
                                        theme={theme}
                                        isPasswordInput
                                    />
                                </View>
                            )}
                        <View style={{ flex: 1.2 }} />
                        {!isConfirming &&
                            !showSeed && (
                                <View style={styles.viewButtonContainer}>
                                    <CtaButton
                                        ctaColor={theme.primary.color}
                                        secondaryCtaColor={theme.primary.body}
                                        text={t('viewSeed:viewSeed')}
                                        onPress={this.viewSeed}
                                        ctaWidth={width / 2}
                                        ctaHeight={height / 16}
                                    />
                                </View>
                            )}
                        {isConfirming &&
                            !showSeed && (
                                <View>
                                    <InfoBox>
                                        <Text style={[styles.infoText, textColor]}>
                                            <Text style={styles.infoText}>{t('global:masterKey')} </Text>
                                            <Text style={styles.infoText}>{t('walletSetup:seedThief')} </Text>
                                            <Text style={styles.infoTextBold}>{t('walletSetup:keepSafe')} </Text>
                                        </Text>
                                        <View style={{ paddingTop: height / 20, alignItems: 'center' }}>
                                            <TouchableOpacity onPress={() => this.setState({ isConfirming: false })}>
                                                <View
                                                    style={[
                                                        styles.viewSeedButton,
                                                        { borderColor: theme.primary.color },
                                                    ]}
                                                >
                                                    <Text style={[styles.viewSeedText, { color: theme.primary.color }]}>
                                                        {t('viewSeed:viewSeed').toUpperCase()}
                                                    </Text>
                                                </View>
                                            </TouchableOpacity>
                                        </View>
                                    </InfoBox>
                                    <View style={{ flex: 0.1 }} />
                                </View>
                            )}
                        {showSeed &&
                            !isConfirming && (
                                <View style={styles.hideButtonContainer}>
                                    <CtaButton
                                        ctaColor={theme.primary.color}
                                        secondaryCtaColor={theme.primary.body}
                                        text={t('viewSeed:hideSeed')}
                                        onPress={this.hideSeed}
                                        ctaWidth={width / 2}
                                        ctaHeight={height / 16}
                                    />
                                </View>
                            )}
                        {!showSeed && isConfirming && <View style={styles.viewButtonContainer} />}
                        <View style={{ flex: 1 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('accountManagement')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                                <Text style={[styles.titleText, textColor]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    seedIndex: state.wallet.seedIndex,
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    setSetting,
    generateAlert,
};

export default withNamespaces(['viewSeed', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ViewSeed));
