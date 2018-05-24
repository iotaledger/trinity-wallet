import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import sjcl from 'sjcl';

import { generateAlert } from 'actions/alerts';

import Password from 'ui/components/input/Password';
import Button from 'ui/components/Button';
import Modal from 'ui/components/modal/Modal';

import { getVault } from 'libs/crypto';

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
         * @param {String} Password - Entered password plain text
         * @param {Object} Vault - Vault content
         */
        onSuccess: PropTypes.func.isRequired,
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
        password: '',
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.isOpen !== nextProps.isOpen) {
            this.setState({
                password: '',
            });
        }
    }

    onSubmit = async (e) => {
        const { password } = this.state;
        const { onSuccess, generateAlert, t } = this.props;

        e.preventDefault();

        let vault = null;
        const passwordHash = sjcl.codec.hex.fromBits(sjcl.hash.sha256.hash(password));

        try {
            vault = await getVault(passwordHash);
        } catch (err) {
            generateAlert(
                'error',
                t('changePassword:incorrectPassword'),
                t('changePassword:incorrectPasswordExplanation'),
            );
            return;
        }

        if (vault) {
            onSuccess(passwordHash, vault);
        }
    };

    render() {
        const { content, category, isOpen, isForced, inline, onClose, t } = this.props;
        const { password } = this.state;

        return (
            <Modal variant="confirm" inline={inline} isOpen={isOpen} isForced={isForced} onClose={() => onClose()}>
                {content.title ? <h1 className={category ? category : null}>{content.title}</h1> : null}
                {content.message ? <p>{content.message}</p> : null}
                <form onSubmit={(e) => this.onSubmit(e)}>
                    <Password
                        value={password}
                        focus={isOpen}
                        label={t('password')}
                        onChange={(value) => this.setState({ password: value })}
                    />
                    <fieldset>
                        {!isForced ? (
                            <Button onClick={() => onClose()} variant="dark">
                                {t('cancel')}
                            </Button>
                        ) : null}
                        <Button type="submit" variant={category ? category : 'positive'}>
                            {content.confirm ? content.confirm : t('login:login').toLowerCase()}
                        </Button>
                    </fieldset>
                </form>
            </Modal>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

export default connect(null, mapDispatchToProps)(translate()(ModalPassword));
