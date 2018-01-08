import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

export default class Confirm extends React.PureComponent {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        category: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'extra']),
        content: PropTypes.object.isVisible,
        onCancel: PropTypes.func.isRequired,
        onConfirm: PropTypes.func.isRequired,
    };

    render() {
        const { category, content, isOpen } = this.props;

        return (
            <Modal className="confirm" isOpen={isOpen} hideCloseButton>
                {content.title ? <h1 className={category ? category : 'primary'}>{content.title}</h1> : null}
                {content.message ? <p>{content.message}</p> : null}
                <footer>
                    <Button onClick={this.props.onCancel} variant="secondary">
                        {content.cancel}
                    </Button>
                    <Button onClick={this.props.onConfirm} variant="success">
                        {content.confirm}
                    </Button>
                </footer>
            </Modal>
        );
    }
}
