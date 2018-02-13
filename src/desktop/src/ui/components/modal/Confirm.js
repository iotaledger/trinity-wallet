import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import css from './modal.css';

/**
 * Confirmation window component
 */
export default class Confirm extends React.PureComponent {
    static propTypes = {
        /** Confirm window visibility state */
        isOpen: PropTypes.bool.isRequired,
        /** Confirm window type */
        category: PropTypes.oneOf(['primary', 'secondary', 'positive', 'negative', 'highlight', 'extra']),
        /** Confirm window content */
        content: PropTypes.object.isRequired,
        /** Confirm window cancel function */
        onCancel: PropTypes.func.isRequired,
        /** Confirm window confirm function */
        onConfirm: PropTypes.func.isRequired,
    };

    render() {
        const { category, content, isOpen } = this.props;

        return (
            <Modal variant="confirm" onClose={this.props.onCancel} isOpen={isOpen}>
                {content.title ? <h1 className={category ? css[category] : css.primary}>{content.title}</h1> : null}
                {content.message ? <p>{content.message}</p> : null}
                <footer>
                    <Button onClick={this.props.onCancel} variant="secondary">
                        {content.cancel}
                    </Button>
                    <Button onClick={this.props.onConfirm} variant="positive">
                        {content.confirm}
                    </Button>
                </footer>
            </Modal>
        );
    }
}
