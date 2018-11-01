import React from 'react';
import QrReader from 'react-qr-reader';
import ReactTooltip from 'react-tooltip';
import PropTypes from 'prop-types';
import { ADDRESS_LENGTH, parseAddress } from 'libs/iota/utils';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import css from './input.scss';

/**
 * Address input component
 */
export default class Address extends React.PureComponent {
    static propTypes = {
        /** Current address value */
        address: PropTypes.string.isRequired,
        /** Address input label */
        label: PropTypes.string.isRequired,
        /** Should input focus when changed to true */
        focus: PropTypes.bool,
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
        inputFocused: false
    };

    componentDidMount() {
        if (this.props.focus) {
            this.input.focus();
        }
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.focus && nextProps.focus) {
            this.input.focus();
        }
    }

    onScanEvent = (data) => {
        if (data !== null) {
            this.setState(() => ({
                showScanner: false,
            }));
            const input = parseAddress(data);
            this.props.onChange(input.address, input.message, input.amount);
        }
    };

    handleFocus = () => {
        this.setState(() => ({
            inputFocused: true,
        }));
    };

    handleBlur = () => {
        this.setState(() => ({
            inputFocused: false,
        }));
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

    /**
     * Address is displayed in a hidden <p> element used for calculating the width of address input.
     * @returns boolean - if entered address is longer than input width
     */
    isInputScrolling = () => {
        if (this.input && this.address) {
            return this.address.clientWidth > this.input.clientWidth;
        }
        return false;
    };

    render() {
        const { address, label, closeLabel } = this.props;
        const { showScanner, inputFocused } = this.state;

        return (
            <div className={css.input}>
                <fieldset>
                    <a onClick={this.openScanner}>
                        <Icon icon="camera" size={16} />
                    </a>
                    <input
                        type="text"
                        ref={(input) => {
                            this.input = input;
                        }}
                        value={address}
                        onChange={(e) => this.props.onChange(e.target.value)}
                        onFocus={() => this.handleFocus()}
                        onBlur={() => this.handleBlur()}
                        maxLength={ADDRESS_LENGTH}
                        data-tip={address}
                    />
                    <small>{label}</small>
                    <p ref={(address) => {this.address = address;}} className={css.addressHidden}>
                        {address}
                    </p>
                    {!inputFocused && this.isInputScrolling() && (
                        <ReactTooltip
                            place="bottom"
                            className={css.tooltip}
                        />
                    )}
                </fieldset>
                {showScanner && (
                    <Modal isOpen onClose={this.closeScanner}>
                        <div className={css.qrScanner}>
                            <QrReader delay={350} onScan={this.onScanEvent} onError={() => {}} />
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
