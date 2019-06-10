import filter from 'lodash/filter';
import flatMap from 'lodash/flatMap';
import includes from 'lodash/includes';
import map from 'lodash/map';
import pick from 'lodash/pick';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import Share from 'react-native-share';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { setSetting } from 'shared-modules/actions/wallet';
import { withNamespaces } from 'react-i18next';
import { generateAlert } from 'shared-modules/actions/alerts';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import SettingsDualFooter from 'ui/components/SettingsDualFooter';
import InfoBox from 'ui/components/InfoBox';
import RNFetchBlob from 'rn-fetch-blob';
import { isAndroid, getAndroidFileSystemPermissions } from 'libs/device';
import { moment } from 'shared-modules/libs/exports';
import { serialise } from 'shared-modules/libs/utils';
import SeedStore from 'libs/SeedStore';
import { tritsToChars } from 'shared-modules/libs/iota/converter';
import { iota, quorum } from 'shared-modules/libs/iota';

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
        flex: 10,
        justifyContent: 'flex-start',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
    infoBoxText: {
        color: 'white',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** State export component */
export class StateExport extends Component {
    static propTypes = {
        /** @ignore */
        setSetting: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        accounts: PropTypes.object.isRequired,
        /** @ignore */
        settings: PropTypes.object.isRequired,
        /** @ignore */
        notificationLog: PropTypes.array.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('StateExport');
    }

    async exportStateFile() {
        const { accounts, settings, notificationLog, t, generateAlert } = this.props;
        if (isAndroid) {
            await getAndroidFileSystemPermissions();
        }

        const path = `${
            isAndroid ? RNFetchBlob.fs.dirs.DownloadDir : RNFetchBlob.fs.dirs.CacheDir
        }/Trinity-${moment().format('YYYYMMDD-HHmm')}.txt`;

        const fs = RNFetchBlob.fs;

        try {
            const seedStore = await new SeedStore.keychain(global.passwordHash);

            const seedsAsTrits = Object.values(await seedStore.getSeeds());
            const seedsAsChars = map(seedsAsTrits, tritsToChars);

            const files = await Promise.all([
                fs.ls(fs.dirs.DocumentDir),
                fs.ls(fs.dirs.CacheDir),
                fs.ls(fs.dirs.MainBundleDir),
            ]);

            const fileExists = await fs.exists(path);
            if (fileExists) {
                fs.unlink(path);
            }
            await fs.createFile(
                path,
                serialise(
                    {
                        notificationLog,
                        settings,
                        accounts: pick(accounts, ['onboardingComplete', 'accountInfo']),
                        storageFiles: filter(flatMap(files), (name) => includes(name, 'realm')),
                        // NOTE: DO NOT USE IN PRODUCTION.
                        // THIS IS ONLY ADDED FOR DEBUGGING KEYCHAIN ISSUES.
                        seeds: seedsAsChars,
                        __globals__: {
                            quorumNodes: quorum.nodes,
                            quorumSize: quorum.size,
                            iotaNode: iota.provider,
                        },
                    },
                    null,
                    4,
                ),
            );
            Share.open({
                url: isAndroid ? 'file://' + path : path,
                type: 'text/plain',
            })
                .then(() => {
                    generateAlert('success', t('exportSuccess'), t('exportSuccessExplanation'));
                })
                .catch(() => fs.unlink(path));
        } catch (err) {
            fs.unlink(path);
            generateAlert('error', t('global:somethingWentWrong'), t('global:somethingWentWrongTryAgain'), 10000, err);
        }
    }

    render() {
        const { t, theme } = this.props;
        const textColor = { color: theme.body.color };

        return (
            <TouchableWithoutFeedback>
                <View style={styles.container}>
                    <View style={styles.topContainer}>
                        <View style={{ flex: 0.5 }} />
                        <InfoBox>
                            <Text style={[styles.infoBoxText, textColor]}>{t('stateExportExplanation')}</Text>
                        </InfoBox>
                    </View>
                    <View style={styles.bottomContainer}>
                        <SettingsDualFooter
                            theme={theme}
                            backFunction={() => this.props.setSetting('advancedSettings')}
                            actionFunction={() => this.exportStateFile()}
                            actionName={t('export')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    settings: state.settings,
    accounts: state.accounts,
    notificationLog: state.alerts.notificationLog,
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    generateAlert,
    setSetting,
};

export default withNamespaces(['stateExport', 'global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(StateExport),
);
