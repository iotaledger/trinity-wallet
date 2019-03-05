/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import authenticator from 'authenticator';

import { hash, authorize } from 'libs/crypto';

import { generateAlert } from 'actions/alerts';

import Text from 'ui/components/input/Text';
import Password from 'ui/components/input/Password';
import Button from 'ui/components/Button';
import Modal from 'ui/components/modal/Modal';

/**
 * Password confirmation dialog component
 */

class ModalPassword extends PureComponent {
    static propTypes = {
        /** Password window content */
        content: PropTypes.object.isRequired,
        /** Password window type */
        category: PropTypes.oneOf(['primary', 'secondary', 'positive', 'negative', 'highlight', 'extra']),
        /** Dialog visibility state */
        isOpen: PropTypes.bool,
        /** Should the dialog be without a cancel option */
        isForced: PropTypes.bool,
        /** Should 2fa authorisation be skipped */
        skip2fa: PropTypes.bool,
        /** Modal inline style state */
        inline: PropTypes.bool,
        /** On dialog close event */
        onClose: PropTypes.func,
        /** On correct password entered event
         * @param {string} Password - Entered password plain text
         * @param {object} SeedStore - SeedStore content
         */
        onSuccess: PropTypes.func,
        /** On password entered event callback
         */
        onSubmit: PropTypes.func,
        /** Create a notification message
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        password: '',
        code: '',
        verifyTwoFA: false,
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.isOpen !== nextProps.isOpen) {
            this.setState({
                password: '',
            });
        }
    }

    componentWillUnmount() {
        setTimeout(() => Electron.garbageCollect(), 1000);
    }

    /**
     * Update 2fa code value and trigger authentication once necessary length is reached
     * @param {string} value - Code value
     */
    setCode = (value) => {
        this.setState({ code: value }, () => value.length === 6 && this.handleSubmit());
    };

    handleSubmit = async (e) => {
        const { password, code, verifyTwoFA } = this.state;
        const { skip2fa, onSuccess, onSubmit, generateAlert, t } = this.props;

        if (e) {
            e.preventDefault();
        }

        if (onSubmit) {
            return onSubmit(password);
        }

        let authorised = false;

        const passwordHash = await hash(password);

        try {
            authorised = await authorize(passwordHash);

            if (!skip2fa && typeof authorised === 'string' && !authenticator.verifyToken(authorised, code)) {
                if (verifyTwoFA) {
                    generateAlert('error', t('twoFA:wrongCode'), t('twoFA:wrongCodeExplanation'));
                }

                this.setState({
                    verifyTwoFA: true,
                    code: '',
                });

                return;
            }
        } catch (err) {
            generateAlert(
                'error',
                t('changePassword:incorrectPassword'),
                t('changePassword:incorrectPasswordExplanation'),
            );
            return;
        }

        onSuccess(passwordHash);
    };

    passwordContent = () => {
        const { content, category, isOpen, isForced, onClose, t } = this.props;
        const { password } = this.state;
        return (
            <React.Fragment>
                {content.title ? <h1 className={category ? category : null}>{content.title}</h1> : null}
                {content.message ? <p>{content.message}</p> : null}
                <form onSubmit={(e) => this.handleSubmit(e)}>
                    <Password
                        value={password}
                        focus={isOpen}
                        label={t('password')}
                        onChange={(value) => this.setState({ password: value })}
                    />
                    <footer>
                        {!isForced && (
                            <Button onClick={() => onClose()} variant="dark">
                                {t('cancel')}
                            </Button>
                        )}
                        <Button type="submit" variant={category ? category : 'primary'}>
                            {content.confirm ? content.confirm : t('login:login')}
                        </Button>
                    </footer>
                </form>
            </React.Fragment>
        );
    };

    twoFaContent = () => {
        const { isForced, onClose, t } = this.props;
        const { code } = this.state;
        return (
            <React.Fragment>
                <p>{t('twoFA:enterCode')}</p>
                <form onSubmit={(e) => this.handleSubmit(e)}>
                    <Text value={code} focus label={t('twoFA:code')} onChange={this.setCode} />
                    <footer>
                        {!isForced && (
                            <Button onClick={() => onClose()} variant="dark">
                                {t('cancel')}
                            </Button>
                        )}
                        <Button type="submit" variant="primary">
                            {t('login:login')}
                        </Button>
                    </footer>
                </form>
            </React.Fragment>
        );
    };

    render() {
        const { isOpen, isForced, inline, onClose } = this.props;
        const { verifyTwoFA } = this.state;

        return (
            <Modal variant="confirm" isOpen={isOpen} inline={inline} isForced={isForced} onClose={() => onClose()}>
                {verifyTwoFA ? this.twoFaContent() : this.passwordContent()}
            </Modal>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

export default connect(null, mapDispatchToProps)(withTranslation()(ModalPassword));
