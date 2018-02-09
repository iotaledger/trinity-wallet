import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { VALID_SEED_REGEX, ADDRESS_LENGTH, formatValue, formatUnit } from 'libs/util';
import { sendTransferRequest } from 'actions/tempAccount';
import { iota } from 'libs/iota';
import { showError } from 'actions/notifications';
import List from 'ui/components/List';
import AddressInput from 'ui/components/input/Address';
import AmountInput from 'ui/components/input/Amount';
import MessageInput from 'ui/components/input/Message';
import Button from 'ui/components/Button';
import Modal from 'ui/components/modal/Modal';
import { runTask } from 'worker';

import css from './send.css';

class Send extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        account: PropTypes.object.isRequired,
        tempAccount: PropTypes.object.isRequired,
        seeds: PropTypes.object.isRequired,
        settings: PropTypes.object.isRequired,
        showError: PropTypes.func.isRequired,
        sendTransferRequest: PropTypes.func.isRequired,
    };

    state = {
        address: '',
        amount: '0',
        message: '',
        isModalVisible: false,
    };

    onAddressChange = (value) => {
        this.setState(() => ({
            address: value.replace(/[^a-zA-Z9]*/g, '').toUpperCase(),
        }));
    };

    onAmountChange = (value) => {
        this.setState(() => ({
            amount: value,
        }));
    };

    onMessageChange = (value) => {
        this.setState(() => ({
            message: value,
        }));
    };

    send = () => {
        const { address, amount } = this.state;
        const { showError, account } = this.props;

        if (address.length !== ADDRESS_LENGTH) {
            return showError({
                title: 'send:invalidAddress',
                text: 'send:invalidAddressExplanation1',
                translate: true,
            });
        }

        if (!address.match(VALID_SEED_REGEX)) {
            return showError({
                title: 'send:invalidAddress',
                text: 'send:invalidAddressExplanation2',
                translate: true,
            });
        }

        if (!iota.utils.isValidChecksum(address)) {
            return showError({
                title: 'send:invalidAddress',
                text: 'send:invalidAddressExplanation3',
                translate: true,
            });
        }

        if (parseFloat(amount) > account.balance) {
            return showError({
                title: 'send:notEnoughFunds',
                text: 'send:notEnoughFundsExplanation',
                translate: true,
            });
        }

        this.toggleConfirmation();
    };

    toggleConfirmation = () => {
        this.setState({
            isModalVisible: !this.state.isModalVisible,
        });
    };

    sendTransfer = () => {
        const { address, amount, message } = this.state;
        const { sendTransferRequest, seeds, account } = this.props;

        this.toggleConfirmation();
        sendTransferRequest();

        const seedInfo = seeds.items[seeds.selectedSeedIndex];
        const accountInfo = account.accountInfo[seedInfo.name];

        runTask('sendTransaction', [seedInfo.seed, accountInfo, seedInfo.name, address, parseInt(amount), message]);
    };

    render() {
        const { t, settings, account, seeds, tempAccount } = this.props;
        const { address, amount, message, isModalVisible } = this.state;

        const seedInfo = seeds.items[seeds.selectedSeedIndex];
        const accountInfo = account.accountInfo[seedInfo.name];

        return (
            <main>
                <section className={css.send}>
                    <div>
                        <Modal variant="confirm" isOpen={isModalVisible} onClose={this.toggleConfirmation}>
                            <h1>
                                You are about to send <strong>{`${formatValue(amount)} ${formatUnit(amount)}`}</strong>{' '}
                                to the address: <br />
                                <strong>{address}</strong>
                            </h1>
                            <Button onClick={this.toggleConfirmation} variant="secondary">
                                {t('global:no')}
                            </Button>
                            <Button onClick={this.sendTransfer} variant="primary">
                                {t('global:yes')}
                            </Button>
                        </Modal>
                        <AddressInput
                            address={address}
                            onChange={this.onAddressChange}
                            label={t('send:recipientAddress')}
                            closeLabel={t('global:back')}
                        />
                        <AmountInput
                            amount={amount}
                            settings={settings}
                            label={t('send:amount')}
                            labelMax={t('send:max')}
                            balance={accountInfo.balance}
                            onChange={this.onAmountChange}
                        />
                        <MessageInput message={message} label={t('send:message')} onChange={this.onMessageChange} />
                        <Button loading={tempAccount.isSendingTransfer} onClick={this.send} variant="primary">
                            {t('send:send')}
                        </Button>
                    </div>
                </section>
                <section>
                    <List
                        filter="sent"
                        transfers={accountInfo.transfers.length ? accountInfo.transfers : []}
                        addresses={Object.keys(accountInfo.addresses)}
                    />
                </section>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    tempAccount: state.tempAccount,
    settings: state.settings,
    account: state.account,
    seeds: state.seeds,
});

const mapDispatchToProps = {
    showError,
    sendTransferRequest,
};

export default translate('send')(connect(mapStateToProps, mapDispatchToProps)(Send));
