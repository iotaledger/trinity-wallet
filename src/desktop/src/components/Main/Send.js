import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import Textarea from 'react-textarea-autosize';
import Template, { Content } from './Template';
import { VALID_SEED_REGEX, ADDRESS_LENGTH, formatValue, formatUnit } from 'libs/util';
import { sendTransaction, sendTransferRequest } from 'actions/tempAccount';
import { iota } from 'libs/iota';
import { showError } from 'actions/notifications';
import AddressInput from 'components/UI/input/Address';
import AmmountInput from 'components/UI/input/Ammount';
import MessageInput from 'components/UI/input/Message';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

class Send extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seeds: PropTypes.object.isRequired,
        showError: PropTypes.func.isRequired,
        sendTransaction: PropTypes.func.isRequired,
        sendTransferRequest: PropTypes.func.isRequired,
    };

    state = {
        address: '',
        ammount: '0',
        message: '',
        isModalVisible: false,
    };

    onAddressChange = value => {
        this.setState(() => ({
            address: value.replace(/[^a-zA-Z9]*/g, '').toUpperCase(),
        }));
    };

    onAmmountChange = value => {
        this.setState(() => ({
            ammount: value,
        }));
    };

    onMessageChange = value => {
        this.setState(() => ({
            message: value,
        }));
    };

    send = () => {
        const { address, ammount, message } = this.state;
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

        if (parseFloat(ammount) > account.balance) {
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
        const { address, ammount, message } = this.state;
        const { sendTransferRequest, sendTransaction, seeds, account } = this.props;

        this.toggleConfirmation();
        sendTransferRequest();

        const seedInfo = seeds.items[seeds.selectedSeedIndex];
        const accountInfo = account.accountInfo[seedInfo.name];

        sendTransaction(seedInfo.seed, accountInfo, seedInfo.name, address, parseInt(ammount), message);
    };

    render() {
        const { t, settings, account } = this.props;
        const { address, ammount, message, isModalVisible } = this.state;

        return (
            <Template>
                <Content>
                    <section>
                        <Modal
                            className="confirm"
                            isOpen={isModalVisible}
                            onClose={this.toggleConfirmation}
                            hideCloseButton={true}
                        >
                            <h1>
                                You are about to send{' '}
                                <strong>{`${formatValue(ammount)} ${formatUnit(ammount)}`}</strong> to the address:{' '}
                                <br />
                                <strong>{address}</strong>
                            </h1>
                            <Button onClick={this.toggleConfirmation} variant="warning">
                                {t('global:no')}
                            </Button>
                            <Button onClick={this.sendTransfer} variant="success">
                                {t('global:yes')}
                            </Button>
                        </Modal>
                        <AddressInput
                            address={address}
                            onChange={this.onAddressChange}
                            placeholder={t('send:recipientAddress')}
                            closeLabel={t('global:back')}
                        />
                        <AmmountInput
                            ammount={ammount}
                            settings={settings}
                            balance={account.balance}
                            onChange={this.onAmmountChange}
                        />
                        <MessageInput
                            message={message}
                            placeholder={t('send:message')}
                            onChange={this.onMessageChange}
                        />
                        <Button onClick={this.send} variant="success">
                            {t('send:send')}
                        </Button>
                    </section>
                    <section />
                </Content>
            </Template>
        );
    }
}

const mapStateToProps = state => ({
    settings: state.settings,
    account: state.account,
    seeds: state.seeds,
});

const mapDispatchToProps = {
    showError,
    sendTransaction,
    sendTransferRequest,
};

export default translate('send')(connect(mapStateToProps, mapDispatchToProps)(Send));
