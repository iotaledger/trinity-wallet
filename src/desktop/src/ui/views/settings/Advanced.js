/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { changePowSettings, changeAutoPromotionSettings, setLockScreenTimeout } from 'actions/settings';
import { completeSnapshotTransition, setBalanceCheckFlag } from 'actions/wallet';
import { generateAlert } from 'actions/alerts';

import { clearVault, getSeed } from 'libs/crypto';
import { getPoWFn } from 'libs/pow';

import { toggleModalActivity } from 'actions/ui';
import { getSelectedAccountName, getAddressesForSelectedAccount } from 'selectors/accounts';
import { formatValue, formatUnit } from 'libs/iota/utils';
import { round } from 'libs/utils';

import { runTask } from 'worker';

import Button from 'ui/components/Button';
import ModalPassword from 'ui/components/modal/Password';
import ModalConfirm from 'ui/components/modal/Confirm';
import Loading from 'ui/components/Loading';
import Toggle from 'ui/components/Toggle';
import TextInput from 'ui/components/input/Text';
import Scrollbar from 'ui/components/Scrollbar';

/**
 * Advanced user settings component, including - wallet reset
 */
class Advanced extends PureComponent {
    static propTypes = {
        /** @ignore */
        remotePoW: PropTypes.bool.isRequired,
        /** @ignore */
        autoPromotion: PropTypes.bool.isRequired,
        /** @ignore */
        changePowSettings: PropTypes.func.isRequired,
        /** @ignore */
        changeAutoPromotionSettings: PropTypes.func.isRequired,
        /** @ignore */
        setLockScreenTimeout: PropTypes.func.isRequired,
        /** @ignore */
        lockScreenTimeout: PropTypes.number.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        settings: PropTypes.object.isRequired,
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        ui: PropTypes.object.isRequired,
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        transitionBalance: PropTypes.number.isRequired,
        /** @ignore */
        transitionAddresses: PropTypes.array.isRequired,
        /** @ignore */
        isAttachingToTangle: PropTypes.bool.isRequired,
        /** @ignore */
        isModalActive: PropTypes.bool.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        /** @ignore */
        balanceCheckFlag: PropTypes.bool.isRequired,
        /** @ignore */
        selectedAccountName: PropTypes.string.isRequired,
        /** @ignore */
        completeSnapshotTransition: PropTypes.func.isRequired,
        /** @ignore */
        setBalanceCheckFlag: PropTypes.func.isRequired,
    };

    state = {
        resetConfirm: false,
    };

    componentWillReceiveProps(newProps) {
        const { balanceCheckFlag } = this.props;
        if (balanceCheckFlag !== newProps.balanceCheckFlag) {
            this.props.toggleModalActivity();
            return;
        }
        const { isTransitioning, isAttachingToTangle, isModalActive } = newProps;
        if (isTransitioning || isAttachingToTangle || isModalActive) {
            Electron.updateMenu('enabled', false);
        } else {
            Electron.updateMenu('enabled', true);
        }
    }

    /**
     * Hard reset wallet
     * @param {string} Password - Plain text wallet password
     * @returns {undefined}
     */
    resetWallet = async (password) => {
        const { t, generateAlert } = this.props;

        try {
            await clearVault(password);
            localStorage.clear();
            Electron.clearStorage();
            location.reload();
        } catch (err) {
            generateAlert(
                'error',
                t('changePassword:incorrectPassword'),
                t('changePassword:incorrectPasswordExplanation'),
            );
            return;
        }
    };

    /**
     * Update wallet lock timeout in interval 1 - 60 minutes
     * @param {number} value - Timeout in miniutes
     * @returns {undefined}
     */
    changeLockScreenTimeout = (value) => {
        const timeout = Math.abs(parseInt(value)) || 1;
        this.props.setLockScreenTimeout(timeout > 60 ? 60 : timeout);
    };

