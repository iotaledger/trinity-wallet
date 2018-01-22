import React from 'react';
import PropTypes from 'prop-types';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

export default class Confirm extends React.PureComponent {
    static propTypes = {
        isOpen: PropTypes.bool.isRequired,
        category: PropTypes.oneOf(['primary', 'secondary', 'success', 'warning', 'danger', 'info', 'extra']),
        translations: PropTypes.object.isRequired,
        onCancel: PropTypes.func.isRequired,
        onConfirm: PropTypes.func.isRequired,
    };

    render() {
        const { category, translations, isOpen } = this.props;

        return (
            <Modal className="confirm" isOpen={isOpen} hideCloseButton>
                {translations.title ? <h1 className={category ? category : 'primary'}>{translations.title}</h1> : null}
                {translations.message ? <p>{translations.message}</p> : null}
                <footer>
                    <Button onClick={this.props.onCancel} variant="secondary">
                        {translations.cancel}
                    </Button>
                    <Button onClick={this.props.onConfirm} variant="success">
                        {translations.confirm}
                    </Button>
                </footer>
            </Modal>
        );
    }
}
