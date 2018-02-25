import React from 'react';
import PropTypes from 'prop-types';
import classNames from 'classnames';
import css from './slideout.css';

/**
 * Modal window component
 */
export default class Modal extends React.Component {
    static propTypes = {
        /** Slideout elements content */
        children: PropTypes.element,
        /** Slideout's active state */
        active: PropTypes.bool.isRequired,
        /** Toggle slideout's visibility */
        onClose: PropTypes.func.isRequired,
    };

    componentDidMount() {
        window.addEventListener('keydown', this.onKeyDown, false);
    }

    componentWillUnmount() {
        window.removeEventListener('keydown', this.onKeyDown, false);
    }

    onKeyDown = (e) => {
        if (e.which === 27 && this.props.active) {
            this.props.onClose();
        }
    };

    render() {
        const { active, onClose } = this.props;
        return (
            <div className={classNames(css.slideout, active ? css.active : null)}>
                <div>{this.props.children}</div>
                <div onClick={() => onClose()} />
            </div>
        );
    }
}
