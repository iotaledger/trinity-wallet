import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';

import Icon from 'ui/components/Icon';

import css from './dropzone.scss';

class Dropzone extends React.Component {
    static propTypes = {
        /** File drop callback */
        onDrop: PropTypes.func.isRequired,
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
        e.preventDefault();

        const { onDrop } = this.props;

        const file = e.dataTransfer ? e.dataTransfer.files[0] : e.target.files[0];
        const reader = new FileReader();

        reader.onload = (e) => {
            const buffer = e.target.result;
            onDrop(buffer);
        };

        reader.readAsArrayBuffer(file);

        this.setState({
            isDragActive: false,
        });
    }

    open() {
        this.fileInputEl.value = null;
        this.fileInputEl.click();
    }

    render() {
        const inputAttributes = {
            type: 'file',
            style: { display: 'none' },
            multiple: false,
            onChange: this.onDrop,
            ref: (el) => {
                this.fileInputEl = el;
            },
        };

        return (
            <React.Fragment>
                <h5 onClick={() => this.open()}>
                    <Icon icon="password" size={12} /> import keyfile
                </h5>
                <input {...inputAttributes} />
                <div className={classNames(css.dropzone, this.state.isDragActive && css.active)}>
                    <h1>Drop the keyfile here</h1>
                </div>
            </React.Fragment>
        );
    }
}

export default Dropzone;
