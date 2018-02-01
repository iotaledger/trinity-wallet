import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './Modal.css';

export default class Modal extends React.Component {
    static propTypes = {
        children: PropTypes.node,
        className: PropTypes.string,
        isOpen: PropTypes.bool,
        isConfirm: PropTypes.bool,
        onClose: PropTypes.func.isRequired,
    };

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown, false);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown, false);
    }

    onKeyDown = e => {
        if (e.which === 27 && this.props.isOpen) {
            this.props.onClose();
        }
    };

    render() {
        const { className, isOpen, isConfirm } = this.props;

        if (!isOpen) {
            return null;
        }

        return ReactDOM.createPortal(
            <div className={classNames(css.backdrop, css[className], isConfirm ? css.confirm : null)}>
                <div className={css.wrapper}>
                    <div className={css.content}>{this.props.children}</div>
                </div>
            </div>,
            document.getElementById('modal'),
        );
    }
}
