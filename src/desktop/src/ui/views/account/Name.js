import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedAccountViaSeedIndex, getSelectedAccountNameViaSeedIndex } from 'selectors/account';

import { changeAccountName } from 'actions/account';
import { showError } from 'actions/notifications';
import { loadSeeds } from 'actions/seeds';
import { setVault } from 'libs/crypto';

import Text from 'ui/components/input/Text';

import Button from 'ui/components/Button';

/**
 * Account name settings component
 */
class AccountName extends PureComponent {
    static propTypes = {
        /** Account password */
        password: PropTypes.string.isRequired,
        /** Account vault */
        vault: PropTypes.object.isRequired,
        /** Current accounts info */
        accountInfo: PropTypes.object,
        /** Selected account name */
        accountName: PropTypes.string.isRequired,
        /** Change current account name
         * @param {Object} AccountInfo - updated account info
         * @param {Object} SeedNames - updated seed names
         */
        changeAccountName: PropTypes.func.isRequired,
        /** Set seed state data
         * @param {Object} seeds - Seed state data
         */
        loadSeeds: PropTypes.func.isRequired,
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
        newAccountName: this.props.accountName,
    };

    /** Change account name in state and in vault */
    setAccountName() {
        const { password, vault, accountName, changeAccountName, accountInfo, showError, loadSeeds, t } = this.props;
        const { newAccountName } = this.state;

        const accountNames = Object.keys(accountInfo);

        if (accountNames.indexOf(newAccountName) > -1) {
            showError({
                title: t('addAdditionalSeed:nameInUse'),
                text: t('addAdditionalSeed:nameInUseExplanation'),
            });
            return;
        }

        vault.items = vault.items.map((seed) => {
            seed.name = seed.name === accountName ? newAccountName : seed.name;
            return seed;
        });

        setVault(password, password, vault);
        loadSeeds(vault);

        let newAccountInfo = Object.assign({}, accountInfo, { [newAccountName]: accountInfo[accountName] });
        delete newAccountInfo[accountName];
        changeAccountName(newAccountInfo, Object.keys(newAccountInfo));

        this.setState({
            passwordConfirm: false,
        });
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
                    <Button disabled={newAccountName === accountName} type="submit">
                        {t('global:save')}
                    </Button>
                </fieldset>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accountInfo: state.account.accountInfo,
    accountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
});

const mapDispatchToProps = {
    changeAccountName,
    loadSeeds,
    showError,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(AccountName));
