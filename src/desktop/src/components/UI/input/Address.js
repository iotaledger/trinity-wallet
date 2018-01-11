import React from 'react';
import QrReader from 'react-qr-reader';
import PropTypes from 'prop-types';
import { ADDRESS_LENGTH } from 'libs/util';
import css from 'components/UI/input/Input.css';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

import Camera from 'images/camera-white.png';

export default class AddressInput extends React.PureComponent {
    static propTypes = {
        address: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
        closeLabel: PropTypes.string.isRequired,
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

    onScanError = (err) => {
        console.log(err);
    };

    closeScanner = (e) => {
        e.preventDefault();
        this.setState(() => ({
            showScanner: false,
        }));
    };

    openScanner = (e) => {
        e.preventDefault();
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
                        <img src={Camera} alt="" />
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
                    <Modal isOpen onStateChange={(showScanner) => this.setState({ showScanner })} hideCloseButton>
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
