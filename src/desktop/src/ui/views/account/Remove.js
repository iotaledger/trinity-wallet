import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';

import { setVault } from 'libs/crypto';
import { deleteAccount } from 'actions/accounts';
import ModalPassword from 'ui/components/modal/Password';

import Button from 'ui/components/Button';
import Confirm from 'ui/components/modal/Confirm';

/**
 * Remove account component
 */
class Remove extends PureComponent {
    static propTypes = {
        /** Current seed index */
        seedIndex: PropTypes.number.isRequired,
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
        password: null,
        vault: null,
    };

    removeAccount = () => {
        const { accountName, seedIndex, history, t, generateAlert, deleteAccount } = this.props;
        const { password, vault } = this.state;

        this.setState({
            removeConfirm: false,
        });

        try {
            const seeds = vault.seeds.filter((seed, index) => index !== seedIndex);

            setVault(password, { seeds: seeds });

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
                    onSuccess={(password, vault) => this.setState({ password, vault })}
                    onClose={() => this.setState({ removeConfirm: false })}
                    content={{
                        title: t('deleteAccount:enterPassword'),
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
    seedIndex: state.wallet.seedIndex,
    accountName: state.accounts.accountNames[state.wallet.seedIndex],
});

const mapDispatchToProps = {
    generateAlert,
    deleteAccount,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Remove));
