/* global Electron */
import React from 'react';
import QrReader from 'react-qr-reader';
import classNames from 'classnames';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { MAX_SEED_LENGTH, VALID_SEED_REGEX } from 'libs/iota/utils';
import { MAX_ACC_LENGTH } from 'libs/crypto';
import { byteToChar, charToByte } from 'libs/iota/converter';

import { generateAlert } from 'actions/alerts';

import { setAccountInfoDuringSetup } from 'actions/accounts';
import Modal from 'ui/components/modal/Modal';
import Password from 'ui/components/modal/Password';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';
import Dropzone from 'ui/components/Dropzone';
import Select from 'ui/components/input/Select';

import css from './input.scss';

/**
 * Seed input component
 */
export class SeedComponent extends React.PureComponent {
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
         * @param {array} value - Current seed value
         */
        onChange: PropTypes.func.isRequired,
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        /** Should the onboarding name be updated to imported SeedVault account name */
        updateImportName: PropTypes.bool,
        /** Create a notification message
         * @param {string} type - notification type - success, error
         * @param {string} title - notification title
         * @param {string} text - notification explanation
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
        hidden: true,
        cursor: 0,
        accounts: [],
        accountIndex: -1,
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
            try {
                const range = document.createRange();
                const sel = window.getSelection();
                range.setStart(this.input, this.state.cursor);
                range.collapse(true);
                sel.removeAllRanges();
                sel.addRange(range);
                this.input.scrollLeft = range.startOffset * 10;
            } catch (error) {
                console.log(error); //eslint-disable-line no-console
            }
        }
    }

    onScanEvent = (input) => {
        if (input && input.match(VALID_SEED_REGEX) && input.length === MAX_SEED_LENGTH) {
            this.setState(() => ({
                showScanner: false,
            }));

            const seed = input.split('').map((char) => charToByte(char));

            input = null;

            Electron.garbageCollect();

            this.props.onChange(seed);
        }
    };

    onPaste = (e) => {
        const { t } = this.props;
        this.props.generateAlert(
            'info',
            t('seedReentry:clipboardWarning'),
            t('seedReentry:clipboardWarningExplanation'),
        );
        e.preventDefault();
    };

    onDrop = async (buffer) => {
        const { t } = this.props;
        if (!buffer) {
            return this.props.generateAlert(
                'error',
                t('seedVault:seedFileError'),
                t('seedVault:seedFileErrorExplanation'),
            );
        }

        const isValidVault = Electron.validateVault(buffer);

        if (!isValidVault) {
            return this.props.generateAlert(
                'error',
                t('seedVault:invalidSeedFileError'),
                t('seedVault:invalidSeedFileErrorExplanation'),
            );
        }

        this.setState({
            importBuffer: buffer,
        });
    };

    /**
     * Set valid length drag&drop seed to state
     * @param {array} seed - Target seed byte array
     */
    onTextDrop = (seed) => {
        const { generateAlert, t } = this.props;
        if (seed.length === MAX_SEED_LENGTH) {
            this.props.onChange(seed);
        } else {
            generateAlert(
                'error',
                seed.length < MAX_SEED_LENGTH ? t('enterSeed:seedTooShort') : t('enterSeed:seedTooLong'),
                t('enterSeed:seedTooShortExplanation', { maxLength: MAX_SEED_LENGTH, currentLength: seed.length }),
            );
        }
        Electron.garbageCollect();
    };

