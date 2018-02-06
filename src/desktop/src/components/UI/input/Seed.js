import React from 'react';
import QrReader from 'react-qr-reader';
import PropTypes from 'prop-types';
import { MAX_SEED_LENGTH } from 'libs/util';
import { getChecksum } from 'libs/iota';
import css from 'components/UI/input/Input.css';
import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';

import Icon from 'ui/components/Icon';

export default class SeedInput extends React.PureComponent {
    static propTypes = {
        seed: PropTypes.string.isRequired,
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
        const { seed, label, closeLabel, onChange } = this.props;
        const { showScanner } = this.state;

        return (
            <div className={css.input}>
                <fieldset>
                    <a onClick={this.openScanner}>
                        <Icon icon="camera" size={16} />
                    </a>
                    <input
                        type="text"
                        value={seed}
                        onChange={(e) => onChange(e.target.value.toUpperCase())}
                        maxLength={MAX_SEED_LENGTH}
                    />
                    <small>{label}</small>
                </fieldset>
                {seed.length ? (
                    <span className={css.info}>{seed.length < MAX_SEED_LENGTH ? '< 81' : getChecksum(seed)}</span>
                ) : null}
                {showScanner && (
                    <Modal
                        isOpen
                        onClose={this.closeScanner}
                        onStateChange={(showScanner) => this.setState({ showScanner })}
                    >
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
