import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { selectAccountInfo } from 'selectors/account';

import { changeAccountName } from 'actions/account';
import { generateAlert } from 'actions/alerts';
import { setSeeds } from 'actions/seeds';

import Text from 'ui/components/input/Text';
import Button from 'ui/components/Button';

/**
 * Account name settings component
 */
class AccountName extends PureComponent {
    static propTypes = {
        /** Current accounts info */
        accountInfo: PropTypes.object,
        /** Selected account name */
        accountName: PropTypes.string.isRequired,
        /** Change current account name
         * @param {Object} AccountInfo - updated account info
         * @param {Object} SeedNames - updated seed names
         */
        changeAccountName: PropTypes.func.isRequired,
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
        newAccountName: this.props.accountName,
    };

    /** Change account name in state and in vault */
    setAccountName() {
        const { accountName, changeAccountName, accountInfo, generateAlert, t } = this.props;
        const { newAccountName } = this.state;

        const accountNames = Object.keys(accountInfo);

        if (accountNames.indexOf(newAccountName) > -1) {
            generateAlert('error', t('addAdditionalSeed:nameInUse'), t('addAdditionalSeed:nameInUseExplanation'));
            return;
        }

        changeAccountName({
            oldAccountName: accountName,
            newAccountName,
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
                        {t('save')}
                    </Button>
                </fieldset>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accountInfo: state.account.accountInfo,
    accountName: selectAccountInfo(state),
});

const mapDispatchToProps = {
    changeAccountName,
    setSeeds,
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(AccountName));
