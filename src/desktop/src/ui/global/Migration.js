/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';

import { startTrackingProgress } from 'actions/progress';
import { migrate } from 'actions/migrations';

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
        startTrackingProgress: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.startTrackingProgress(this.progressSteps());
        this.props.migrate(electronStorage);
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

    render() {
        const { t, activeSteps, activeStepIndex } = this.props;

        return (
            <Modal variant="global" isOpen isForced onClose={() => {}}>
                <form>
                    <h1>{t('migration:dataMigration')}</h1>
                    <article>
                        <Progress
                            type="large"
                            progress={Math.round((activeStepIndex + 1) / activeSteps.length * 100)}
                            subtitle={activeSteps[activeStepIndex]}
                        />
                    </article>
                </form>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    activeStepIndex: state.progress.activeStepIndex,
    activeSteps: state.progress.activeSteps,
});

const mapDispatchToProps = {
    migrate,
    startTrackingProgress,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Migration));
