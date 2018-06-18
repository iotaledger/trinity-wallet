/* global Electron */
import React from 'react';
import QrReader from 'react-qr-reader';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'libs/iota/utils';
import { byteToChar } from 'libs/crypto';

import { generateAlert } from 'actions/alerts';

import Modal from 'ui/components/modal/Modal';
import Password from 'ui/components/modal/Password';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import Dropzone from 'ui/components/Dropzone';

import css from './input.scss';

/**
 * Seed input component
 */
class SeedInput extends React.PureComponent {
    static propTypes = {
        /** Current seed value */
        seed: PropTypes.array.isRequired,
        /** Seed input label */
        label: PropTypes.string.isRequired,
        /** Should input focus when changed to true */
        focus: PropTypes.bool,
        /** Camera modal close label */
        closeLabel: PropTypes.string.isRequired,
        /** Seed change event function
         * @param {string} value - Current seed value
         */
        onChange: PropTypes.func.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        showScanner: false,
        importBuffer: null,
        cursor: 0,
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

    componentDidUpdate() {
        if (this.input && this.props.seed && this.props.seed.length >= this.state.cursor) {
            const range = document.createRange();
            const sel = window.getSelection();
            range.setStart(this.input, this.state.cursor);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            this.input.scrollLeft = range.startOffset * 10;
        }
    }

    onScanEvent = (input) => {
        if (input && input.match(VALID_SEED_REGEX) && input.length === MAX_SEED_LENGTH) {
            this.setState(() => ({
                showScanner: false,
            }));

            const seed = input.split('').map((char) => '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char.toUpperCase()));
            Electron.garbageCollect();

            this.props.onChange(seed);
        }
    };

    onPaste = (e) => {
        e.preventDefault();
        let clipboard = e.clipboardData
            .getData('Text')
            .split('')
            .map((char) => '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(char.toUpperCase()))
            .filter((char) => char > -1);

        const cursor = this.getCursor(this.input);

        const seed = this.props.seed
            .slice(0, Math.min(...cursor))
            .concat(clipboard, this.props.seed.slice(Math.max(...cursor)))
            .slice(0, MAX_SEED_LENGTH);

        this.setState({
            cursor: Math.min(Math.min(...cursor) + clipboard.length, MAX_SEED_LENGTH),
        });

        this.props.onChange(seed);

        // Hotfix: If paste happens on first render, the content of all attributes display the same content
        setTimeout(() => {
            this.props.onChange([]);
            this.props.onChange(seed);
        }, 10);

        clipboard = null;
        Electron.garbageCollect();

        return false;
    };

    onDrop = async (buffer) => {
        this.setState({
            importBuffer: buffer,
        });
    };

    getCursor = (element) => {
        const range = document.getSelection().getRangeAt(0);

        const preCaretRange = range.cloneRange();
        preCaretRange.selectNodeContents(element);
        preCaretRange.setEnd(range.endContainer, range.endOffset);
        const start = preCaretRange.toString().length;

        const postCaretRange = range.cloneRange();
        postCaretRange.selectNodeContents(element);
        postCaretRange.setEnd(range.startContainer, range.startOffset);
        const end = postCaretRange.toString().length;

        return [start, end];
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

    decryptFile = async (password) => {
        const { generateAlert, t } = this.props;

        try {
            const seed = await Electron.importSeed(this.state.importBuffer, password);

            this.props.onChange(seed);

            this.setState({
                importBuffer: null,
            });

            Electron.garbageCollect();
        } catch (error) {
            if (error.code === 'InvalidKey') {
                generateAlert('error', t('unrecognisedPassword'), t('unrecognisedPasswordExplanation'));
            } else {
                generateAlert('error', 'Error opening keystore file', 'There was an error opening keystore file');
            }
        }
    };

    keyDown = (e) => {
        const key = e.key;

        if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(key) > -1) {
            return true;
        }

        const byte = '9ABCDEFGHIJKLMNOPQRSTUVWXYZ'.indexOf(key.toUpperCase());

        if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            if (byte > -1 || key === 'Backspace') {
                const cursor = this.getCursor(this.input);

                let seed = this.props.seed.slice(0);
                let cursorPos = cursor[0] <= cursor[1] ? cursor[0] + 1 : cursor[1] + 1;

                if (key === 'Backspace') {
                    if (this.props.seed.length > 0) {
                        if (cursor[0] === cursor[1] && cursor[0] > 0) {
                            seed.splice(cursor[0] - 1, 1);
                            cursorPos = Math.max(cursor[0] - 1, 0);
                        } else {
                            seed.splice(Math.min(...cursor), Math.abs(cursor[0] - cursor[1]));
                            cursorPos = Math.min(...cursor);
                        }
                    }
                } else {
                    seed.splice(Math.min(...cursor), Math.abs(cursor[0] - cursor[1]), byte);
                }

                if (seed.length > MAX_SEED_LENGTH) {
                    seed = null;
                    return;
                }

                this.setState({
                    cursor: seed.length ? cursorPos : 0,
                });

                this.props.onChange(seed);

                seed = null;
            }
        }
    };

    render() {
        const { seed, label, closeLabel } = this.props;
        const { importBuffer, showScanner } = this.state;

        const checkSum = seed.length < MAX_SEED_LENGTH ? '< 81' : Electron.getChecksum(seed);

        return (
            <div className={css.input}>
                <fieldset>
                    <a onClick={this.openScanner}>
                        <Icon icon="camera" size={16} />
                    </a>
                    <div className={css.editable}>
                        <div
                            ref={(input) => {
                                this.input = input;
                            }}
                            onKeyDown={this.keyDown}
                            onPaste={this.onPaste}
                            contentEditable
                            suppressContentEditableWarning
                        >
                            {seed.map((byte, index) => {
                                const letter = byteToChar(byte);
                                return (
                                    <span className={css.letter} data-letter={letter} key={`${index}-${byte}`}>
                                        &nbsp;
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    <small>{label}</small>
                </fieldset>
                {seed.length ? <span className={css.info}>{checkSum}</span> : null}
                {showScanner && (
                    <Modal isOpen onClose={this.closeScanner}>
                        <div className={css.qrScanner}>
                            <QrReader delay={350} onScan={this.onScanEvent} onError={() => {}} />
                            <Button type="button" onClick={this.closeScanner} variant="secondary">
                                {closeLabel}
                            </Button>
                        </div>
                    </Modal>
                )}
                <Dropzone onDrop={this.onDrop} />
                {importBuffer && (
                    <Password
                        content={{
                            title: 'Enter password',
                            message: 'Enter password to open the keyfile',
                            confirm: 'Open',
                        }}
                        isOpen
                        onClose={() => this.setState({ importBuffer: null })}
                        onSubmit={(password) => this.decryptFile(password)}
                    />
                )}
            </div>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

export default connect(
    null,
    mapDispatchToProps,
)(translate()(SeedInput));
