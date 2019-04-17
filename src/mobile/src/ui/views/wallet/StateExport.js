import filter from 'lodash/filter';
import flatMap from 'lodash/flatMap';
import includes from 'lodash/includes';
import pick from 'lodash/pick';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { setSetting } from 'shared-modules/actions/wallet';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import { generateAlert } from 'shared-modules/actions/alerts';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import InfoBox from 'ui/components/InfoBox';
import RNFetchBlob from 'rn-fetch-blob';
import { isAndroid, getAndroidFileSystemPermissions } from 'libs/device';
import { moment } from 'shared-modules/libs/exports';
import { serialise } from 'shared-modules/libs/utils';

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
        flex: 5,
        justifyContent: 'flex-start',
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

    renderBackOption() {
        const { theme, t } = this.props;

        return (
            <TouchableOpacity
                onPress={() => this.props.setSetting('mainSettings')}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemLeft}>
                    <Icon name="chevronLeft" size={width / 28} color={theme.body.color} />
                    <Text style={[styles.titleTextLeft, { color: theme.body.color }]}>{t('global:back')}</Text>
                </View>
            </TouchableOpacity>
        );
    }

    renderExportOption() {
        const { accounts, settings, notificationLog, t, theme } = this.props;

        return (
            <TouchableOpacity
                onPress={async () => {
                    if (isAndroid) {
                        await getAndroidFileSystemPermissions();
                    }

                    const path = `${
                        isAndroid ? RNFetchBlob.fs.dirs.DownloadDir : RNFetchBlob.fs.dirs.CacheDir
                    }/Trinity-${moment().format('YYYYMMDD-HHmm')}.txt`;

                    const fs = RNFetchBlob.fs;

                    try {
                        const files = await Promise.all([
                            fs.ls(fs.dirs.DocumentDir),
                            fs.ls(fs.dirs.CacheDir),
                            fs.ls(fs.dirs.MainBundleDir),
                        ]);

                        const fileExists = RNFetchBlob.fs.exists(path);
                        if (fileExists) {
                            RNFetchBlob.fs.unlink(path);
                        }
                        await RNFetchBlob.fs.createFile(
                            path,
                            serialise(
                                {
                                    accounts: pick(accounts, ['onboardingComplete', 'accountInfo']),
                                    settings: pick(settings, ['versions']),
                                    notificationLog,
                                    storageFiles: filter(flatMap(files), (name) => includes(name, 'realm')),
                                },
                                null,
                                4,
                            ),
                        );
                        this.props.generateAlert('success', t('exportSuccess'), t('exportSuccessExplanation'));
                    } catch (error) {
                        this.props.generateAlert(
                            'error',
                            t('global:somethingWentWrong'),
                            t('global:somethingWentWrongTryAgain'),
                        );
                    }
                }}
                hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
            >
                <View style={styles.itemRight}>
                    <Text style={[styles.titleTextRight, { color: theme.body.color }]}>{t('export')}</Text>
                    <Icon name="tick" size={width / 28} color={theme.body.color} />
                </View>
            </TouchableOpacity>
        );
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
                        {this.renderBackOption()}
                        {this.renderExportOption()}
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

export default withNamespaces(['stateExport', 'global'])(connect(mapStateToProps, mapDispatchToProps)(StateExport));
