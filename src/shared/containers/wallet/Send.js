import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { generateAlert } from '../../actions/alerts';

import { makeTransaction } from '../../actions/transfers';
import { getSelectedAccountName, getBalanceForSelectedAccount } from '../../selectors/accounts';
import { VALID_SEED_REGEX, ADDRESS_LENGTH } from '../../libs/iota/utils';
import { iota } from '../../libs/iota';
import deepLinks from '../../reducers/deepLinks';
import { sendAmount } from 'actions/deepLinks';

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
            seed: PropTypes.string.isRequired,
            settings: PropTypes.object.isRequired,
            generateAlert: PropTypes.func.isRequired,
            makeTransaction: PropTypes.func.isRequired,
            theme: PropTypes.object.isRequired,
            t: PropTypes.func.isRequired,
            deepLinks: PropTypes.object.isRequired,
            sendAmount: PropTypes.func.isRequired,
        };

        componentWillUnmount() {
            this.props.sendAmount(0, '', '');
        }

        componentWillReceiveProps(props) {
            this.validadeDeepLink();
            this.props = props;
        }

        componentWillMount() {
            this.validadeDeepLink();
        }

        validadeDeepLink() {
            if (this.props.deepLinks.address !== '') {
                const { generateAlert } = this.props;
                generateAlert('success', 'Autofill', 'Transaction data autofilled from link.');
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

        sendTransfer = (seed, address, value, message, taskRunner, powFn) => {
            const { ui, accountName, generateAlert, t } = this.props;

            if (ui.isSyncing) {
                generateAlert('error', t('global:syncInProgress'), t('global:syncInProgressExplanation'));
                return;
            }

            if (ui.isTransitioning) {
                generateAlert(
                    'error',
                    t('Snapshot transition in progress'),
                    t('Please wait until the transition is complete.'),
                );
                return;
            }

            if (typeof taskRunner === 'function') {
                taskRunner('makeTransaction', [seed, address, value, message, accountName, powFn]);
            } else {
                this.props.makeTransaction(seed, address, value, message, accountName, powFn);
            }
        };

        render() {
            const { balance, seed, settings, wallet, theme, t, deepLinks } = this.props;

            const sendProps = {
                isSending: wallet.isSendingTransfer,
                validateInputs: this.validateInputs,
                sendTransfer: this.sendTransfer,
                settings,
                balance,
                seed,
                theme,
                t,
                deepLinkAmount: deepLinks,
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
        accounts: state.accounts,
        seed: state.seeds.seeds[state.wallet.seedIndex],
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
