/*global Electron*/
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { updatePowSettings, setLockScreenTimeout } from 'actions/settings';
import { generateAlert } from 'actions/alerts';
import { setVault, getSeed } from 'libs/crypto';

import { runTask } from 'worker';

import Button from 'ui/components/Button';
import ModalPassword from 'ui/components/modal/Password';
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
        /** Update remote PoW settings state
         * @ignore
         */
        updatePowSettings: PropTypes.func.isRequired,
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
        /** Current account state
         */
        accounts: PropTypes.object.isRequired,
        /** Current wallet state
         */
        wallet: PropTypes.object.isRequired,
        /** Current ui state
         */
        ui: PropTypes.object.isRequired,
    };

    state = {
        resetConfirm: false,
    };

    resetWallet = async (password) => {
        const { t, generateAlert } = this.props;

        try {
            await setVault(password, {}, true);
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
        const { wallet, accounts } = this.props;
        const seed = await getSeed(wallet.seedIndex, wallet.password);
        runTask('manuallySyncAccount', [seed, accounts.accountNames[wallet.seedIndex]]);
    };

    render() {
        const { remotePoW, updatePowSettings, lockScreenTimeout, ui, t } = this.props;
        const { resetConfirm } = this.state;

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
                        onChange={() => updatePowSettings()}
                        on={t('pow:remote')}
                        off={t('pow:local')}
                    />
                    <hr />
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
                    <Button onClick={this.syncAccount} loading={ui.isSyncing}>
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
    accounts: state.accounts,
    wallet: state.wallet,
    ui: state.ui,
    lockScreenTimeout: state.settings.lockScreenTimeout,
});

const mapDispatchToProps = {
    generateAlert,
    updatePowSettings,
    setLockScreenTimeout,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Advanced));
