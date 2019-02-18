/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';

import { startTrackingProgress } from 'actions/progress';
import { migrate } from 'actions/migrations';
import { setFullNode } from 'actions/settings';

import Button from 'ui/components/Button';
import Modal from 'ui/components/modal/Modal';
import Progress from 'ui/components/Progress';

const electronStorage = {
    get: () => {
        return new Promise((resolve, reject) => {
            try {
                const data = Electron.getAllStorage();
                resolve(data);
            } catch (err) {
                reject(err);
            }
        });
    },
    clear: () => {
        return new Promise((resolve, reject) => {
            try {
                Electron.clearStorage();
                resolve();
            } catch (err) {
                reject();
            }
        });
    },
};

/**
 * Auto update progress window
 */
class Migration extends React.Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        activeStepIndex: PropTypes.number.isRequired,
        /** @ignore */
        activeSteps: PropTypes.array.isRequired,
        /** @ignore */
        migrate: PropTypes.func.isRequired,
        /** @ignore */
        setFullNode: PropTypes.func.isRequired,
        /** @ignore */
        startTrackingProgress: PropTypes.func.isRequired,
        /** @ignore */
        notificationLog: PropTypes.array.isRequired,
        /** @ignore */
        node: PropTypes.string.isRequired,
        /** @ignore */
        nodes: PropTypes.array.isRequired,
        /** @ignore */
        isChangingNode: PropTypes.bool.isRequired,
    };

    state = {
        hasFailedMigration: false,
    };

    componentDidMount() {
        this.initMigration();
    }

    componentWillReceiveProps(newProps) {
        if (this.props.notificationLog.length !== newProps.notificationLog.length) {
            this.setState({ hasFailedMigration: true });
        }
    }

    progressSteps() {
        const { t } = this.props;

        return [
            t('progressSteps:preparingData'),
            t('progressSteps:migratingSettings'),
            t('progressSteps:migratingAccounts'),
            t('progressSteps:cleaningUpOldData'),
            t('progressSteps:migrationComplete'),
        ];
    }

    changeNode = () => {
        const { node, nodes } = this.props;

        let randomNode = node;

        while (randomNode === node) {
            randomNode = nodes[(Math.random() * nodes.length) | 0];
        }

        this.props.setFullNode(randomNode);
    };

    initMigration = () => {
        this.setState({ hasFailedMigration: false });
        this.props.startTrackingProgress(this.progressSteps());
        this.props.migrate(electronStorage);
    };

    render() {
        const { t, activeSteps, activeStepIndex, isChangingNode } = this.props;
        const { hasFailedMigration } = this.state;

        return (
            <Modal variant="global" isOpen isForced onClose={() => {}}>
                <form>
                    <h1>{t('migration:dataMigration')}</h1>
                    {activeSteps.length > 0 && (
                        <article>
                            <Progress
                                type="large"
                                progress={Math.round((activeStepIndex + 1) / activeSteps.length * 100)}
                                subtitle={activeSteps[activeStepIndex]}
                            />
                        </article>
                    )}
                    {hasFailedMigration && (
                        <footer>
                            <Button loading={isChangingNode} variant="dark" onClick={this.changeNode}>
                                {t('changeNode')}
                            </Button>
                            <Button type="submit" variant="primary" onClick={this.initMigration}>
                                {t('retry')}
                            </Button>
                        </footer>
                    )}
                </form>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    activeStepIndex: state.progress.activeStepIndex,
    activeSteps: state.progress.activeSteps,
    notificationLog: state.alerts.notificationLog,
    nodes: state.settings.nodes,
    node: state.settings.node,
    isChangingNode: state.ui.isChangingNode,
});

const mapDispatchToProps = {
    migrate,
    startTrackingProgress,
    setFullNode,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Migration));
