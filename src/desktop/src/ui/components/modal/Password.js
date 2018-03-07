import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { showError } from 'actions/notifications';

import Password from 'ui/components/input/Password';
import Button from 'ui/components/Button';
import Modal from 'ui/components/modal/Modal';

import { getVault } from 'libs/crypto';

/**
 * Password confirmation dialog component
 */

class ModalPassword extends PureComponent {
    static propTypes = {
        /** Dialog title */
        title: PropTypes.string.isRequired,
        /** Dialog visibility state */
        isOpen: PropTypes.bool,
        /** Modal inline style state */
        inline: PropTypes.bool,
        /** On dialog close event */
        onClose: PropTypes.func.isRequired,
        /** On correct password entered event
         * @param {String} Password - Entered password plain text
         * @param {Object} Vault - Vault content
         */
        onSuccess: PropTypes.func.isRequired,
        /** Error helper function
         * @param {Object} content - Error notification content
         * @ignore
         */
        showError: PropTypes.func.isRequired,
        /** Translation helper
         * @param {String} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
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

    onSubmit(e) {
        const { password } = this.state;
        const { onSuccess, showError, t } = this.props;

        e.preventDefault();

        let vault = null;

        try {
            vault = getVault(password);
        } catch (err) {
            showError({
                title: t('changePassword:incorrectPassword'),
                text: t('changePassword:incorrectPasswordExplanation'),
            });
            return;
        }

        if (vault) {
            onSuccess(password, vault);
        }
    }

    render() {
        const { title, isOpen, inline, onClose, t } = this.props;
        const { password } = this.state;

        return (
            <Modal variant="confirm" inline={inline} isOpen={isOpen} onClose={() => onClose()}>
                <p>{title}</p>

                <form onSubmit={(e) => this.onSubmit(e)}>
                    <Password
                        value={password}
                        label={t('global:password')}
                        onChange={(value) => this.setState({ password: value })}
                    />
                    <fieldset>
                        <Button onClick={() => onClose()} variant="secondary">
                            {t('global:cancel')}
                        </Button>
                        <Button type="submit" variant="primary">
                            {t('global:ok')}
                        </Button>
                    </fieldset>
                </form>
            </Modal>
        );
    }
}

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    showError,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(ModalPassword));
