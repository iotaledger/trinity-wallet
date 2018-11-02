import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedAccountName, getSelectedAccountMeta, getAccountNamesFromState } from 'selectors/accounts';

import { MAX_ACC_LENGTH } from 'libs/crypto';
import SeedStore from 'libs/SeedStore';

import { changeAccountName } from 'actions/accounts';
import { generateAlert } from 'actions/alerts';

import Text from 'ui/components/input/Text';
import Button from 'ui/components/Button';

/**
 * Account Name settings component
 */
class AccountName extends PureComponent {
    static propTypes = {
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        accountMeta: PropTypes.object.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        changeAccountName: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        newAccountName: this.props.accountName,
    };

    /**
     * Check for unique account name and change account name in wallet state and in Seedstore object
     * @returns {undefined}
     **/
    async setAccountName() {
        const { accountName, accountMeta, accountNames, password, changeAccountName, generateAlert, t } = this.props;

        const newAccountName = this.state.newAccountName.replace(/^\s+|\s+$/g, '');

        if (newAccountName.length < 1) {
            generateAlert('error', t('addAdditionalSeed:noNickname'), t('addAdditionalSeed:noNicknameExplanation'));
            return;
        }

        if (newAccountName.length > MAX_ACC_LENGTH) {
            generateAlert(
                'error',
                t('addAdditionalSeed:accountNameTooLong'),
                t('addAdditionalSeed:accountNameTooLongExplanation', { maxLength: MAX_ACC_LENGTH }),
            );
            return;
        }

        if (accountNames.map((name) => name.toLowerCase()).indexOf(newAccountName.toLowerCase()) > -1) {
            generateAlert('error', t('addAdditionalSeed:nameInUse'), t('addAdditionalSeed:nameInUseExplanation'));
            return;
        }

        generateAlert('success', t('settings:nicknameChanged'), t('settings:nicknameChangedExplanation'));

        changeAccountName({
            oldAccountName: accountName,
            newAccountName,
        });

        const seedStore = await new SeedStore[accountMeta.type](password, accountName, accountMeta);
        await seedStore.renameAccount(newAccountName);
    }

    render() {
        const { accountName, t } = this.props;
        const { newAccountName } = this.state;

        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    this.setAccountName();
                }}
            >
                <Text
                    value={newAccountName}
                    label={t('accountManagement:editAccountName')}
                    onChange={(value) => this.setState({ newAccountName: value })}
                />
                <fieldset>
                    <Button disabled={newAccountName.replace(/^\s+|\s+$/g, '') === accountName} type="submit">
                        {t('save')}
                    </Button>
                </fieldset>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    accountName: getSelectedAccountName(state),
    accountMeta: getSelectedAccountMeta(state),
    password: state.wallet.password,
});

const mapDispatchToProps = {
    changeAccountName,
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(AccountName));
