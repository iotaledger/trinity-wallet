import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from '../../actions/alerts';

import { prepareTransfer } from '../../actions/tempAccount';
import { getSelectedAccountNameViaSeedIndex, getBalanceForSelectedAccountViaSeedIndex } from '../../selectors/account';
import { VALID_SEED_REGEX, ADDRESS_LENGTH } from '../../libs/util';
import { iota } from '../../libs/iota';

/**
 * Send transaction component container
 * @ignore
 */
export default function withSendData(SendComponent) {
    class SendData extends React.Component {
        static propTypes = {
            balance: PropTypes.number.isRequired,
            account: PropTypes.object.isRequired,
            accountName: PropTypes.string.isRequired,
            tempAccount: PropTypes.object.isRequired,
            seed: PropTypes.string.isRequired,
            settings: PropTypes.object.isRequired,
            generateAlert: PropTypes.func.isRequired,
            prepareTransfer: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
            t: PropTypes.func.isRequired,
        };

        validateInputs = (address, amount) => {
            const { generateAlert, balance, t } = this.props;

            if (address.length !== ADDRESS_LENGTH) {
                generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation1'));
                return false;
            }

            if (!address.match(VALID_SEED_REGEX)) {
                generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation2'));
                return false;
            }

            if (!iota.utils.isValidChecksum(address)) {
                generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation3'));
                return false;
            }

            if (parseFloat(amount) > balance) {
                generateAlert('error', t('send:notEnoughFunds'), t('send:notEnoughFundsExplanation'));
                return false;
            }

            return true;
        };

        sendTransfer = (seed, address, value, message, taskRunner, powFn) => {
            const { prepareTransfer, tempAccount, accountName, generateAlert, t } = this.props;

            if (tempAccount.isSyncing) {
                generateAlert('error', t('global:syncInProgress'), t('global:syncInProgressExplanation'));
                return;
            }

            if (tempAccount.isTransitioning) {
                generateAlert(
                    'error',
                    t('Snapshot transition in progress'),
                    t('Please wait until the transition is complete.'),
                );
                return;
            }

            if (typeof taskRunner === 'function') {
                taskRunner('prepareTransfer', [seed, address, value, message, accountName, powFn]);
            } else {
                prepareTransfer(seed, address, value, message, accountName, powFn);
            }
        };

        render() {
            const { balance, seed, settings, tempAccount, theme, t } = this.props;

            const sendProps = {
                isSending: tempAccount.isSendingTransfer,
                validateInputs: this.validateInputs,
                sendTransfer: this.sendTransfer,
                settings,
                balance,
                seed,
                theme,
                t,
            };

            return <SendComponent {...sendProps} />;
        }
    }

    SendData.displayName = `withSendData(${SendComponent.name})`;

    const mapStateToProps = (state) => ({
        tempAccount: state.tempAccount,
        balance: getBalanceForSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
        accountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.accountNames),
        settings: state.settings,
        account: state.account,
        seed: state.seeds.seeds[state.tempAccount.seedIndex],
        theme: state.settings.theme,
    });

    const mapDispatchToProps = {
        generateAlert,
        prepareTransfer,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(SendData));
}
