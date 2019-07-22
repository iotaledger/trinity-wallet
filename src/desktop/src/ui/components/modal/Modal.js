import React from 'react';
import ReactDOM from 'react-dom';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './modal.scss';

/**
 * Modal window component
 */
export default class Modal extends React.Component {
    static propTypes = {
        /** Modal content */
        children: PropTypes.oneOfType([PropTypes.node, PropTypes.array]),
        /** Modal window type */
        variant: PropTypes.oneOf(['confirm', 'global', 'fullscreen']),
        /** Modal visibility state */
        isOpen: PropTypes.bool,
        /** Should the dialog be without a cancel option */
        isForced: PropTypes.bool,
        /** Modal inline style state */
        inline: PropTypes.bool,
        /** Modal visibility state */
        onClose: PropTypes.func.isRequired,
    };

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown, false);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown, false);
    }

    onKeyDown = (e) => {
        if (e.key === 'Escape' && this.props.isOpen && !this.props.isForced) {
            this.props.onClose();
        }
    };

    render() {
        const { variant, isOpen, inline } = this.props;

        const content = (
            <div className={classNames(css.backdrop, css[variant], !isOpen ? css.hidden : null)}>
                <div className={css.wrapper}>
                    <div className={css.content}>{this.props.children}</div>
                </div>
            </div>
        );

        return inline ? content : ReactDOM.createPortal(content, document.getElementById('modal'));
    }
}
