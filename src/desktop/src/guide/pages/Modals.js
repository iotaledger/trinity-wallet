import React from 'react';

import Confirm from 'components/UI/Confirm';
import Modal from 'components/UI/Modal';
import Button from 'components/UI/Button';

import css from './Modals.css';

class Modals extends React.PureComponent {
    state = {
        confirmOn: false,
        warningOn: false,
        successOn: false,
    };

    render() {
        return (
            <div className={css.modals}>
                <Button onClick={() => this.setState({ confirmOn: true })} variant="secondary">
                    Confirm
                </Button>
                <Confirm
                    isOpen={this.state.confirmOn}
                    translations={{
                        title: 'Are you sure?',
                        confirm: 'Yes',
                        cancel: 'No',
                    }}
                    onCancel={() => this.setState({ confirmOn: false })}
                    onConfirm={() => this.setState({ confirmOn: false })}
                />
                <Button onClick={() => this.setState({ warningOn: true })} variant="warning">
                    Warning
                </Button>
                <Modal isConfirm isOpen={this.state.warningOn} onClose={() => this.setState({ warningOn: false })}>
                    <h1 className="error">Error occured</h1>
                    <p>Sorry for the trouble - some error occured.</p>
                    <Button onClick={() => this.setState({ warningOn: false })} variant="primary">
                        Back
                    </Button>
                </Modal>
                <Button onClick={() => this.setState({ successOn: true })} variant="primary">
                    Success
                </Button>
                <Modal isConfirm isOpen={this.state.successOn} onClose={() => this.setState({ successOn: false })}>
                    <h1 className="success">Successfully done!</h1>
                    <p>The thing you did was succesfull!</p>
                    <Button onClick={() => this.setState({ successOn: false })} variant="primary">
                        Back
                    </Button>
                </Modal>
            </div>
        );
    }
}

export default Modals;
