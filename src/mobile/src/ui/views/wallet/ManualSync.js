import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { withNamespaces } from 'react-i18next';
import { connect } from 'react-redux';
import { setSetting } from 'shared-modules/actions/wallet';
import { generateAlert } from 'shared-modules/actions/alerts';
import { shouldPreventAction, getThemeFromState } from 'shared-modules/selectors/global';
import { getSelectedAccountName, getSelectedAccountMeta } from 'shared-modules/selectors/accounts';
import { manuallySyncAccount } from 'shared-modules/actions/accounts';
import SeedStore from 'libs/SeedStore';
import { width, height } from 'libs/dimensions';
import SettingsBackButton from 'ui/components/SettingsBackButton';
import CtaButton from 'ui/components/CtaButton';
import InfoBox from 'ui/components/InfoBox';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 1,
    },
    topContainer: {
        flex: 11,
        justifyContent: 'center',
    },
    innerContainer: {
        flex: 4,
        justifyContent: 'center',
    },
    syncButtonContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
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
        /** Account name for selected account */
        selectedAccountName: PropTypes.string.isRequired,
        /** Account meta for selected account */
        selectedAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        manuallySyncAccount: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('ManualSync');
    }

    async sync() {
        const { selectedAccountName, selectedAccountMeta, t, shouldPreventAction } = this.props;

        if (!shouldPreventAction) {
            const seedStore = await new SeedStore[selectedAccountMeta.type](global.passwordHash, selectedAccountName);
            this.props.manuallySyncAccount(seedStore, selectedAccountName);
        } else {
            this.props.generateAlert('error', t('global:pleaseWait'), t('global:pleaseWaitExplanation'));
        }
    }

    render() {
        const { isSyncing, theme, t } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ flex: 0.8 }} />
                    {!isSyncing && (
                        <View style={styles.innerContainer}>
                            <InfoBox>
                                <Text style={[styles.infoText, textColor]}>{t('manualSync:outOfSync')}</Text>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                    {t('manualSync:pressToSync')}
                                </Text>
                            </InfoBox>
                            <View style={styles.syncButtonContainer}>
                                <CtaButton
                                    ctaColor={theme.primary.color}
                                    secondaryCtaColor={theme.primary.body}
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
                            <InfoBox>
                                <Text style={[styles.infoText, textColor]}>{t('manualSync:syncingYourAccount')}</Text>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                    {t('manualSync:thisMayTake')}
                                </Text>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                                    {t('manualSync:doNotClose')}
                                </Text>
                            </InfoBox>
                            <ActivityIndicator
                                animating={isSyncing}
                                style={styles.activityIndicator}
                                size="large"
                                color={theme.primary.color}
                            />
                        </View>
                    )}
                </View>
                <View style={styles.bottomContainer}>
                    <SettingsBackButton
                        theme={theme}
                        backFunction={() => this.props.setSetting('advancedSettings')}
                        inactive={isSyncing}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    isSyncing: state.ui.isSyncing,
    theme: getThemeFromState(state),
    selectedAccountName: getSelectedAccountName(state),
    selectedAccountMeta: getSelectedAccountMeta(state),
    shouldPreventAction: shouldPreventAction(state),
});

const mapDispatchToProps = {
    generateAlert,
    setSetting,
    manuallySyncAccount,
};

export default withNamespaces(['manualSync', 'global'])(connect(mapStateToProps, mapDispatchToProps)(ManualSync));
