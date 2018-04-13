import React from 'react';
import PropTypes from 'prop-types';
import { formatValue, formatUnit } from 'libs/iota/utils';
import Curl from 'curl.lib.js';

import { getVault } from 'libs/crypto';

import AddressInput from 'ui/components/input/Address';
import AmountInput from 'ui/components/input/Amount';
import TextInput from 'ui/components/input/Text';
import Button from 'ui/components/Button';
import Confirm from 'ui/components/modal/Confirm';
import withSendData from 'containers/wallet/Send';

import css from './index.css';

/**
 * Send transaction component
 */
class Send extends React.PureComponent {
    static propTypes = {
        /** Current Send transaction fields state */
        fields: PropTypes.shape({
            address: PropTypes.string.isRequired,
            amount: PropTypes.string.isRequired,
            message: PropTypes.string.isRequired,
        }),
        /** Current send status */
        isSending: PropTypes.bool.isRequired,
        /** Current password value */
        password: PropTypes.string.isRequired,
        /** Current seed index */
        seedIndex: PropTypes.number.isRequired,
        /** Total current account wallet ballance in iotas */
        balance: PropTypes.number.isRequired,
        /** Fiat currency settings
         * @property {bool} remotePow - Local PoW enable state
         * @property {string} conversionRate - Active currency conversion rate to MIota
         * @property (string) currency - Active currency name
         */
        settings: PropTypes.shape({
            conversionRate: PropTypes.number.isRequired,
            currency: PropTypes.string.isRequired,
        }),
        /** Validate the transaction inputs
         *  @param {string} address - receiver address
         *  @param {number} value - transaction value in iotas
         */
        validateInputs: PropTypes.func.isRequired,
        /** Send the transaction
         *  @param {string} seed - seed to be used for the transaction signing
         *  @param {string} address - receiver address
         *  @param {number} value - transaction value in iotas
         *  @param {string} message - transaction message
         *  @param {function} taskRunner - task manager
         *  @param {function} powFn - locla PoW function
         */
        sendTransfer: PropTypes.func.isRequired,
        /** Update address field value
         *  @param {string} address - receiver address
         */
        setSendAddressField: PropTypes.func.isRequired,
        /** Update amount field value
         *  @param {string} amount - receiver address
         */
        setSendAmountField: PropTypes.func.isRequired,
        /** Update message field value
         *  @param {string} message - receiver address
         */
        setSendMessageField: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        isTransferModalVisible: false,
    };

    validateInputs = (e) => {
        const { validateInputs } = this.props;

        e.preventDefault();

        this.setState({
            isTransferModalVisible: validateInputs(),
        });
    };

    updateFields(address, message, amount) {
        this.props.setSendAddressField(address);
        if (message) {
            this.props.setSendMessageField(message);
        }
        if (amount) {
            this.props.setSendAmountField(amount);
        }
    }

    confirmTransfer = async () => {
        const { fields, password, seedIndex, sendTransfer, settings, generateAlert } = this.props;

        this.setState({
            isTransferModalVisible: false,
        });

        let powFn = null;

        if (!settings.remotePoW) {
            // Temporarily return an error if WebGL cannot be initialized
            // Remove once we implement more PoW methods
            try {
                Curl.init();
            } catch (e) {
                return generateAlert(
                    'error',
                    'WebGL not supported',
                    'Your computer does not support WebGL. Please use remote PoW.',
                );
            }
            powFn = (trytes, minWeight) => {
                return Curl.pow({ trytes, minWeight });
            };
        }

        const vault = await getVault(password);
        const seed = vault.seeds[seedIndex];

        sendTransfer(seed, fields.address, parseInt(fields.amount) || 0, fields.message, null, powFn);
    };

    render() {
        const { fields, isSending, balance, settings, t } = this.props;
        const { isTransferModalVisible } = this.state;

        const transferContents =
            parseInt(fields.amount) > 0
                ? `${formatValue(fields.amount)} ${formatUnit(fields.amount)}`
                : t('send:messageSingle');

        return (
            <form onSubmit={(e) => this.validateInputs(e)}>
                <div className={isSending ? css.sending : null}>
                    <Confirm
                        category="primary"
                        isOpen={isTransferModalVisible}
                        onCancel={() => this.setState({ isTransferModalVisible: false })}
                        onConfirm={() => this.confirmTransfer()}
                        content={{
                            title: t('send:sendConfirmation', { sendAmount: transferContents }),
                            message: fields.address,
                            confirm: t('send'),
                            cancel: t('cancel'),
                        }}
                    />
                    <AddressInput
                        address={fields.address}
                        onChange={(address, message, amount) => {
                            this.updateFields(address, message, amount);
                        }}
                        label={t('send:recipientAddress')}
                        closeLabel={t('back')}
                    />
                    <AmountInput
                        amount={fields.amount}
                        settings={settings}
                        label={t('send:amount')}
                        labelMax={t('send:max')}
                        balance={balance}
                        onChange={(value) => this.props.setSendAmountField(value)}
                    />
                    <TextInput
                        value={fields.message}
                        label={t('send:message')}
                        onChange={(value) => this.props.setSendMessageField(value)}
                    />
                </div>
                <fieldset>
                    <Button type="submit" loading={isSending} variant="primary">
                        {t('send:send')}
                    </Button>
                </fieldset>
            </form>
        );
    }
}

export default withSendData(Send);
