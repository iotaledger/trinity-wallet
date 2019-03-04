import size from 'lodash/size';
import sample from 'lodash/sampleSize';
import React, { Component } from 'react';
import { ActivityIndicator, StyleSheet, Text, View } from 'react-native';
import PropTypes from 'prop-types';
import { Navigation } from 'react-native-navigation';
import timer from 'react-native-timer';
import { withNamespaces } from 'react-i18next';
import { startTrackingProgress } from 'shared-modules/actions/progress';
import { connect } from 'react-redux';
import { Styling } from 'ui/theme/general';
import { migrate } from 'shared-modules/actions/migrations';
import KeepAwake from 'react-native-keep-awake';
import { setFullNode } from 'shared-modules/actions/settings';
import { reduxPersistStorageAdapter } from 'libs/store';
import { migrateSeedStorage } from 'libs/keychain';
import { generateAlert } from 'shared-modules/actions/alerts';
import ProgressSteps from 'libs/progressSteps';
import { getThemeFromState } from 'shared-modules/selectors/global';
import Header from 'ui/components/Header';
import InfoBox from 'ui/components/InfoBox';
import NotificationButtonComponent from 'ui/components/NotificationButton';
import ProgressBar from 'ui/components/OldProgressBar';
import { height } from 'libs/dimensions';
import DualFooterButtons from './DualFooterButtons';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    topContainer: {
        flex: 1.4,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 1.9,
        alignItems: 'center',
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    notificationButton: {
        position: 'absolute',
        top: height / 30 + Styling.statusBarHeight,
        left: height / 30,
    },
});

/**
 * Migration component
 */
class Migration extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        activeStepIndex: PropTypes.number.isRequired,
        /** @ignore */
        activeSteps: PropTypes.array.isRequired,
        /** @ignore */
        migrate: PropTypes.func.isRequired,
        /** @ignore */
        startTrackingProgress: PropTypes.func.isRequired,
        /** @ignore */
        completedMigration: PropTypes.bool.isRequired,
        /** @ignore */
        notificationLog: PropTypes.array.isRequired,
        /** @ignore */
        nodes: PropTypes.array.isRequired,
        /** @ignore */
        setFullNode: PropTypes.func.isRequired,
        /** @ignore */
        isChangingNode: PropTypes.bool.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            hasFailedRealmMigration: false,
            hasCompletedRealmMigration: props.completedMigration,
        };
        this.changeNode = this.changeNode.bind(this);
        this.retryMigration = this.retryMigration.bind(this);
    }

    componentDidMount() {
        KeepAwake.activate();
        if (!this.props.completedMigration) {
            this.executeRealmMigration();
        } else {
            this.executeSeedMigration();
        }
    }

    componentWillReceiveProps(newProps) {
        if (size(this.props.notificationLog) !== size(newProps.notificationLog)) {
            this.setState({ hasFailedRealmMigration: true });
        }
        if (!this.props.completedMigration && newProps.completedMigration) {
            this.setState({ hasCompletedRealmMigration: true });
            this.executeSeedMigration();
        }
    }

    componentWillUnmount() {
        timer.clearTimeout('delayNavigation');
    }

    /**
     * Retries migration in case of failure
     *
     * @method retryMigration
     */
    getMigrationText() {
        const { t } = this.props;
        if (this.state.hasCompletedRealmMigration) {
            return t('seedMigrationExplanation');
        }
        return `${t('dataMigrationExplanation')} {t('loading:thisMayTake')} {t('doNotMinimise')}`;
    }

    /**
     * Triggers seed storage migration
     *
     * @method executeSeedMigration
     */
    executeSeedMigration() {
        const { t } = this.props;
        migrateSeedStorage(global.passwordHash)
            .then(() => timer.setTimeout('delayNavigation', () => this.navigateToLoadingScreen(), 7500))
            .catch(() => this.props.generateAlert('error', t('somethingWentWrong'), t('somethingWentWrongTryAgain')));
    }

    /**
     * Triggers AsyncStorage to Realm migration
     *
     * @method executeRealmMigration
     */
    executeRealmMigration() {
        this.props.startTrackingProgress(ProgressSteps.migration);
        this.props.migrate(reduxPersistStorageAdapter);
    }

    /**
     * Navigates to loading screen
     *
     * @method navigateToLoadingScreen
     */
    navigateToLoadingScreen() {
        KeepAwake.deactivate();
        Navigation.setStackRoot('appStack', {
            component: {
                name: 'loading',
                options: {
                    topBar: {
                        visible: false,
                        drawBehind: true,
                        elevation: 0,
                    },
                },
            },
        });
    }

    /**
     * Changes to a random node
     *
     * @method changeNode
     */
    changeNode() {
        this.props.setFullNode(...sample(this.props.nodes));
    }

    /**
     * Retries migration in case of failure
     *
     * @method retryMigration
     */
    retryMigration() {
        this.setState({ hasFailedRealmMigration: false });
        this.props.migrate(reduxPersistStorageAdapter);
    }

    /**
     * Renders progress bar textual information
     *
     * @method renderProgressBarChildren
     */
    renderProgressBarChildren() {
        const { activeStepIndex, activeSteps } = this.props;
        return activeSteps[activeStepIndex] ? activeSteps[activeStepIndex] : null;
    }

    render() {
        const { t, theme: { body, primary }, activeSteps, activeStepIndex, isChangingNode } = this.props;
        const textColor = { color: body.color };
        const { hasFailedRealmMigration, hasCompletedRealmMigration } = this.state;
        const sizeOfActiveSteps = size(activeSteps) - 1;

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <Header textColor={body.color}>{t('dataMigration')}</Header>
                </View>
                <View style={styles.midContainer}>
                    <InfoBox>
                        <View>
                            <Text style={[styles.infoText, textColor]}>{this.getMigrationText()}</Text>
                        </View>
                    </InfoBox>
                    <View style={{ flex: 0.4 }} />
                    <View style={{ flex: 1 }}>
                        {!hasCompletedRealmMigration &&
                            activeStepIndex > -1 && (
                                <ProgressBar
                                    style={{
                                        textWrapper: { flex: 0.3 },
                                    }}
                                    indeterminate={activeStepIndex === -1}
                                    progress={activeStepIndex / sizeOfActiveSteps}
                                    color={primary.color}
                                    textColor={body.color}
                                >
                                    {t(this.renderProgressBarChildren())}
                                </ProgressBar>
                            )}
                        {hasCompletedRealmMigration && (
                            <ActivityIndicator animating size="large" color={primary.color} />
                        )}
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    {hasFailedRealmMigration &&
                        !hasCompletedRealmMigration && (
                            <DualFooterButtons
                                onLeftButtonPress={this.changeNode}
                                onRightButtonPress={this.retryMigration}
                                leftButtonText={t('login:changeNode')}
                                rightButtonText={t('retry')}
                                isLeftButtonLoading={isChangingNode}
                            />
                        )}
                </View>
                {hasFailedRealmMigration && (
                    <View style={styles.notificationButton}>
                        <NotificationButtonComponent displayTopBar={false} />
                    </View>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    activeStepIndex: state.progress.activeStepIndex,
    activeSteps: state.progress.activeSteps,
    completedMigration: state.settings.completedMigration,
    notificationLog: state.alerts.notificationLog,
    nodes: state.settings.nodes,
    isChangingNode: state.ui.isChangingNode,
});

const mapDispatchToProps = {
    migrate,
    startTrackingProgress,
    setFullNode,
    generateAlert,
};

export default withNamespaces(['migration'])(connect(mapStateToProps, mapDispatchToProps)(Migration));
