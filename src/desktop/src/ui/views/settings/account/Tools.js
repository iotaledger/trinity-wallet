/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';

import { manuallySyncAccount } from 'actions/accounts';

import {
    transitionForSnapshot,
    completeSnapshotTransition,
    setBalanceCheckFlag,
    generateAddressesAndGetBalance,
} from 'actions/wallet';

import { formatValue, formatUnit } from 'libs/iota/utils';
import { round } from 'libs/utils';
import SeedStore from 'libs/SeedStore';

import Scrollbar from 'ui/components/Scrollbar';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';
import ModalConfirm from 'ui/components/modal/Confirm';
import size from 'lodash/size';

import css from '../index.scss';

/**
 * Account tools component
 */
class Tools extends PureComponent {
    static propTypes = {
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        ui: PropTypes.object.isRequired,
        /** @ignore */
        account: PropTypes.object.isRequired,
        /** @ignore */
        completeSnapshotTransition: PropTypes.func.isRequired,
        /** @ignore */
        setBalanceCheckFlag: PropTypes.func.isRequired,
        /** @ignore */
        manuallySyncAccount: PropTypes.func.isRequired,
        /** @ignore */
        generateAddressesAndGetBalance: PropTypes.func.isRequired,
        /** @ignore */
        transitionForSnapshot: PropTypes.func.isRequired,
        /** @ignore */
        activeStepIndex: PropTypes.number.isRequired,
        /** @ignore */
        activeSteps: PropTypes.array.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    static renderProgressChildren(activeStepIndex, sizeOfActiveSteps, t) {
        if (activeStepIndex === -1) {
            return null;
        }

        return t('snapshotTransition:attachProgress', {
            currentAddress: activeStepIndex + 1,
            totalAddresses: sizeOfActiveSteps,
        });
    }

    componentDidUpdate(prevProps) {
        const { wallet, ui } = this.props;

        if (
            prevProps.isTransitioning === ui.isTransitioning &&
            prevProps.isAttachingToTangle === ui.isAttachingToTangle &&
            prevProps.balanceCheckFlag === wallet.balanceCheckFlag &&
            prevProps.ui.isSyncing === ui.isSyncing
        ) {
            return;
        }

        if (ui.isSyncing || ui.isTransitioning || ui.isAttachingToTangle || wallet.balanceCheckFlag) {
            Electron.updateMenu('enabled', false);
        } else {
            Electron.updateMenu('enabled', true);
            Electron.garbageCollect();
        }
    }

    /**
     * Trigger manual account sync Worker task
     * @returns {Promise}
     */
    syncAccount = async () => {
        const { wallet } = this.props;
        const { accountName, meta } = this.props.account;

        const seedStore = await new SeedStore[meta.type](wallet.password, accountName, meta);

        this.props.manuallySyncAccount(seedStore, accountName);
    };

    /**
     * Trigger snapshot transition Worker task
     * @returns {Promise}
     */
    startSnapshotTransition = async () => {
        const { wallet } = this.props;
        const { accountName, meta, addressData } = this.props.account;

        const seedStore = await new SeedStore[meta.type](wallet.password, accountName, meta);

        this.props.transitionForSnapshot(seedStore, addressData);
    };

    /**
     * Trigger snapshot transition completion
     * @returns {Promise}
     */
    transitionBalanceOk = async () => {
        this.props.setBalanceCheckFlag(false);
        const { wallet } = this.props;
        const { accountName, meta } = this.props.account;

        const seedStore = await new SeedStore[meta.type](wallet.password, accountName, meta);

        this.props.completeSnapshotTransition(seedStore, accountName, wallet.transitionAddresses);
    };

    /**
     * Trigger snapshot transition
     * @returns {Promise}
     */
    transitionBalanceWrong = async () => {
        this.props.setBalanceCheckFlag(false);
        const { wallet } = this.props;
        const { accountName, meta } = this.props.account;

        const seedStore = await new SeedStore[meta.type](wallet.password, accountName, meta);

        const currentIndex = wallet.transitionAddresses.length;

        this.props.generateAddressesAndGetBalance(seedStore, currentIndex);
    };

    render() {
        const { ui, wallet, t, activeStepIndex, activeSteps } = this.props;
        const sizeOfActiveSteps = size(activeSteps);

        if ((ui.isTransitioning || ui.isAttachingToTangle) && !wallet.balanceCheckFlag) {
            return (
                <Loading
                    loop
                    transparent={false}
                    title={t('advancedSettings:snapshotTransition')}
                    subtitle={
                        <React.Fragment>
                            {!ui.isAttachingToTangle ? (
                                <div>
                                    {t('snapshotTransition:transitioning')} <br />
                                    {t('snapshotTransition:generatingAndDetecting')} {t('global:pleaseWaitEllipses')}
                                </div>
                            ) : (
                                <div>
                                    {t('snapshotTransition:attaching')} <br />
                                    {t('loading:thisMayTake')} {t('global:pleaseWaitEllipses')} <br />
                                    {Tools.renderProgressChildren(activeStepIndex, sizeOfActiveSteps, t)}
                                </div>
                            )}
                        </React.Fragment>
                    }
                />
            );
        }

        return (
            <div className={css.scroll}>
                <Scrollbar>
                    <article>
                        <h3>{t('advancedSettings:snapshotTransition')}</h3>
                        <p>
                            {t('snapshotTransition:snapshotExplanation')} <br />
                            {t('snapshotTransition:hasSnapshotTakenPlace')}
                        </p>
                        <Button
                            className="small"
                            onClick={this.startSnapshotTransition}
                            loading={ui.isTransitioning || ui.isAttachingToTangle}
                        >
                            {t('snapshotTransition:transition')}
                        </Button>
                        <ModalConfirm
                            isOpen={wallet.balanceCheckFlag}
                            category="primary"
                            onConfirm={this.transitionBalanceOk}
                            onCancel={this.transitionBalanceWrong}
                            content={{
                                title: t('snapshotTransition:detectedBalance', {
                                    amount: round(formatValue(wallet.transitionBalance), 1),
                                    unit: formatUnit(wallet.transitionBalance),
                                }),
                                message: t('snapshotTransition:isThisCorrect'),
                                confirm: t('global:yes'),
                                cancel: t('global:no'),
                            }}
                        />
                        <hr />

                        <h3>{t('advancedSettings:manualSync')}</h3>
                        {ui.isSyncing ? (
                            <p>
                                {t('manualSync:syncingYourAccount')} <br />
                                {t('manualSync:thisMayTake')}
                            </p>
                        ) : (
                            <p>
                                {t('manualSync:outOfSync')} <br />
                                {t('manualSync:pressToSync')}
                            </p>
                        )}
                        <Button
                            onClick={this.syncAccount}
                            className="small"
                            loading={ui.isSyncing}
                            disabled={ui.isTransitioning || ui.isAttachingToTangle}
                        >
                            {t('manualSync:syncAccount')}
                        </Button>
                    </article>
                </Scrollbar>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    ui: state.ui,
    wallet: state.wallet,
    settings: state.settings,
    activeStepIndex: state.progress.activeStepIndex,
    activeSteps: state.progress.activeSteps,
});

const mapDispatchToProps = {
    completeSnapshotTransition,
    manuallySyncAccount,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    setBalanceCheckFlag,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Tools));
