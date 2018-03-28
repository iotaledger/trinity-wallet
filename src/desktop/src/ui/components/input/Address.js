import React from 'react';
import QrReader from 'react-qr-reader';
import PropTypes from 'prop-types';
import { ADDRESS_LENGTH, VALID_ADDRESS_WITH_CHECKSUM_REGEX } from 'libs/util';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import css from './input.css';

/**
 * Address input component
 */
export default class AddressInput extends React.PureComponent {
    static propTypes = {
        /** Current address value */
        address: PropTypes.string.isRequired,
        /** Address input label */
        label: PropTypes.string.isRequired,
        /** Camera modal close button label */
        closeLabel: PropTypes.string.isRequired,
        /** Address change event function
         * @param {string} address - Current address value
         * @param {string} message - Current message value
         * @param {string} value - Current value
         */
        onChange: PropTypes.func.isRequired,
    };

    state = {
        showScanner: false,
    };

    onScanEvent = (data) => {
        if (data !== null) {
            this.setState(() => ({
                showScanner: false,
            }));

            let address = data;
            let message = null;
            let ammount = null;

            try {
                const json = JSON.parse(data);

                if (json.address) {
                    address = json.address;
                }
                if (json.message && typeof json.message === 'string' && json.message.length < 256) {
                    message = json.message;
                }
                if (json.ammount && json.ammount === parseInt(json.ammount, 10)) {
                    ammount = parseInt(json.ammount, 10);
                }
            } catch (error) {}

            if (address.match(VALID_ADDRESS_WITH_CHECKSUM_REGEX)) {
                this.props.onChange(address, message, ammount);
            }
        }
    };

    closeScanner = () => {
        this.setState(() => ({
            showScanner: false,
        }));
    };

    openScanner = () => {
        this.setState(() => ({
            showScanner: true,
        }));
    };

    render() {
        const { address, label, closeLabel } = this.props;
        const { showScanner } = this.state;

        return (
            <div className={css.input}>
                <fieldset>
                    <a onClick={this.openScanner}>
                        <Icon icon="camera" size={16} />
                    </a>
                    <input
                        type="text"
                        value={address}
                        onChange={(e) => this.props.onChange(e.target.value)}
                        maxLength={ADDRESS_LENGTH}
                    />
                    <small>{label}</small>
                </fieldset>
                {showScanner && (
                    <Modal isOpen onClose={this.closeScanner}>
                        <div className={css.qrScanner}>
                            <QrReader delay={350} onScan={this.onScanEvent} />
                            <Button type="button" onClick={this.closeScanner} variant="primary">
                                {closeLabel}
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        );
    }
}
