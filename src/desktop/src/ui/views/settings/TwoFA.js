import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import QRCode from 'qrcode.react';
import authenticator from 'authenticator';

import { getTwoFA, setTwoFA, removeTwoFA } from 'libs/crypto';

import { set2FAStatus } from 'actions/settings';
import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';
import Text from 'ui/components/input/Text';
import Password from 'ui/components/modal/Password';
import Clipboard from 'ui/components/Clipboard';

import css from './twoFa.css';

/**
 * Two-factor authentication settings container
 */
class TwoFA extends React.Component {
    static propTypes = {
        /** Current account password */
        password: PropTypes.string.isRequired,
        /** Is two-factor authentication enabled */
        is2FAEnabled: PropTypes.bool.isRequired,
        /** Set two-factor authentication enabled state
         * @param {Bool} state - Two-factor enabled state
         */
        set2FAStatus: PropTypes.func.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            key: authenticator.generateKey(),
            code: '',
            passwordConfirm: false,
        };
    }

    verifyCode(e) {
        const { key, code } = this.state;
        const { generateAlert, t } = this.props;

        if (e) {
            e.preventDefault();
        }

        const validCode = authenticator.verifyToken(key, code);

        if (validCode) {
            this.setState({
                passwordConfirm: true,
            });
        } else {
            generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
        }
    }

    enableTwoFA(password) {
        const { key } = this.state;
        const { generateAlert, set2FAStatus, t } = this.props;

        try {
            setTwoFA(password, key);
            set2FAStatus(true);

            this.setState({
                key: '',
                code: '',
                passwordConfirm: false,
            });

            generateAlert('success', t('twoFA:twoFAEnabled'), t('twoFA:twoFAEnabledExplanation§'));
        } catch (err) {
            generateAlert(
                'error',
                t('changePassword:incorrectPassword'),
                t('changePassword:incorrectPasswordExplanation'),
            );
            return;
        }
    }

    disableTwoFA = async () => {
        const { code } = this.state;
        const { password, generateAlert, set2FAStatus, t } = this.props;

        try {
            const key = await getTwoFA(password);
            const validCode = authenticator.verifyToken(key, code);

            if (!validCode) {
                generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
                this.setState({
                    passwordConfirm: false,
                });
                return;
            }

            removeTwoFA(password, key);
            set2FAStatus(false);

            this.setState({
                key: authenticator.generateKey(),
                code: '',
                passwordConfirm: false,
            });

            generateAlert('success', t('Two fa disabled'), t('Two fa disabled'));
        } catch (err) {
            generateAlert(
                'error',
                t('changePassword:incorrectPassword'),
                t('changePassword:incorrectPasswordExplanation'),
            );
            return;
        }
    };

    disableTwoFAview() {
        const { code } = this.state;
        const { t } = this.props;
        return (
            <form
                className={css.twoFa}
                onSubmit={(e) => {
                    e.preventDefault();
                    this.disableTwoFA();
                }}
            >
                <h2>{t('To disable, enter code')}</h2>
                <Text value={code} label={t('twoFA:code')} onChange={(value) => this.setState({ code: value })} />
                <Button type="submit" variant="primary">
                    {t('twoFA:disable')}
                </Button>
            </form>
        );
    }

    enableTwoFAview() {
        const { key, code } = this.state;
        const { t } = this.props;

        if (!key) {
            return null;
        }

        return (
            <form className={css.twoFa} onSubmit={(e) => this.verifyCode(e)}>
                <h2>{t('twoFA:addKey')}</h2>
                <QRCode size={180} value={authenticator.generateTotpUri(key, 'Trinity desktop wallet')} />
                <p>
                    {t('twoFA:key')}:{' '}
                    <Clipboard text={key} title={t('twoFA:keyCopied')} success={t('twoFA:keyCopiedExplanation')}>
                        <strong>{key}</strong>
                    </Clipboard>
                </p>
                <hr />
                <h2>{t('twoFA:enterCode')}:</h2>
                <Text value={code} onChange={(value) => this.setState({ code: value })} />
                <Button type="submit" variant="primary">
                    {t('apply')}
                </Button>
            </form>
        );
    }

    render() {
        const { passwordConfirm } = this.state;
        const { is2FAEnabled, t } = this.props;

        return (
            <React.Fragment>
                {is2FAEnabled ? this.disableTwoFAview() : this.enableTwoFAview()}
                <Password
                    isOpen={passwordConfirm}
                    onSuccess={(password) => this.enableTwoFA(password)}
                    onClose={() => this.setState({ passwordConfirm: false })}
                    content={{
                        title: is2FAEnabled
                            ? t('Enter your password to disable Two-factor authentication')
                            : t('Enter your password to enable Two-factor authentication'),
                        confirm: is2FAEnabled ? t('Disable') : t('Enable'),
                    }}
                />
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    is2FAEnabled: state.settings.is2FAEnabled,
    password: state.wallet.password,
});

const mapDispatchToProps = {
    set2FAStatus,
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(TwoFA));
