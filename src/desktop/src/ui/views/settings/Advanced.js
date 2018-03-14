import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { updatePowSettings } from 'actions/settings';
import { generateAlert } from 'actions/alerts';
import { getVault } from 'libs/crypto';

import Button from 'ui/components/Button';
import ModalPassword from 'ui/components/modal/Password';
import Checkbox from 'ui/components/Checkbox';

/**
 * Advaned user settings component, icnluding - wallet reset
 */
class Advanced extends PureComponent {
    static propTypes = {
        /** RemotePow PoW enable state */
        remotePoW: PropTypes.bool.isRequired,
        /** Update remote PoW settings state
         * @ignore
         */
        updatePowSettings: PropTypes.func.isRequired,
        /** Update local PoW settings state
         * @param {Bool} state - Error notification content
         * @ignore
         */

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
    };

    state = {
        resetConfirm: false,
    };

    resetWallet = (password) => {
        const { t, generateAlert } = this.props;

        try {
            getVault(password);
            localStorage.clear();
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

    render() {
        const { remotePoW, updatePowSettings, t } = this.props;
        const { resetConfirm } = this.state;

        return (
            <div>
                <Checkbox checked={remotePoW} onChange={() => updatePowSettings()} label="Do PoW remotely" />
                <hr />
                <Button onClick={() => this.setState({ resetConfirm: !resetConfirm })} variant="negative">
                    {t('settings:reset')}
                </Button>
                <ModalPassword
                    isOpen={resetConfirm}
                    category="negative"
                    onSucces={(password) => this.resetWallet(password)}
                    onClose={() => this.setState({ resetConfirm: false })}
                    content={{
                        title: t('walletResetConfirmation:cannotUndo'),
                        message: (
                            <Trans i18nKey="walletResetConfirmation:warning">
                                <React.Fragment>
                                    All of your wallet data including your <strong>seeds, password,</strong> and{' '}
                                    <strong>other account information</strong>
                                </React.Fragment>
                            </Trans>
                        ),
                        confirm: t('settings:reset'),
                    }}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    remotePoW: state.settings.remotePoW,
});

const mapDispatchToProps = {
    generateAlert,
    updatePowSettings,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Advanced));
