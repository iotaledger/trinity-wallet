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
import { generateAlert } from 'actions/alerts';

import css from './index.css';

/**
 * Send transaction component
 */
class Send extends React.PureComponent {
    static propTypes = {
        /** Current send status */
        isSending: PropTypes.bool.isRequired,
        /** Deep link state */
        deepLinkAmount: PropTypes.object.isRequired,
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
        /** Set deep link amount */
        sendAmount: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        address: '',
        amount: 0,
        message: '',
        isModalVisible: false,
    };

    componentWillMount() {
        this.refreshDeepLinkValues(this.props.deepLinkAmount);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isSending && !nextProps.isSending) {
            this.setState({
                address: '',
                amount: 0,
                message: '',
            });
        }
        this.refreshDeepLinkValues(nextProps.deepLinkAmount);
    }

    refreshDeepLinkValues = (props) => {
        if (props.address.length > 0 && props.address !== this.state.address) {
            this.setState({
                address: props.address,
                amount: props.amount || this.state.amount,
                message: props.message || this.state.message,
            });
            this.props.sendAmount(0, '', '');
        }
    };

    validateInputs = (e) => {
        const { address, amount } = this.state;
        const { validateInputs } = this.props;

        e.preventDefault();

        this.setState({
            isModalVisible: validateInputs(address, amount),
        });
    };

    confirmTransfer = async () => {
        const { address, amount, message } = this.state;
        const { password, seedIndex, sendTransfer, settings } = this.props;

        this.setState({
            isModalVisible: false,
        });

        let powFn = null;

        if (!settings.remotePow) {
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

        sendTransfer(seed, address, amount, message, null, powFn);
    };

    render() {
        const { isSending, balance, settings, t } = this.props;
        const { address, amount, message, isModalVisible } = this.state;

        return (
            <form onSubmit={(e) => this.validateInputs(e)}>
                <div className={isSending ? css.sending : null}>
                    <Confirm
                        category="primary"
                        isOpen={isModalVisible}
                        onCancel={() => this.setState({ isModalVisible: false })}
                        onConfirm={() => this.confirmTransfer()}
                        content={{
                            title: `You are about to send ${formatValue(amount)} ${formatUnit(amount)} to the address`,
                            message: address,
                            confirm: 'confirm',
                            cancel: 'Cancel',
                        }}
                    />
                    <AddressInput
                        address={address}
                        onChange={(value, messageIn, ammountIn) =>
                            this.setState({
                                address: value,
                                message: messageIn ? messageIn : message,
                                amount: ammountIn ? ammountIn : amount,
                            })
                        }
                        label={t('send:recipientAddress')}
                        closeLabel={t('back')}
                    />
                    <AmountInput
                        amount={amount}
                        settings={settings}
                        label={t('send:amount')}
                        labelMax={t('send:max')}
                        balance={balance}
                        onChange={(value) => this.setState({ amount: value })}
                    />
                    <TextInput
                        value={message}
                        label={t('send:message')}
                        onChange={(value) => this.setState({ message: value })}
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
