/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { manuallySyncAccount } from 'actions/accounts';

import { getAddressesForSelectedAccount, getSelectedAccountName } from 'selectors/accounts';

import {
    transitionForSnapshot,
    completeSnapshotTransition,
    setBalanceCheckFlag,
    generateAddressesAndGetBalance,
} from 'actions/wallet';

import { formatValue, formatUnit } from 'libs/iota/utils';
import { round } from 'libs/utils';
import { getSeed } from 'libs/crypto';

import Scrollbar from 'ui/components/Scrollbar';
import Button from 'ui/components/Button';
import Loading from 'ui/components/Loading';
import ModalConfirm from 'ui/components/modal/Confirm';

/**
 * Account tools component
 */
class Addresses extends PureComponent {
    static propTypes = {
        /** @ignore */
        settings: PropTypes.object.isRequired,
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        ui: PropTypes.object.isRequired,
        /** @ignore */
        selectedAccountName: PropTypes.string.isRequired,
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
        t: PropTypes.func.isRequired,
    };

    componentWillReceiveProps(newProps) {
        const { wallet, ui } = newProps;

        if (ui.isTransitioning || ui.isAttachingToTangle || wallet.balanceCheckFlag) {
            Electron.updateMenu('enabled', false);
        } else {
            Electron.updateMenu('enabled', true);
        }
    }

    /**
     * Trigger manual account sync Worker task
     * @returns {Promise}
     */
    syncAccount = async () => {
        const { wallet, selectedAccountName } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);

        this.props.manuallySyncAccount(seed, selectedAccountName, Electron.genFn);
    };

    /**
     * Trigger snapshot transition Worker task
     * @returns {Promise}
     */
    startSnapshotTransition = async () => {
        const { wallet, addresses, selectedAccountName } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);

        this.props.transitionForSnapshot(seed, addresses, Electron.genFn);
    };

    /**
     * Trigger snapshot transition completion
     * @returns {Promise}
     */
    transitionBalanceOk = async () => {
        this.props.setBalanceCheckFlag(false);
        const { wallet, selectedAccountName, settings } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);

        const powFn = !settings.remotePoW ? Electron.powFn : null;

        this.props.completeSnapshotTransition(seed, selectedAccountName, wallet.transitionAddresses, powFn);
    };

    /**
     * rigger snapshot transition
     * @returns {Promise}
     */
    transitionBalanceWrong = async () => {
        this.props.setBalanceCheckFlag(false);
        const { wallet, selectedAccountName } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);
        const currentIndex = wallet.transitionAddresses.length;

        this.props.generateAddressesAndGetBalance(seed, currentIndex, Electron.genFn);
    };

    render() {
        const { ui, wallet, t } = this.props;

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
                                    {t('loading:thisMayTake')} {t('global:pleaseWaitEllipses')}
                                </div>
                            )}
                        </React.Fragment>
                    }
                />
            );
        }

        return (
            <div>
                <Scrollbar>
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
                </Scrollbar>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    ui: state.ui,
    wallet: state.wallet,
    settings: state.settings,
    selectedAccountName: getSelectedAccountName(state),
    addresses: getAddressesForSelectedAccount(state),
});

const mapDispatchToProps = {
    completeSnapshotTransition,
    manuallySyncAccount,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    setBalanceCheckFlag,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Addresses));
