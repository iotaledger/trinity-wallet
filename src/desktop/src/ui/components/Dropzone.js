import React from 'react';
import PropTypes from 'prop-types';

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

    componentWillUnmount() {
        document.removeEventListener('dragenter', this.onDragEnter);
        document.removeEventListener('dragover', this.onDragOver);
        document.removeEventListener('dragleave', this.onDragLeave);
        document.removeEventListener('drop', this.onDrop);
    }

    onDragEnter(e) {
        e.preventDefault();
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

        this.setState({
            isDragActive: false,
        });
    }

    onDrop(e) {
        e.preventDefault();

        const { onDrop } = this.props;

        const file = e.dataTransfer.files[0];
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

    render() {
        return this.state.isDragActive && <div className="dropzone" />;
    }
}

export default Dropzone;
