/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { clearVault } from 'libs/crypto';
import { getEncryptionKey } from 'libs/realm';
import { ALIAS_REALM } from 'libs/constants';

import {
    changePowSettings,
    changeAutoPromotionSettings,
    changeDeepLinkingSettings,
    setLockScreenTimeout,
    setTray,
    setNotifications,
    setProxy,
} from 'actions/settings';

import { generateAlert } from 'actions/alerts';

import { reinitialise as reinitialiseStorage } from 'storage';

import Button from 'ui/components/Button';
import Confirm from 'ui/components/modal/Confirm';
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
        settings: PropTypes.object.isRequired,
        /** @ignore */
        wallet: PropTypes.object,
        /** @ignore */
        setTray: PropTypes.func.isRequired,
        /** @ignore */
        setProxy: PropTypes.func.isRequired,
        /** @ignore */
        setNotifications: PropTypes.func.isRequired,
        /** @ignore */
        changePowSettings: PropTypes.func.isRequired,
        /** @ignore */
        changeAutoPromotionSettings: PropTypes.func.isRequired,
        /** @ignore */
        changeDeepLinkingSettings: PropTypes.func.isRequired,
        /** @ignore */
        setLockScreenTimeout: PropTypes.func.isRequired,
        /** @ignore */
        lockScreenTimeout: PropTypes.number.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        resetConfirm: false,
        resetCountdown: 0,
    };

    componentWillUnmount() {
        if (this.interval) {
            clearInterval(this.interval);
        }
    }

    /**
     * Enable/disable global system proxy bypass
     * @returns {undefined}
     */
    setProxy = () => {
        const enabled = !this.props.settings.ignoreProxy;
        Electron.setStorage('ignore-proxy', enabled);
        this.props.setProxy(enabled);
    };

    /**
     * Enable/disable Tray application
     * @returns {undefined}
     */
    setTray = () => {
        const enabled = !this.props.settings.isTrayEnabled;
        Electron.setTray(enabled);
        this.props.setTray(enabled);
    };

    /**
     * Hard reset wallet
     * @returns {undefined}
     */
    resetWallet = async () => {
        const { t, generateAlert } = this.props;

        try {
            await clearVault(ALIAS_REALM);
            localStorage.clear();
            Electron.clearStorage();

            await reinitialiseStorage(getEncryptionKey);

            Electron.reload();
        } catch (_err) {
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

    confirmReset = () => {
        const { wallet } = this.props;

        this.setState((prevState) => ({ resetConfirm: !prevState.resetConfirm, resetCountdown: 15 }));

        if (!wallet || !wallet.isOpen) {
            this.interval = setInterval(() => {
                if (this.state.resetCountdown === 1) {
                    clearInterval(this.interval);
                }

                this.setState((prevState) => ({
                    resetCountdown: prevState.resetCountdown - 1,
                }));
            }, 1000);
        }
    };

    render() {
        const {
            settings,
            wallet,
            changePowSettings,
            changeAutoPromotionSettings,
            changeDeepLinkingSettings,
            lockScreenTimeout,
            setNotifications,
            t,
        } = this.props;

        const { resetConfirm, resetCountdown } = this.state;

        return (
            <div className={css.scroll}>
                <Scrollbar>
                    <article>
                        <React.Fragment>
                            <h3>{t('advancedSettings:deepLinking')}</h3>
                            <Toggle
                                checked={settings.deepLinking}
                                onChange={() => changeDeepLinkingSettings()}
                                on={t('enabled')}
                                off={t('disabled')}
                            />
                            <p>{t('deepLink:deepLinkingOverview')}</p>
                            <p>{t('deepLink:deepLinkingWarning')}</p>
                            <hr />
                        </React.Fragment>

                        {wallet && wallet.ready ? (
                            <React.Fragment>
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

                                {Electron.getOS() === 'darwin' && (
                                    <React.Fragment>
                                        <h3>{t('tray:trayApplication')}</h3>
                                        <Toggle
                                            checked={settings.isTrayEnabled}
                                            onChange={this.setTray}
                                            on={t('enabled')}
                                            off={t('disabled')}
                                        />
                                        <p>{t('tray:trayExplanation')}</p>
                                        <hr />
                                    </React.Fragment>
                                )}

                                <h3>{t('notifications:notifications')}</h3>
                                <Toggle
                                    checked={settings.notifications.general}
                                    onChange={() =>
                                        setNotifications({ type: 'general', enabled: !settings.notifications.general })
                                    }
                                    on={t('enabled')}
                                    off={t('disabled')}
                                />
                                <Checkbox
                                    disabled={!settings.notifications.general}
                                    checked={settings.notifications.confirmations}
                                    label={t('notifications:typeConfirmations')}
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
                            </React.Fragment>
                        ) : null}

                        <React.Fragment>
                            <h3>{t('proxy:proxy')}</h3>
                            <Toggle
                                checked={!settings.ignoreProxy}
                                onChange={this.setProxy}
                                on={t('enabled')}
                                off={t('disabled')}
                            />
                            <p>{t('proxy:proxyExplanation')}</p>
                            <hr />
                        </React.Fragment>

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
                        <Button className="small" onClick={this.confirmReset} variant="negative">
                            {t('settings:reset')}
                        </Button>
                        {wallet && wallet.ready ? (
                            <ModalPassword
                                isOpen={resetConfirm}
                                category="negative"
                                onSuccess={() => this.resetWallet()}
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
                        ) : (
                            <Confirm
                                isOpen={resetConfirm}
                                category="negative"
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
                                    cancel: t('cancel'),
                                    confirm: t('settings:reset'),
                                }}
                                onCancel={() => this.setState({ resetConfirm: false })}
                                countdown={resetCountdown}
                                onConfirm={() => this.resetWallet()}
                            />
                        )}
                    </article>
                </Scrollbar>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    settings: state.settings,
    wallet: state.wallet,
    lockScreenTimeout: state.settings.lockScreenTimeout,
});

const mapDispatchToProps = {
    generateAlert,
    changePowSettings,
    changeAutoPromotionSettings,
    changeDeepLinkingSettings,
    setLockScreenTimeout,
    setTray,
    setNotifications,
    setProxy,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Advanced));
