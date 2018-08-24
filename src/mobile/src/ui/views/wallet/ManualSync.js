import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { shouldPreventAction } from 'shared-modules/selectors/global';
import { getSelectedAccountName } from 'shared-modules/selectors/accounts';
import { manuallySyncAccount } from 'shared-modules/actions/accounts';
import { getSeedFromKeychain } from 'libs/keychain';
import { width, height } from 'libs/dimensions';
import { getMultiAddressGenFn } from 'libs/nativeModules';
import { Icon } from 'ui/theme/icons';
import CtaButton from 'ui/components/CtaButton';
import InfoBox from 'ui/components/InfoBox';
import GENERAL from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 11,
        justifyContent: 'center',
    },
    innerContainer: {
        flex: 4,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: GENERAL.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    syncButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 40,
    },
});

/** Manual Sync component */
export class ManualSync extends Component {
    static propTypes = {
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** Determines whether to allow manual sync action  */
        shouldPreventAction: PropTypes.bool.isRequired,
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Hash for wallet's password */
        password: PropTypes.object.isRequired,
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        manuallySyncAccount: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('ManualSync');
    }

    sync() {
        const { password, selectedAccountName, t, shouldPreventAction } = this.props;

        if (!shouldPreventAction) {
            getSeedFromKeychain(password, selectedAccountName)
                .then((seed) => {
                    if (seed === null) {
                        return this.props.generateAlert(
                            'error',
                            t('global:somethingWentWrong'),
                            t('global:somethingWentWrongTryAgain'),
                        );
                    }

                    const genFn = getMultiAddressGenFn();
                    this.props.manuallySyncAccount(seed, selectedAccountName, genFn);
                })
                .catch((err) => console.error(err)); // eslint-disable-line no-console
        } else {
            this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
    }

    render() {
        const { isSyncing, theme: { body, primary }, t } = this.props;
        const textColor = { color: body.color };

        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ flex: 0.8 }} />
                    {!isSyncing && (
                        <View style={styles.innerContainer}>
                            <InfoBox
                                body={body}
                                text={
                                    <View>
                                        <Text style={[styles.infoText, textColor]}>{t('manualSync:outOfSync')}</Text>
                                        <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                            {t('manualSync:pressToSync')}
                                        </Text>
                                    </View>
                                }
                            />
                            <View style={styles.syncButtonContainer}>
                                <CtaButton
                                    ctaColor={primary.color}
                                    secondaryCtaColor={primary.body}
                                    text={t('manualSync:syncAccount')}
                                    onPress={() => this.sync()}
                                    ctaWidth={width / 2}
                                    ctaHeight={height / 16}
                                />
                            </View>
                        </View>
                    )}
                    {isSyncing && (
                        <View style={styles.innerContainer}>
                            <InfoBox
                                body={body}
                                text={
                                    <View>
                                        <Text style={[styles.infoText, textColor]}>
                                            {t('manualSync:syncingYourAccount')}
                                        </Text>
                                        <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                            {t('manualSync:thisMayTake')}
                                        </Text>
                                        <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                            {t('manualSync:doNotClose')}
                                        </Text>
                                    </View>
                                }
                            />
                            <ActivityIndicator
                                animating={isSyncing}
                                style={styles.activityIndicator}
                                size="large"
                                color={primary.color}
                            />
                        </View>
                    )}
                </View>
                <View style={styles.bottomContainer}>
                    {!isSyncing && (
                        <TouchableOpacity
                            onPress={() => this.props.setSetting('advancedSettings')}
                            hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                        >
                            <View style={styles.item}>
                                <Icon name="chevronLeft" size={width / 28} color={body.color} />
                                <Text style={[styles.titleText, textColor]}>{t('global:back')}</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    isSyncing: state.ui.isSyncing,
    password: state.wallet.password,
    theme: state.settings.theme,
    selectedAccountName: getSelectedAccountName(state),
    shouldPreventAction: shouldPreventAction(state),
});

const mapDispatchToProps = {
    generateAlert,
    setSetting,
    manuallySyncAccount,
};

export default translate(['manualSync', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ManualSync));
