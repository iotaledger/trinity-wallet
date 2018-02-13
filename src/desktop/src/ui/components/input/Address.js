import React from 'react';
import QrReader from 'react-qr-reader';
import PropTypes from 'prop-types';
import { ADDRESS_LENGTH } from 'libs/util';

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
         * @param {string} value - Current address value
         */
        onChange: PropTypes.func.isRequired,
    };

    state = {
        showScanner: false,
    };

    onScanEvent = (address) => {
        if (address !== null) {
            this.setState(() => ({
                showScanner: false,
            }));
            this.props.onChange(address);
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
