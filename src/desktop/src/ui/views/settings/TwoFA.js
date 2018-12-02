import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';
import QRCode from 'qr.js/lib/QRCode';
import authenticator from 'authenticator';

import { setTwoFA, authorize } from 'libs/crypto';

import { set2FAStatus } from 'actions/settings';
import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';
import Text from 'ui/components/input/Text';
import Password from 'ui/components/modal/Password';
import Clipboard from 'ui/components/Clipboard';

import css from './twoFa.scss';

/**
 * Two-factor authentication settings container
 */
class TwoFA extends React.Component {
    static propTypes = {
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        is2FAEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        set2FAStatus: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
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

    /**
     * Update 2fa code value and trigger authentication once necessary length is reached
     * @param {string} value - Code value
     */
    setCode = (value) => {
        const { is2FAEnabled } = this.props;
        this.setState({ code: value }, () => {
            if (value.length !== 6) {
                return;
            } else if (is2FAEnabled) {
                this.disableTwoFA();
            } else {
                this.verifyCode();
            }
        });
    };

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
            this.setState({
                code: '',
            });
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

            generateAlert('success', t('twoFA:twoFAEnabled'), t('twoFA:twoFAEnabledExplanation'));
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
            const key = await authorize(password);
            const validCode = authenticator.verifyToken(key, code);

            if (!validCode) {
                generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
                this.setState({
                    passwordConfirm: false,
                    code: '',
                });
                return;
            }

            setTwoFA(password, null);
            set2FAStatus(false);

            this.setState({
                key: authenticator.generateKey(),
                code: '',
                passwordConfirm: false,
            });

            generateAlert('success', t('twoFA:twoFADisabled'), t('twoFA:twoFADisabledExplanation'));
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
                <h3>{t('twoFA:enterCode')}</h3>
                <Text value={code} label={t('twoFA:code')} onChange={this.setCode} />
                <fieldset>
                    <Button type="submit" variant="primary">
                        {t('disable')}
                    </Button>
                </fieldset>
            </form>
        );
    }

    enableTwoFAview() {
        const { key, code } = this.state;
        const { t } = this.props;

        if (!key) {
            return null;
        }

        const qr = new QRCode(-1, 1);

        qr.addData(authenticator.generateTotpUri(key, 'Trinity desktop wallet'));
        qr.make();

        const cells = qr.modules;

        return (
            <form className={css.twoFa} onSubmit={(e) => this.verifyCode(e)}>
                <h3>1. {t('twoFA:addKey')}</h3>
                <svg width="160" height="160" viewBox={`0 0 ${cells.length} ${cells.length}`}>
                    {cells.map((row, rowIndex) => {
                        return row.map((cell, cellIndex) => (
                            <rect
                                height={1}
                                key={cellIndex}
                                style={{ fill: cell ? '#000000' : 'none' }}
                                width={1}
                                x={cellIndex}
                                y={rowIndex}
                            />
                        ));
                    })}
                </svg>
                <small>
                    {t('twoFA:key')}:{' '}
                    <Clipboard text={key} title={t('twoFA:keyCopied')} success={t('twoFA:keyCopiedExplanation')}>
                        <strong>{key}</strong>
                    </Clipboard>
                </small>
                <hr />
                <h3>2. {t('twoFA:enterCode')}</h3>
                <Text value={code} onChange={this.setCode} />
                <fieldset>
                    <Button type="submit" disabled={code.length < 6} variant="primary">
                        {t('apply')}
                    </Button>
                </fieldset>
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
                        title: t('enterPassword'),
                        confirm: is2FAEnabled ? t('disable') : t('enable'),
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

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(TwoFA));
