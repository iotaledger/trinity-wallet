import React from 'react';
import QrReader from 'react-qr-reader';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { ADDRESS_LENGTH } from 'libs/util';
import css from './Address.css';
import Button from 'components/UI/Button';
import Modal from 'components/UI/Modal';

import Camera from 'images/camera.png';

export default class AddressInput extends React.PureComponent {
    static propTypes = {
        address: PropTypes.string.isRequired,
        placeholder: PropTypes.string,
        closeLabel: PropTypes.string.isRequired,
    };

    state = {
        showScanner: false,
    };

    openScanner = e => {
        e.preventDefault();
        this.setState(() => ({
            showScanner: true,
        }));
    };

    closeScanner = e => {
        e.preventDefault();
        this.setState(() => ({
            showScanner: false,
        }));
    };

    onScanEvent = address => {
        if (address !== null) {
            this.setState(() => ({
                showScanner: false,
            }));
            this.props.onChange(address);
        }
    };

    onScanError = err => {
        console.log(err);
    };

    render() {
        const { address, placeholder, closeLabel } = this.props;
        const { showScanner } = this.state;

        return (
            <div className={css.addressInput}>
                <div>
                    <input
                        type="text"
                        value={address}
                        placeholder={placeholder}
                        onChange={e => this.props.onChange(e.target.value)}
                        maxLength={ADDRESS_LENGTH}
                    />
                    <small />
                </div>
                <Button onClick={this.openScanner}>
                    <img src={Camera} alt="" /> QR
                </Button>

                {showScanner && (
                    <Modal isOpen={true} onStateChange={showScanner => this.setState({ showScanner })} hideCloseButton>
                        <div className={css.qrScanner}>
                            <QrReader delay={350} onError={this.onScanError} onScan={this.onScanEvent} />
                            <Button type="button" onClick={this.closeScanner} variant="cta">
                                {closeLabel}
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        );
    }
}
