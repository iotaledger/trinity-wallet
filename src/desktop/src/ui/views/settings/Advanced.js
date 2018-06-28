/*global Electron*/
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { changePowSettings, changeAutoPromotionSettings, setLockScreenTimeout } from 'actions/settings';
import { completeSnapshotTransition } from 'actions/wallet';
import { generateAlert } from 'actions/alerts';

import { setSeed, getSeed } from 'libs/crypto';
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
import Info from 'ui/components/Info';
import Scrollbar from 'ui/components/Scrollbar';

/**
 * Advanced user settings component, including - wallet reset
 */
class Advanced extends PureComponent {
    static propTypes = {
        /** RemotePow PoW enable state */
        remotePoW: PropTypes.bool.isRequired,
        /** Auto-promotion enable state */
        autoPromotion: PropTypes.bool.isRequired,
        /** Update remote PoW settings state
         * @ignore
         */
        changePowSettings: PropTypes.func.isRequired,
        /** Update auto-promotion settings state
         * @ignore
         */
        changeAutoPromotionSettings: PropTypes.func.isRequired,
        /**
         * Update the lock screen timeout state
         * @ignore
         */
        setLockScreenTimeout: PropTypes.func.isRequired,
        /**
         * Lock screen timeout
         * @ignore
         */
        lockScreenTimeout: PropTypes.number.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {String} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
        /** Current wallet settings
         */
        settings: PropTypes.object.isRequired,
        /** Current wallet state
         */
        wallet: PropTypes.object.isRequired,
        /** Current ui state
         */
        ui: PropTypes.object.isRequired,
        /** Is the wallet transitioning
         */
        isTransitioning: PropTypes.bool.isRequired,
        /** The balance computed from the transition addresses
         */
        transitionBalance: PropTypes.number.isRequired,
        /** The transition addresses
         */
        transitionAddresses: PropTypes.array.isRequired,
        /**
         * Is the wallet attaching the snapshot transition addresses
         * to the Tangle?
         */
        isAttachingToTangle: PropTypes.bool.isRequired,
        /** Is the balance check modal open?
         */
        isModalActive: PropTypes.bool.isRequired,
        /** Show/hide the balance check modal
         */
        toggleModalActivity: PropTypes.func.isRequired,
        /** Whether to toggle the balance check modal
         */
        balanceCheckToggle: PropTypes.bool.isRequired,
        /** Currently selected account name */
        selectedAccountName: PropTypes.string.isRequired,
        /** Function to complete the snapshot transition
         */
        completeSnapshotTransition: PropTypes.func.isRequired,
    };

    state = {
        resetConfirm: false,
    };

    componentWillReceiveProps(newProps) {
        const { balanceCheckToggle } = this.props;
        if (balanceCheckToggle !== newProps.balanceCheckToggle) {
            this.props.toggleModalActivity();
            return;
        }

        const { isTransitioning, isAttachingToTangle, isModalActive } = newProps;
        if (isTransitioning || isAttachingToTangle || isModalActive) {
            Electron.disableMenu();
        } else {
            Electron.enableMenu();
        }
    }

    resetWallet = async (password) => {
        const { t, generateAlert } = this.props;

        try {
            await setSeed(password, '', [], true);
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

    changeLockScreenTimeout = (value) => {
        const timeout = Math.abs(parseInt(value)) || 1;
        this.props.setLockScreenTimeout(timeout > 60 ? 60 : timeout);
    };

    syncAccount = async () => {
        const { wallet, selectedAccountName } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);
        runTask('manuallySyncAccount', [seed, selectedAccountName]);
    };

    startSnapshotTransition = async () => {
        const { wallet, addresses, selectedAccountName } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);
        runTask('transitionForSnapshot', [seed, addresses]);
    };

    transitionBalanceOk = async () => {
        this.props.toggleModalActivity();
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

    transitionBalanceWrong = async () => {
        this.props.toggleModalActivity();
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
                    <Info>
                        {t('pow:feeless')} <br />
                        {t('pow:localOrRemote')}
                    </Info>
                    <Toggle
                        checked={remotePoW}
                        onChange={() => changePowSettings()}
                        on={t('pow:remote')}
                        off={t('pow:local')}
                    />
                    <hr />

                    <h3>{t('advancedSettings:autoPromotion')}</h3>
                    <Info>{t('advancedSettings:autoPromotionExplanation')}</Info>
                    <Toggle
                        checked={autoPromotion}
                        onChange={() => changeAutoPromotionSettings()}
                        on={t('enabled')}
                        off={t('disabled')}
                    />
                    <hr />

                    <h3>{t('advancedSettings:snapshotTransition')}</h3>
                    <Info>
                        {t('snapshotTransition:snapshotExplanation')} <br />
                        {t('snapshotTransition:hasSnapshotTakenPlace')}
                    </Info>
                    <Button onClick={this.startSnapshotTransition} loading={isTransitioning || isAttachingToTangle}>
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

                    <br />
                    <br />

                    <h3>{t('advancedSettings:manualSync')}</h3>
                    {ui.isSyncing ? (
                        <Info>
                            {t('manualSync:syncingYourAccount')} <br />
                            {t('manualSync:thisMayTake')}
                        </Info>
                    ) : (
                        <Info>
                            {t('manualSync:outOfSync')} <br />
                            {t('manualSync:pressToSync')}
                        </Info>
                    )}
                    <Button
                        onClick={this.syncAccount}
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
                        <Info>
                            <React.Fragment>All of your wallet data including your </React.Fragment>
                            <strong>seeds, password,</strong>
                            <React.Fragment>and </React.Fragment>
                            <strong>other account information</strong>
                            <React.Fragment> will be lost.</React.Fragment>
                        </Info>
                    </Trans>
                    <Button onClick={() => this.setState({ resetConfirm: !resetConfirm })} variant="negative">
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
    balanceCheckToggle: state.wallet.balanceCheckToggle,
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
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Advanced));
