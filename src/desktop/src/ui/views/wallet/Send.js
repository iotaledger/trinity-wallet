import React from 'react';
import PropTypes from 'prop-types';
import { formatValue, formatUnit } from 'libs/util';

import AddressInput from 'ui/components/input/Address';
import AmountInput from 'ui/components/input/Amount';
import MessageInput from 'ui/components/input/Message';
import List from 'ui/components/List';
import Button from 'ui/components/Button';
import Modal from 'ui/components/modal/Modal';
import { connect } from 'react-redux';
import withSendData from 'containers/wallet/Send';

import css from './send.css';

/**
 * Send transaction component
 */
class Send extends React.PureComponent {
    static propTypes = {
        /** Current send status */
        isSending: PropTypes.bool.isRequired,
        /** Current seed state value */
        seeds: PropTypes.object.isRequired,
        /** Total current account wallet ballance in iotas */
        balance: PropTypes.number.isRequired,
        /** Fiat currency settings
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
         */
        sendTransfer: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
        deepLinks: PropTypes.object.isRequired,
    };

    state = {
        address: '',
        amount: 0,
        message: '',
        isModalVisible: false,
    };

    componentWillReceiveProps(props) {
        if (props.deepLinks.address !== '') {
            const { amount, message, address } = props.deepLinks;
            this.state.amount = amount;
            this.state.address = address;
            this.state.message = message;
        } else {
            this.state.amount = 0;
            this.state.address = '';
            this.state.message = '';
        }
    }

    componentWillMount() {
        // if (this.props.deepLinks.address !== '') {
        //     const { amount, message, address } = this.props.deepLinks;
        //     this.state.amount = amount;
        //     this.state.address = address;
        //     this.state.message = message;
        // }
    }

    validateInputs = (e) => {
        const { address, amount } = this.state;
        const { validateInputs } = this.props;

        e.preventDefault();

        this.setState({
            isModalVisible: validateInputs(address, amount),
        });
    };

    confirmTransfer = () => {
        const { address, amount, message } = this.state;
        const { seeds, sendTransfer } = this.props;

        this.setState({
            isModalVisible: false,
        });

        const seedInfo = seeds.items[seeds.selectedSeedIndex];

        sendTransfer(seedInfo.seed, address, amount, message);
    };

    render() {
        const { isSending, balance, settings, t } = this.props;
        const { address, amount, message, isModalVisible } = this.state;

        return (
            <main>
                <section className={css.send}>
                    <div>
                        <form onSubmit={this.validateInputs}>
                            <Modal
                                variant="confirm"
                                isOpen={isModalVisible}
                                onClose={() => this.setState({ isModalVisible: false })}
                            >
                                <h1>
                                    You are about to send{' '}
                                    <strong>{`${formatValue(amount)} ${formatUnit(amount)}`}</strong> to the address:{' '}
                                    <br />
                                    <strong>{address}</strong>
                                </h1>
                                <Button onClick={() => this.setState({ isModalVisible: false })} variant="secondary">
                                    {t('global:no')}
                                </Button>
                                <Button onClick={this.confirmTransfer} variant="primary">
                                    {t('global:yes')}
                                </Button>
                            </Modal>
                            <AddressInput
                                address={address}
                                onChange={(value) => this.setState({ address: value })}
                                label={t('send:recipientAddress')}
                                closeLabel={t('global:back')}
                            />
                            <AmountInput
                                amount={amount.toString()}
                                settings={settings}
                                label={t('send:amount')}
                                labelMax={t('send:max')}
                                balance={balance}
                                onChange={(value) => this.setState({ amount: value })}
                            />
                            <MessageInput
                                message={message}
                                label={t('send:message')}
                                onChange={(value) => this.setState({ message: value })}
                            />
                            <Button loading={isSending} variant="primary">
                                {t('send:send')}
                            </Button>
                        </form>
                    </div>
                </section>
                <section>
                    <List filter="sent" limit={10} />
                </section>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    deepLinks: state.deepLinks,
});

export default withSendData(Send)(connect(mapStateToProps)(Send));
