import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
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

    state = {
        isOpen: this.props.isOpen,
    };

    componentWillReceiveProps(nextProps) {
        if (nextProps.isOpen !== this.state.isOpen) {
            this.toggle(nextProps.isOpen);
        }
    }

    // TODO: add an keyDown [esc] == close function here
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

    toggle = isOpen => {
        const doneCallback = () => {
            this.onStateChange(this.state.isOpen);
            this.state.isOpen ? this.onOpen() : this.onClose();
        };
        if (isOpen === true || isOpen === false) {
            return this.setState(() => {
                return {
                    isOpen: isOpen,
                };
            }, doneCallback);
        }
        return this.setState(
            state => ({
                isOpen: !state.isOpen,
            }),
            doneCallback,
        );
    };

    close = () => {
        this.setState(
            () => ({
                isOpen: false,
            }),
            () => {
                this.onStateChange(false);
                this.onClose();
            },
        );
    };

    render() {
        const { isOpen } = this.state;
        const { className, hideCloseButton } = this.props;

        if (!isOpen) {
            return null;
        }

        return ReactDOM.createPortal(
            <div
                ref={node => {
                    this.backdropEl = node;
                }}
                className={classNames(css.backdrop, className)}
                onClick={e => e.target === this.backdropEl && this.close()}
            >
                <div className={css.wrapper}>
                    {!hideCloseButton && <button onClick={this.close}>X</button>}
                    <div className={css.content}>{this.props.children}</div>
                </div>
            </div>,
            document.getElementById('modal'),
        );
    }
}
