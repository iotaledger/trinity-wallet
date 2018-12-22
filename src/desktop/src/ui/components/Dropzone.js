import React from 'react';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import classNames from 'classnames';

import { charToByte } from 'libs/iota/converter';

import Icon from 'ui/components/Icon';

import css from './dropzone.scss';

/**
 * File drag & drop component
 */
class Dropzone extends React.Component {
    static propTypes = {
        /** Succesful file dropped callback
         * @param {buffer} FileBuffer - Droped file content buffer
         * @returns {undefined}
         */
        onDrop: PropTypes.func.isRequired,
        /** Succesful text seed dropped callback
         * @param {array} seed - Seed byte array
         * @returns {undefined}
         */
        onTextDrop: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props, context) {
        super(props, context);

        this.onDragEnter = this.onDragEnter.bind(this);
        this.onDragLeave = this.onDragLeave.bind(this);
        this.onDragOver = this.onDragOver.bind(this);
        this.onDrop = this.onDrop.bind(this);

        this.state = {
            isDragActive: false,
        };
    }

    componentWillMount() {
        document.addEventListener('dragenter', this.onDragEnter);
        document.addEventListener('dragover', this.onDragOver);
        document.addEventListener('dragleave', this.onDragLeave);
        document.addEventListener('drop', this.onDrop);
    }

    componentDidMount() {
        this.parentCount = 0;
    }

    componentWillUnmount() {
        document.removeEventListener('dragenter', this.onDragEnter);
        document.removeEventListener('dragover', this.onDragOver);
        document.removeEventListener('dragleave', this.onDragLeave);
        document.removeEventListener('drop', this.onDrop);
    }

    onDragEnter(e) {
        e.preventDefault();

        ++this.parentCount;

        this.setState({
            isDragActive: true,
        });
    }

    onDragOver(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    }

    onDragLeave(e) {
        e.preventDefault();

        if (--this.parentCount > 0) {
            return;
        }

        this.setState({
            isDragActive: false,
        });
    }

    onDrop(e) {
        e.stopPropagation();
        e.preventDefault();

        try {
            const seed = e.dataTransfer
                .getData('Text')
                .split('')
                .map((char) => charToByte(char.toUpperCase()))
                .filter((byte) => byte > -1);

            this.setState({
                isDragActive: false,
            });

            if (seed.length) {
                return this.props.onTextDrop(seed);
            }
        } catch (err) {}

        const { onDrop } = this.props;

        this.setState({
            isDragActive: false,
        });

        this.parentCount = 0;

        const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];

        if (!file || file.size > 100000) {
            return onDrop(null);
        }

        const reader = new FileReader();

        // Init with empty buffer first
        onDrop([]);

        reader.onload = (e) => {
            const buffer = e.target.result;
            onDrop(buffer);
        };

        reader.readAsArrayBuffer(file);
    }

    open = () => {
        this.fileInput.value = null;
        this.fileInput.click();
    };

    render() {
        const { t } = this.props;
        const inputAttributes = {
            type: 'file',
            style: { display: 'none' },
            multiple: false,
            onChange: this.onDrop,
            ref: (el) => {
                this.fileInput = el;
            },
        };

        return (
            <React.Fragment>
                <h5 onClick={this.open}>
                    <Icon icon="seedVault" size={48} />{' '}
                    <span>
                        <Trans i18nKey="seedVault:dropInstructions">
                            Drop SeedVault or text here <br /> or click to browse
                        </Trans>
                    </span>
                </h5>
                <input {...inputAttributes} />
                <div className={classNames(css.dropzone, this.state.isDragActive && css.active)}>
                    <Icon icon="seedVault" size={160} />
                    <h1>{t('seedVault:dropActive')}</h1>
                </div>
            </React.Fragment>
        );
    }
}

export default connect()(withI18n()(Dropzone));
