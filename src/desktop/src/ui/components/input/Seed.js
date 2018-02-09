import React from 'react';
import QrReader from 'react-qr-reader';
import PropTypes from 'prop-types';
import { MAX_SEED_LENGTH } from 'libs/util';
import { getChecksum } from 'libs/iota';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import css from './input.css';

/**
 * Seed input component
 */
export default class SeedInput extends React.PureComponent {
    static propTypes = {
        /* Current seed value */
        seed: PropTypes.string.isRequired,
        /* Seed input label */
        label: PropTypes.string.isRequired,
        /* Camera modal close label */
        closeLabel: PropTypes.string.isRequired,
        /* Seed change event function
         * @param {string} value - Current seed value
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
                    <Modal isOpen onClose={this.closeScanner}>
                        <div className={css.qrScanner}>
                            <QrReader delay={350} onScan={this.onScanEvent} />
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