    getCursor = (element) => {
        const selection = document.getSelection();

        if (!selection || selection.rangeCount < 1) {
            return [this.props.seed.length, this.props.seed.length];
        }

        const range = selection.getRangeAt(0);

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

    setVisibility = () => {
        this.setState((prevState) => ({
            hidden: !prevState.hidden,
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

    decryptFile = async (password) => {
        const { generateAlert, updateImportName, t } = this.props;

        try {
            let accounts = await Electron.importSeed(this.state.importBuffer, password);

            this.setState({
                importBuffer: null,
            });

            if (!accounts || !accounts.length) {
                throw Error('SeedNotFound');
            }

            accounts = accounts.filter((account) => {
                return account.seed.length === MAX_SEED_LENGTH;
            });

            if (!accounts.length) {
                throw Error('SeedNotFound');
            } else if (accounts.length === 1) {
                this.props.onChange(accounts[0].seed);

                if (updateImportName && accounts[0].title.length < MAX_ACC_LENGTH) {
                    this.props.setAccountInfoDuringSetup({ name: accounts[0].title });
                }
            } else {
                this.setState({
                    accounts: accounts,
                    accountIndex: -1,
                });
            }

            Electron.garbageCollect();
        } catch (error) {
            if (typeof error.code === 'string' && error.code === 'InvalidKey') {
                generateAlert('error', t('seedVault:unrecognisedKey'), t('seedVault:unrecognisedKeyExplanation'));
            } else if (typeof error.message === 'string' && error.message === 'SeedNotFound') {
                generateAlert('error', t('seedVault:noSeedFound'), t('seedVault:noSeedFoundExplanation'));
            } else {
                generateAlert(
                    'error',
                    t('seedVault:seedFileError'),
                    t('seedVault:seedFileErrorExplanation'),
                    20000,
                    error,
                );
            }
        }
    };

    chooseSeed = (e) => {
        e.preventDefault();
        const account = this.state.accounts[this.state.accountIndex];

        this.props.onChange(account.seed);

        if (this.props.updateImportName && account.title.length < MAX_ACC_LENGTH) {
            this.props.setAccountInfoDuringSetup({ name: account.title });
        }

        this.setState({
            accounts: [],
            accountIndex: -1,
        });
    };

    keyDown = (e) => {
        const key = e.key;

        if (['ArrowRight', 'ArrowLeft', 'ArrowUp', 'ArrowDown'].indexOf(key) > -1) {
            return true;
        }

        const byte = charToByte(key.toUpperCase());

        if (!e.metaKey && !e.ctrlKey) {
            e.preventDefault();
            if (byte > -1 || key === 'Backspace') {
                const cursor = this.getCursor(this.input);

                const seed = this.props.seed.slice(0);
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

                this.setState({
                    cursor: seed.length ? cursorPos : 0,
                });

                this.props.onChange(seed);
            }
        }
    };

    render() {
        const { seed, label, closeLabel, t } = this.props;
        const { importBuffer, accounts, accountIndex, showScanner, hidden } = this.state;

        const checkSum =
            seed.length < MAX_SEED_LENGTH
                ? '< 81'
                : seed.length > MAX_SEED_LENGTH
                ? '> 81'
                : Electron.getChecksum(seed);

        return (
            <div className={classNames(css.input, css.seed)}>
                <fieldset>
                    <a className={hidden ? css.strike : null} onClick={this.setVisibility}>
                        <Icon icon="eye" size={16} />
                    </a>
                    <a className={css.right} onClick={this.openScanner}>
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
                                    <span
                                        className={css.letter}
                                        data-letter={hidden ? '•' : letter}
                                        key={`${index}-${byte}`}
                                    >
                                        &nbsp;
                                    </span>
                                );
                            })}
                        </div>
                    </div>
                    <small>{label}</small>
                </fieldset>
                <Dropzone onDrop={this.onDrop} onTextDrop={this.onTextDrop} />

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

                {importBuffer && (
                    <Password
                        content={{
                            title: t('seedVault:enterKeyExplanation'),
                            confirm: t('seedVault:importSeedVault'),
                        }}
                        isSeedVaultField
                        isOpen
                        onClose={() => this.setState({ importBuffer: null })}
                        onSubmit={(password) => this.decryptFile(password)}
                    />
                )}

                {accounts.length > 0 && (
                    <Modal
                        isOpen
                        onClose={() => this.setState({ accounts: [] })}
                        onSubmit={(password) => this.decryptFile(password)}
                    >
                        <h1>Choose seed</h1>
                        <p>Your SeedFile contains multiple valid seeds, please choose which seed to import</p>
                        <Select
                            value={accountIndex > -1 ? accounts[accountIndex].title : ''}
                            label={t('addAdditionalSeed:accountName')}
                            onChange={(value) => this.setState({ accountIndex: value })}
                            options={accounts.map((account, index) => {
                                return { value: index, label: account.title };
                            })}
                        />

                        <footer>
                            <Button onClick={() => this.setState({ accounts: [] })} variant="dark">
                                {t('cancel')}
                            </Button>
                            <Button disabled={accountIndex < 0} onClick={this.chooseSeed} variant="primary">
                                {t('seedVault:importSeedVault')}
                            </Button>
                        </footer>
                    </Modal>
                )}
            </div>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
    setAccountInfoDuringSetup,
};

export default connect(null, mapDispatchToProps)(withTranslation()(SeedComponent));
