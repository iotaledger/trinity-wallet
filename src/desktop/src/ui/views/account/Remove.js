import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { getSelectedAccountName } from 'selectors/accounts';
import { generateAlert } from 'actions/alerts';

import { removeSeed } from 'libs/crypto';
import { deleteAccount } from 'actions/accounts';
import ModalPassword from 'ui/components/modal/Password';

import Button from 'ui/components/Button';
import Confirm from 'ui/components/modal/Confirm';

/**
 * Remove account component
 */
class Remove extends PureComponent {
    static propTypes = {
        /** Current account name */
        accountName: PropTypes.string.isRequired,
        /** Remove account
         * @param {String} accountName - Target account name
         * @ignore
         */
        deleteAccount: PropTypes.func.isRequired,
        /** Browser history object */
        history: PropTypes.object.isRequired,
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
        removeConfirm: false,
    };

    removeAccount = async (password) => {
        const { accountName, history, t, generateAlert, deleteAccount } = this.props;

        this.setState({
            removeConfirm: false,
        });

        try {
            await removeSeed(password, accountName);

            deleteAccount(accountName);

            history.push('/wallet/');

            generateAlert('success', t('settings:accountDeleted'), t('settings:accountDeletedExplanation'));
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
        const { t, accountName } = this.props;
        const { removeConfirm, vault } = this.state;

        if (removeConfirm && !vault) {
            return (
                <ModalPassword
                    isOpen
                    inline
                    onSuccess={(password) => this.removeAccount(password)}
                    onClose={() => this.setState({ removeConfirm: false })}
                    category="negative"
                    content={{
                        title: t('deleteAccount:enterPassword'),
                        confirm: t('accountManagement:deleteAccount'),
                    }}
                />
            );
        }

        return (
            <div>
                <Button variant="negative" onClick={() => this.setState({ removeConfirm: !removeConfirm })}>
                    {t('accountManagement:deleteAccount')}
                </Button>

                <Confirm
                    isOpen={removeConfirm}
                    category="negative"
                    content={{
                        title: `Are you sure you want to delete ${accountName}?`, //FIXME
                        message: t('deleteAccount:yourSeedWillBeRemoved'),
                        cancel: t('cancel'),
                        confirm: t('accountManagement:deleteAccount'),
                    }}
                    onCancel={() => this.setState({ removeConfirm: false })}
                    onConfirm={() => this.removeAccount()}
                />
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    accountName: getSelectedAccountName(state),
});

const mapDispatchToProps = {
    generateAlert,
    deleteAccount,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(translate()(Remove));
