import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import Button from 'components/UI/Button';
import css from './Modal.css';

export default class Modal extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        hideCloseButton: PropTypes.bool,
        isOpen: PropTypes.bool,
        onOpen: PropTypes.func,
        onClose: PropTypes.func,
        onStateChange: PropTypes.func,
    };

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown, false);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown, false);
    }

    onKeyDown = e => {
        if (e.which === 27 && this.props.isOpen) {
            this.close();
        }
    };

    onOpen = () => {
        if (typeof this.props.onOpen === 'function') {
            return this.props.onOpen();
        }
    };

    onClose = () => {
        if (typeof this.props.onClose === 'function') {
            return this.props.onClose();
        }
    };

    onStateChange = newState => {
        if (typeof this.props.onStateChange === 'function') {
            return this.props.onStateChange(newState);
        }
    };

    close = () => {
        this.onStateChange(false);
        this.onClose();
    };

    render() {
        const { className, hideCloseButton, isOpen } = this.props;

        if (!isOpen) {
            return null;
        }

        return ReactDOM.createPortal(
            <div
                ref={node => {
                    this.backdropEl = node;
                }}
                className={classNames(css.backdrop, css[className])}
            >
                <div className={css.wrapper}>
                    {!hideCloseButton && (
                        <Button className="square" onClick={this.close}>
                            X
                        </Button>
                    )}
                    <div className={css.content}>{this.props.children}</div>
                </div>
            </div>,
            document.getElementById('modal'),
        );
    }
}
