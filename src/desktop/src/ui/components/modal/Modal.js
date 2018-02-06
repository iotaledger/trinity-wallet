import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './modal.css';

/**
 * Modal window component
 */
export default class Modal extends React.Component {
    static propTypes = {
        /* Modal content */
        children: PropTypes.node,
        /* Modal window type */
        variant: PropTypes.oneOf(['confirm']),
        /* Modal visibility state */
        isOpen: PropTypes.bool,
        /* Modal visibility state */
        onClose: PropTypes.func.isRequired,
    };

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown, false);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown, false);
    }

    onKeyDown = (e) => {
        if (e.which === 27 && this.props.isOpen) {
            this.props.onClose();
        }
    };

    render() {
        const { variant, isOpen } = this.props;

        if (!isOpen) {
            return null;
        }

        return ReactDOM.createPortal(
            <div className={classNames(css.backdrop, css[variant])}>
                <div className={css.wrapper}>
                    <div className={css.content}>{this.props.children}</div>
                </div>
            </div>,
            document.getElementById('modal'),
        );
    }
}
