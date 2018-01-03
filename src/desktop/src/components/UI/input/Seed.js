import React from 'react';
import QrReader from 'react-qr-reader';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import { MAX_SEED_LENGTH } from 'libs/util';
import css from './Input.css';
import Modal from 'components/UI/Modal';

import Camera from 'images/camera.png';

export default class SeedInout extends React.PureComponent {
    static propTypes = {
        seed: PropTypes.string.isRequired,
        label: PropTypes.string.isRequired,
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
        const { seed, label, closeLabel } = this.props;
        const { showScanner } = this.state;

        return (
            <div className={css.input}>
                <fieldset>
                    <a onClick={this.openScanner}>
                        <img src={Camera} alt="" />
                    </a>
                    <input
                        type="text"
                        value={seed}
                        onChange={e => this.props.onChange(e.target.value)}
                        maxLength={MAX_SEED_LENGTH}
                    />
                    <small>{label}</small>
                </fieldset>
                {showScanner && (
                    <Modal isOpen={true} onStateChange={showScanner => this.setState({ showScanner })} hideCloseButton>
                        <div className={css.qrScanner}>
                            <QrReader delay={350} onError={this.onScanError} onScan={this.onScanEvent} />
                            <Button type="button" onClick={this.closeScanner} variant="secondary">
                                {closeLabel}
                            </Button>
                        </div>
                    </Modal>
                )}
            </div>
        );
    }
}
