import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { withI18n } from 'react-i18next';
import { connect } from 'react-redux';
import { getAccountNamesFromState } from 'selectors/accounts';

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
        account: PropTypes.object.isRequired,
        /** @ignore */
        password: PropTypes.object.isRequired,
        /** @ignore */
        changeAccountName: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        newAccountName: this.props.account.accountName,
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.account.accountName !== this.state.newAccountName) {
            this.setState({
                newAccountName: nextProps.account.accountName,
            });
        }
    }

    /**
     * Check for unique account name and change account name in wallet state and in Seedstore object
     * @returns {undefined}
     **/
    async setAccountName() {
        const { account, accountNames, password, changeAccountName, generateAlert, t } = this.props;

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
            oldAccountName: account.accountName,
            newAccountName,
        });

        const seedStore = await new SeedStore[account.meta.type](password, account.accountName, account.meta);
        await seedStore.renameAccount(newAccountName);
    }

    render() {
        const { account, t } = this.props;
        const { newAccountName } = this.state;

        return (
            <form
                onSubmit={(e) => {
                    e.preventDefault();
                    this.setAccountName();
                }}
            >
                <fieldset>
                    <Text
                        value={newAccountName}
                        label={t('accountManagement:editAccountName')}
                        onChange={(value) => this.setState({ newAccountName: value })}
                    />
                </fieldset>
                <footer>
                    <Button
                        className="square"
                        disabled={newAccountName.replace(/^\s+|\s+$/g, '') === account.accountName}
                        type="submit"
                    >
                        {t('save')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accountNames: getAccountNamesFromState(state),
    password: state.wallet.password,
});

const mapDispatchToProps = {
    changeAccountName,
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(AccountName));
