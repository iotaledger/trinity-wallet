import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from '../../actions/alerts';

import { sendAmount } from '../../actions/deepLinks';
import { makeTransaction } from '../../actions/transfers';
import { getSelectedAccountName, getBalanceForSelectedAccount } from '../../selectors/accounts';
import { VALID_SEED_REGEX, ADDRESS_LENGTH } from '../../libs/iota/utils';
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
            deepLinks: PropTypes.object.isRequired,
            sendAmount: PropTypes.func.isRequired,
        };

        componentWillMount() {
            this.validadeDeepLink(this.props.deepLinks.address);
        }

        componentWillReceiveProps(nextProps) {
            this.validadeDeepLink(nextProps.deepLinks.address);
        }

        validadeDeepLink(address) {
            if (address !== '') {
                const { generateAlert, t } = this.props;
                generateAlert('success', t('autofill'), t('autofillExplanation'));
            }
        }

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

        validateMessage = (message) => {
            const { generateAlert, t } = this.props;
            // Validate whether message only contains ASCII letters
            // as anything else is lost up on conversion to trytes
            for (let i = 0; i < message.length; i++){
                if (message.charCodeAt(i) > 255) {
                    generateAlert('error', t('send:invalidMessageCharacter'), t('send:invalidMessageCharacterExplanation'));
                    return false;
                }
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
            const { balance, settings, marketData, wallet, ui, theme, t, deepLinks, sendAmount } = this.props;

            const sendProps = {
                isSending: ui.isSendingTransfer,
                password: wallet.password,
                seedIndex: wallet.seedIndex,
                validateInputs: this.validateInputs,
                sendTransfer: this.sendTransfer,
                validateMessage: this.validateMessage,
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
                deepLinkAmount: deepLinks,
                sendAmount: sendAmount,
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
        deepLinks: state.deepLinks,
    });

    const mapDispatchToProps = {
        generateAlert,
        makeTransaction,
        sendAmount,
    };

    return translate()(connect(mapStateToProps, mapDispatchToProps)(SendData));
}