    /**
     * Trigger manual account sync Worker task
     * @returns {Promise}
     */
    syncAccount = async () => {
        const { wallet, selectedAccountName } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);
        runTask('manuallySyncAccount', [seed, selectedAccountName]);
    };

    /**
     * Trigger snapshot transition Worker task
     * @returns {Promise}
     */
    startSnapshotTransition = async () => {
        const { wallet, addresses, selectedAccountName } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);
        runTask('transitionForSnapshot', [seed, addresses]);
    };

    /**
     * Trigger snapshot transition completion
     * @returns {Promise}
     */
    transitionBalanceOk = async () => {
        this.props.setBalanceCheckFlag(false);
        const { wallet, transitionAddresses, selectedAccountName, settings, t } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);

        let powFn = null;
        if (!settings.remotePoW) {
            try {
                powFn = getPoWFn();
            } catch (e) {
                return generateAlert('error', t('pow:noWebGLSupport'), t('pow:noWebGLSupportExplanation'));
            }
        }

        // we aren't using the taskRunner here because you can't pass in powFn since it's a function
        this.props.completeSnapshotTransition(seed, selectedAccountName, transitionAddresses, powFn);
    };

    /**
     * rigger snapshot transition
     * @returns {Promise}
     */
    transitionBalanceWrong = async () => {
        this.props.setBalanceCheckFlag(false);
        const { wallet, transitionAddresses, selectedAccountName } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);
        const currentIndex = transitionAddresses.length;
        runTask('generateAddressesAndGetBalance', [seed, currentIndex, null]);
    };

    render() {
        const {
            remotePoW,
            autoPromotion,
            changePowSettings,
            changeAutoPromotionSettings,
            lockScreenTimeout,
            ui,
            t,
        } = this.props;

        // snapshot transition
        const { isTransitioning, isAttachingToTangle, isModalActive, transitionBalance } = this.props;
        const { resetConfirm } = this.state;

        if ((isTransitioning || isAttachingToTangle) && !isModalActive) {
            return (
                <Loading
                    loop
                    transparent={false}
                    title={t('advancedSettings:snapshotTransition')}
                    subtitle={
                        <React.Fragment>
                            {!isAttachingToTangle ? (
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
                    <h3>{t('pow:powUpdated')}</h3>
                    <Toggle
                        checked={remotePoW}
                        onChange={() => changePowSettings()}
                        on={t('pow:remote')}
                        off={t('pow:local')}
                    />
                    <p>
                        {t('pow:feeless')} {t('pow:localOrRemote')}
                    </p>
                    <hr />

                    <h3>{t('advancedSettings:autoPromotion')}</h3>
                    <Toggle
                        checked={autoPromotion}
                        onChange={() => changeAutoPromotionSettings()}
                        on={t('enabled')}
                        off={t('disabled')}
                    />
                    <p>{t('advancedSettings:autoPromotionExplanation')}</p>
                    <hr />

                    <h3>{t('advancedSettings:snapshotTransition')}</h3>
                    <p>
                        {t('snapshotTransition:snapshotExplanation')} <br />
                        {t('snapshotTransition:hasSnapshotTakenPlace')}
                    </p>
                    <Button
                        className="small"
                        onClick={this.startSnapshotTransition}
                        loading={isTransitioning || isAttachingToTangle}
                    >
                        {t('snapshotTransition:transition')}
                    </Button>
                    <ModalConfirm
                        isOpen={isModalActive}
                        category="primary"
                        onConfirm={this.transitionBalanceOk}
                        onCancel={this.transitionBalanceWrong}
                        content={{
                            title: t('snapshotTransition:detectedBalance', {
                                amount: round(formatValue(transitionBalance), 1),
                                unit: formatUnit(transitionBalance),
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
                        disabled={isTransitioning || isAttachingToTangle}
                    >
                        {t('manualSync:syncAccount')}
                    </Button>
                    <hr />

                    <TextInput
                        value={lockScreenTimeout.toString()}
                        label={t('settings:lockScreenTimeout')}
                        onChange={this.changeLockScreenTimeout}
                    />
                    <hr />

                    <h3>{t('settings:reset')}</h3>
                    <Trans i18nKey="walletResetConfirmation:warning">
                        <p>
                            <React.Fragment>All of your wallet data including your </React.Fragment>
                            <strong>seeds, password,</strong>
                            <React.Fragment>and </React.Fragment>
                            <strong>other account information</strong>
                            <React.Fragment> will be lost.</React.Fragment>
                        </p>
                    </Trans>
                    <Button
                        className="small"
                        onClick={() => this.setState({ resetConfirm: !resetConfirm })}
                        variant="negative"
                    >
                        {t('settings:reset')}
                    </Button>
                    <ModalPassword
                        isOpen={resetConfirm}
                        category="negative"
                        onSuccess={(password) => this.resetWallet(password)}
                        onClose={() => this.setState({ resetConfirm: false })}
                        content={{
                            title: t('walletResetConfirmation:cannotUndo'),
                            message: (
                                <Trans i18nKey="walletResetConfirmation:warning">
                                    <React.Fragment>
                                        <React.Fragment>All of your wallet data including your </React.Fragment>
                                        <strong>seeds, password,</strong>
                                        <React.Fragment>and </React.Fragment>
                                        <strong>other account information</strong>
                                        <React.Fragment> will be lost.</React.Fragment>
                                    </React.Fragment>
                                </Trans>
                            ),
                            confirm: t('settings:reset'),
                        }}
                    />
                </Scrollbar>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    remotePoW: state.settings.remotePoW,
    autoPromotion: state.settings.autoPromotion,
    wallet: state.wallet,
    ui: state.ui,
    selectedAccountName: getSelectedAccountName(state),
    addresses: getAddressesForSelectedAccount(state),
    settings: state.settings,
    lockScreenTimeout: state.settings.lockScreenTimeout,
    transitionBalance: state.wallet.transitionBalance,
    balanceCheckFlag: state.wallet.balanceCheckFlag,
    transitionAddresses: state.wallet.transitionAddresses,
    isAttachingToTangle: state.ui.isAttachingToTangle,
    isTransitioning: state.ui.isTransitioning,
    isModalActive: state.ui.isModalActive,
});

const mapDispatchToProps = {
    generateAlert,
    changePowSettings,
    changeAutoPromotionSettings,
    setLockScreenTimeout,
    toggleModalActivity,
    completeSnapshotTransition,
    setBalanceCheckFlag,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Advanced));
