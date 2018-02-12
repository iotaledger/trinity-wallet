import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { showError } from '../../actions/notifications';
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
            seeds: PropTypes.object.isRequired,
            settings: PropTypes.object.isRequired,
            showError: PropTypes.func.isRequired,
            prepareTransfer: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
            t: PropTypes.func.isRequired,
        };

        validateInputs = (address, amount) => {
            const { showError, balance } = this.props;

            if (address.length !== ADDRESS_LENGTH) {
                showError({
                    title: 'send:invalidAddress',
                    text: 'send:invalidAddressExplanation1',
                    translate: true,
                });
                return false;
            }

            if (!address.match(VALID_SEED_REGEX)) {
                showError({
                    title: 'send:invalidAddress',
                    text: 'send:invalidAddressExplanation2',
                    translate: true,
                });
                return false;
            }

            if (!iota.utils.isValidChecksum(address)) {
                showError({
                    title: 'send:invalidAddress',
                    text: 'send:invalidAddressExplanation3',
                    translate: true,
                });
                return false;
            }

            if (parseFloat(amount) > balance) {
                showError({
                    title: 'send:notEnoughFunds',
                    text: 'send:notEnoughFundsExplanation',
                    translate: true,
                });
                return false;
            }

            return true;
        };

        sendTransfer = (seed, address, value, message, taskRunner) => {
            const { prepareTransfer, account, tempAccount, accountName, showError, t } = this.props;

            const accountInfo = account.accountInfo[tempAccount.seedIndex];

            if (tempAccount.isSyncing) {
                showError({
                    title: t('global:syncInProgress'),
                    text: t('global:syncInProgressExplanation'),
                    translate: true,
                });
                return;
            }

            if (tempAccount.isTransitioning) {
                showError({
                    title: 'Snapshot transition in progress',
                    text: 'Please wait until the transition is complete.',
                    translate: true,
                });
                return;
            }

            if (typeof taskRunner === 'function') {
                taskRunner('prepareTransfer', [seed, address, value, message, accountName]);
            } else {
                prepareTransfer(seed, address, value, message, accountName);
            }
        };

        render() {
            const { theme, seeds, tempAccount, t } = this.props;

            const sendProps = {
                isSending: tempAccount.isSendingTransfer,
                validateInputs: this.validateInputs,
                sendTransfer: this.sendTransfer,
                seeds,
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
        accountName: getSelectedAccountNameViaSeedIndex(state.tempAccount.seedIndex, state.account.seedNames),
        settings: state.settings,
        account: state.account,
        seeds: state.seeds,
        theme: state.settings.theme,
    });

    const mapDispatchToProps = {
        showError,
        prepareTransfer,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(SendData));
}
