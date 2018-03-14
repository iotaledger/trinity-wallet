import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';

import { generateAlert } from 'actions/alerts';
import { getVault, setVault } from 'libs/crypto';
import { deleteAccount } from 'actions/account';

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
        /** Account password */
        password: PropTypes.string.isRequired,
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

    removeAccount = () => {
        const { accountName, seedIndex, password, history, t, generateAlert } = this.props;

        try {
            const vault = getVault(password);
            delete vault.seeds[seedIndex];

            setVault(password, password, { seeds: vault.seeds });
            deleteAccount(accountName);
            history.push('/wallet/');

            generateAlert(
               'success',
               t('settings:accountDeleted'),
               t('settings:accountDeletedExplanation'),
           );
           
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
        const { removeConfirm } = this.state;

        return (
            <div>
                <Button onClick={() => this.setState({ removeConfirm: !removeConfirm })}>{t('settings:reset')}</Button>
                <Confirm
                    isOpen={removeConfirm}
                    category="negative"
                    content={{
                        title: t('deleteAccount:areYouSure'),
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
    seedIndex: state.tempAccount.seedIndex,
    accountName: state.account.seedNames[state.tempAccount.seedIndex],
});

const mapDispatchToProps = {
    generateAlert,
    deleteAccount,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Remove));
