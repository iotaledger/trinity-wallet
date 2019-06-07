/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { connect } from 'react-redux';

import { hash, authorize } from 'libs/crypto';

import { generateAlert } from 'actions/alerts';

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
        /** Determines whether user is entering SeedVault key */
        isSeedVaultField: PropTypes.bool,
    };

    static defaultProps = {
        isSeedVaultField: false,
    };

    state = {
        password: '',
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

    handleSubmit = async (e) => {
        const { password } = this.state;
        const { onSuccess, onSubmit, generateAlert, t } = this.props;

        if (e) {
            e.preventDefault();
        }

        if (onSubmit) {
            return onSubmit(password);
        }

        const passwordHash = await hash(password);

        try {
            await authorize(passwordHash);
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
        const { content, category, isOpen, isForced, onClose, t, isSeedVaultField } = this.props;
        const { password } = this.state;
        return (
            <React.Fragment>
                {content.title ? <h1 className={category ? category : null}>{content.title}</h1> : null}
                {content.message ? <p>{content.message}</p> : null}
                <form onSubmit={(e) => this.handleSubmit(e)}>
                    <Password
                        value={password}
                        focus={isOpen}
                        label={isSeedVaultField ? t('seedVault:key') : t('password')}
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

    render() {
        const { isOpen, isForced, inline, onClose } = this.props;

        return (
            <Modal variant="confirm" isOpen={isOpen} inline={inline} isForced={isForced} onClose={() => onClose()}>
                {this.passwordContent()}
            </Modal>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

export default connect(
    null,
    mapDispatchToProps,
)(withTranslation()(ModalPassword));
