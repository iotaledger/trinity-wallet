import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from '../../actions/alerts';

import { setDeepLinkInactive } from '../../actions/wallet';
import { makeTransaction } from '../../actions/transfers';
import { setSendAddressField, setSendAmountField, setSendMessageField } from '../../actions/ui';

import { getSelectedAccountName, getBalanceForSelectedAccount } from '../../selectors/accounts';
import { VALID_SEED_REGEX, ADDRESS_LENGTH, isValidMessage } from '../../libs/iota/utils';
import { iota } from '../../libs/iota';

/**
 * Send transaction component container
 * @ignore
 */
export default function withSendData(SendComponent) {
    class SendData extends React.Component {
        static propTypes = {
            balance: PropTypes.number.isRequired,
            accounts: PropTypes.object.isRequired,
            accountName: PropTypes.string.isRequired,
            wallet: PropTypes.object.isRequired,
            ui: PropTypes.object.isRequired,
            settings: PropTypes.object.isRequired,
            marketData: PropTypes.object.isRequired,
            generateAlert: PropTypes.func.isRequired,
            makeTransaction: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
            t: PropTypes.func.isRequired,
            setDeepLinkInactive: PropTypes.func.isRequired,
            deepLinkActive: PropTypes.bool.isRequired,
            setSendAddressField: PropTypes.func.isRequired,
            setSendAmountField: PropTypes.func.isRequired,
            setSendMessageField: PropTypes.func.isRequired,
        };

        componentWillMount() {
            this.checkDeepLink(this.props);
        }

        componentWillReceiveProps(nextProps) {
            this.checkDeepLink(nextProps);

            if (this.props.ui.isSendingTransfer && !nextProps.ui.isSendingTransfer) {
                this.props.setSendAddressField('');
                this.props.setSendAmountField('');
                this.props.setSendMessageField('');
            }
        }

        checkDeepLink = (props) => {
            if (props.deepLinkActive) {
                this.props.generateAlert(
                    'success',
                    this.props.t('deepLink:autofill'),
                    this.props.t('deepLink:autofillExplanation'),
                );
                this.props.setDeepLinkInactive();
            }
        };

        validateInputs = () => {
            const { ui, generateAlert, balance, t } = this.props;

            const address = ui.sendAddressFieldText;
            const amount = ui.sendAmountFieldText;
            const message = ui.sendMessageFieldText;

            // Validate address length
            if (address.length !== ADDRESS_LENGTH) {
                generateAlert(
                    'error',
                    t('send:invalidAddress'),
                    t('send:invalidAddressExplanation1', { maxLength: ADDRESS_LENGTH }),
                );
                return false;
            }

            // Validate valid IOTA address
            if (!address.match(VALID_SEED_REGEX)) {
                generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation2'));
                return false;
            }

            // Validate address checksum
            if (!iota.utils.isValidChecksum(address)) {
                generateAlert('error', t('send:invalidAddress'), t('send:invalidAddressExplanation3'));
                return false;
            }

            // Validate enought balance
            if (parseFloat(amount) > balance) {
                generateAlert('error', t('send:notEnoughFunds'), t('send:notEnoughFundsExplanation'));
                return false;
            }

            // Validate whether message only contains ASCII letters
            // as anything else is lost up on conversion to trytes
            if (!isValidMessage(message)) {
                generateAlert('error', t('send:invalidMessage'), t('send:invalidMessageExplanation'));
                return false;
            }

            // Validate length of the message
            const trytes = iota.utils.toTrytes(message) || '';
            if (trytes.length > 2187) {
                generateAlert('error', t('send:invalidMessageTooLong'), t('send:invalidMessageTooLongExplanation'));
                return false;
            }

            return true;
        };

        sendTransfer = (seed, address, value, message, taskRunner, powFn) => {
            const { ui, accountName, generateAlert, t } = this.props;

            if (ui.isSyncing) {
                generateAlert('error', t('global:syncInProgress'), t('global:syncInProgressExplanation'));
                return;
            }

            if (ui.isTransitioning) {
                generateAlert('error', t('snapshotTransitionInProgress'), t('snapshotTransitionInProgressExplanation'));
                return;
            }

            if (typeof taskRunner === 'function') {
                taskRunner('makeTransaction', [seed, address, value, message, accountName, powFn]);
            } else {
                this.props.makeTransaction(seed, address, value, message, accountName, powFn);
            }
        };

        render() {
            const {
                balance,
                settings,
                marketData,
                wallet,
                ui,
                theme,
                t,
                setSendAddressField,
                setSendAmountField,
                setSendMessageField,
            } = this.props;

            const sendProps = {
                fields: {
                    address: ui.sendAddressFieldText,
                    amount: ui.sendAmountFieldText,
                    message: ui.sendMessageFieldText,
                },
                setSendAddressField,
                setSendAmountField,
                setSendMessageField,
                isSending: ui.isSendingTransfer,
                password: wallet.password,
                seedIndex: wallet.seedIndex,
                validateInputs: this.validateInputs,
                sendTransfer: this.sendTransfer,
                settings: {
                    currency: settings.currency,
                    conversionRate: settings.conversionRate,
                    usdPrice: marketData.usdPrice,
                    remotePoW: settings.remotePoW,
                },
                generateAlert,
                balance,
                theme,
                t,
            };

            return <SendComponent {...sendProps} />;
        }
    }

    SendData.displayName = `withSendData(${SendComponent.name})`;

    const mapStateToProps = (state) => ({
        wallet: state.wallet,
        balance: getBalanceForSelectedAccount(state),
        accountName: getSelectedAccountName(state),
        settings: state.settings,
        marketData: state.marketData,
        accounts: state.accounts,
        theme: state.settings.theme,
        ui: state.ui,
        deepLinkActive: state.wallet.deepLinkActive,
    });

    const mapDispatchToProps = {
        generateAlert,
        makeTransaction,
        setDeepLinkInactive,
        setSendAddressField,
        setSendAmountField,
        setSendMessageField,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(SendData));
}
