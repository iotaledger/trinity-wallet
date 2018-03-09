import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';
import { getVault } from 'libs/crypto';

import Password from 'ui/components/input/Password';
import Button from 'ui/components/Button';
import Modal from 'ui/components/modal/Modal';

/**
 * Advaned user settings component, icnluding - wallet reset
 */
class Advanced extends PureComponent {
    static propTypes = {
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
        password: '',
    };

    resetWallet = (e) => {
        const { password } = this.state;
        const { t, generateAlert } = this.props;

        e.preventDefault();

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
        const { t } = this.props;
        const { resetConfirm, password } = this.state;

        return (
            <div>
                <Button onClick={() => this.setState({ resetConfirm: !resetConfirm, password: '' })}>
                    {t('settings:reset')}
                </Button>
                <Modal variant="confirm" isOpen={resetConfirm} onClose={() => this.setState({ resetConfirm: false })}>
                    <h1 className="error">{t('walletResetConfirmation:cannotUndo')}</h1>

                    <Trans i18nKey="walletResetConfirmation:warning">
                        <p>
                            All of your wallet data including your <strong>seeds, password,</strong> and{' '}
                            <strong>other account information</strong>
                        </p>
                    </Trans>

                    <p>{t('resetWalletRequirePassword:enterPassword')}</p>

                    <form onSubmit={(e) => this.resetWallet(e)}>
                        <Password
                            value={password}
                            label={t('global:password')}
                            onChange={(value) => this.setState({ password: value })}
                        />
                        <Button
                            type="reset"
                            onClick={() => {
                                this.setState({ resetConfirm: false });
                            }}
                            variant="secondary"
                        >
                            {t('resetWalletRequirePassword:cancel')}
                        </Button>
                        <Button type="submit" variant="negative">
                            {t('resetWalletRequirePassword:reset')}
                        </Button>
                    </form>
                </Modal>
            </div>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    generateAlert,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(Advanced));
