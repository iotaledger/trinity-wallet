/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';

<<<<<<< HEAD
import { clearVault, getSeed } from 'libs/crypto';
import { formatValue, formatUnit } from 'libs/iota/utils';
import { round } from 'libs/utils';

import { manuallySyncAccount } from 'actions/accounts';
import {
    changePowSettings,
    changeAutoPromotionSettings,
    setLockScreenTimeout,
    setTray,
    setNotifications,
} from 'actions/settings';
import {
    transitionForSnapshot,
    completeSnapshotTransition,
    setBalanceCheckFlag,
    generateAddressesAndGetBalance,
} from 'actions/wallet';
import { generateAlert } from 'actions/alerts';
import { toggleModalActivity } from 'actions/ui';

import { getSelectedAccountName, getAddressesForSelectedAccount } from 'selectors/accounts';
=======
import { clearVault } from 'libs/crypto';

import {
    changePowSettings,
    changeAutoPromotionSettings,
    setLockScreenTimeout,
    setTray,
    setNotifications,
} from 'actions/settings';

import { generateAlert } from 'actions/alerts';
>>>>>>> develop

import Button from 'ui/components/Button';
import ModalPassword from 'ui/components/modal/Password';
import Toggle from 'ui/components/Toggle';
import Checkbox from 'ui/components/Checkbox';
import TextInput from 'ui/components/input/Text';
import Scrollbar from 'ui/components/Scrollbar';

import css from './index.scss';

/**
 * Advanced user settings component, including - wallet reset
 */
class Advanced extends PureComponent {
    static propTypes = {
        /** @ignore */
<<<<<<< HEAD
=======
        settings: PropTypes.object.isRequired,
        /** @ignore */
        setTray: PropTypes.func.isRequired,
        /** @ignore */
        setNotifications: PropTypes.func.isRequired,
        /** @ignore */
>>>>>>> develop
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
<<<<<<< HEAD
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
        /** @ignore */
        manuallySyncAccount: PropTypes.func.isRequired,
        /** @ignore */
        generateAddressesAndGetBalance: PropTypes.func.isRequired,
        /** @ignore */
        transitionForSnapshot: PropTypes.func.isRequired,
        /** @ignore */
        setTray: PropTypes.func.isRequired,
        /** @ignore */
        setNotifications: PropTypes.func.isRequired,
=======
>>>>>>> develop
    };

    state = {
        resetConfirm: false,
    };

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

<<<<<<< HEAD
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
        const { wallet, transitionAddresses, selectedAccountName, settings } = this.props;
        const seed = await getSeed(wallet.password, selectedAccountName, true);

        const powFn = !settings.remotePoW ? Electron.powFn : null;

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

        this.props.generateAddressesAndGetBalance(seed, currentIndex, Electron.genFn);
    };

=======
>>>>>>> develop
    render() {
        const {
            settings,
            changePowSettings,
            changeAutoPromotionSettings,
            lockScreenTimeout,
            setTray,
            setNotifications,
<<<<<<< HEAD
            ui,
=======
>>>>>>> develop
            t,
        } = this.props;

        const { resetConfirm } = this.state;

        return (
            <div className={css.scroll}>
                <Scrollbar>
                    <h3>{t('pow:powUpdated')}</h3>
                    <Toggle
                        checked={settings.remotePoW}
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
                        checked={settings.autoPromotion}
                        onChange={() => changeAutoPromotionSettings()}
                        on={t('enabled')}
                        off={t('disabled')}
                    />
                    <p>{t('advancedSettings:autoPromotionExplanation')}</p>
                    <hr />

<<<<<<< HEAD
                    <h3>{t('tray:trayApplication')}</h3>
                    <Toggle
                        checked={settings.isTrayEnabled}
                        onChange={() => setTray(!settings.isTrayEnabled)}
                        on={t('enabled')}
                        off={t('disabled')}
                    />
                    <p>{t('tray:trayExplanation')}</p>
                    <hr />
=======
                    {Electron.getOS() === 'darwin' && (
                        <React.Fragment>
                            <h3>{t('tray:trayApplication')}</h3>
                            <Toggle
                                checked={settings.isTrayEnabled}
                                onChange={() => setTray(!settings.isTrayEnabled)}
                                on={t('enabled')}
                                off={t('disabled')}
                            />
                            <p>{t('tray:trayExplanation')}</p>
                            <hr />
                        </React.Fragment>
                    )}
>>>>>>> develop

                    <h3>{t('notifications:notifications')}</h3>
                    <Toggle
                        checked={settings.notifications.general}
                        onChange={() => setNotifications({ type: 'general', enabled: !settings.notifications.general })}
                        on={t('enabled')}
                        off={t('disabled')}
                    />
                    <Checkbox
                        disabled={!settings.notifications.general}
                        checked={settings.notifications.confirmations}
                        label={t('notifications:typeConfirmations')}
<<<<<<< HEAD
                        className="small"
                        onChange={(value) => setNotifications({ type: 'confirmations', enabled: value })}
                    />
                    <Checkbox
                        disabled={!settings.notifications.general}
                        checked={settings.notifications.messages}
                        label={t('notifications:typeMessages')}
                        className="small"
                        onChange={(value) => setNotifications({ type: 'messages', enabled: value })}
                    />
                    <p>{t('notifications:notificationExplanation')}</p>
                    <hr />

                    <h3>{t('advancedSettings:snapshotTransition')}</h3>
                    <p>
                        {t('snapshotTransition:snapshotExplanation')} <br />
                        {t('snapshotTransition:hasSnapshotTakenPlace')}
                    </p>
                    <Button
=======
>>>>>>> develop
                        className="small"
                        onChange={(value) => setNotifications({ type: 'confirmations', enabled: value })}
                    />
                    <Checkbox
                        disabled={!settings.notifications.general}
                        checked={settings.notifications.messages}
                        label={t('notifications:typeMessages')}
                        className="small"
                        onChange={(value) => setNotifications({ type: 'messages', enabled: value })}
                    />
                    <p>{t('notifications:notificationExplanation')}</p>
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
<<<<<<< HEAD
    wallet: state.wallet,
    ui: state.ui,
    selectedAccountName: getSelectedAccountName(state),
    addresses: getAddressesForSelectedAccount(state),
=======
>>>>>>> develop
    settings: state.settings,
    lockScreenTimeout: state.settings.lockScreenTimeout,
});

const mapDispatchToProps = {
    generateAlert,
    changePowSettings,
    changeAutoPromotionSettings,
    setLockScreenTimeout,
<<<<<<< HEAD
    toggleModalActivity,
    completeSnapshotTransition,
    manuallySyncAccount,
    transitionForSnapshot,
    generateAddressesAndGetBalance,
    setBalanceCheckFlag,
=======
>>>>>>> develop
    setTray,
    setNotifications,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Advanced));
