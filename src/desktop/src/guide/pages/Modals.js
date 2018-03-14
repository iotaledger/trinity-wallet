import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Confirm from 'ui/components/modal/Confirm';
import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';

import { generateAlert } from 'actions/alerts';
import css from './modals.css';

class Modals extends React.PureComponent {
    static propTypes = {
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
    };

    state = {
        confirmOn: false,
        warningOn: false,
        successOn: false,
    };

    render() {
        return (
            <div className={css.modals}>
                <h1>Modals</h1>
                <Button onClick={() => this.setState({ confirmOn: true })} variant="secondary">
                    Confirm
                </Button>
                <Confirm
                    isOpen={this.state.confirmOn}
                    content={{
                        title: 'Are you sure?',
                        confirm: 'Yes',
                        cancel: 'No',
                    }}
                    onCancel={() => this.setState({ confirmOn: false })}
                    onConfirm={() => this.setState({ confirmOn: false })}
                />
                <Button onClick={() => this.setState({ warningOn: true })} variant="negative">
                    Negative
                </Button>
                <Modal
                    variant="confirm"
                    isOpen={this.state.warningOn}
                    onClose={() => this.setState({ warningOn: false })}
                >
                    <h1 className="error">Error occured</h1>
                    <p>Sorry for the trouble - some error occured.</p>
                    <Button onClick={() => this.setState({ warningOn: false })} variant="secondary">
                        Back
                    </Button>
                </Modal>
                <Button onClick={() => this.setState({ successOn: true })} variant="positive">
                    Success
                </Button>
                <Modal
                    variant="confirm"
                    isOpen={this.state.successOn}
                    onClose={() => this.setState({ successOn: false })}
                >
                    <h1 className="success">Successfully done!</h1>
                    <p>The thing you did was succesfull!</p>
                    <Button onClick={() => this.setState({ successOn: false })} variant="secondary">
                        Back
                    </Button>
                </Modal>
                <hr />
                <h1>Alerts</h1>
                <Button
                    onClick={() =>
                        this.props.generateAlert('success', 'All fine!', 'The thing you did, finished up just fine!')
                    }
                    variant="primary"
                >
                    Success
                </Button>
                <Button
                    onClick={() =>
                        this.props.generateAlert(
                            'error',
                            'Something went wrong!',
                            'Something you did was not working as expected!',
                        )
                    }
                    variant="negative"
                >
                    Error
                </Button>
            </div>
        );
    }
}

const mapDispatchToProps = {
    generateAlert,
};

export default connect(null, mapDispatchToProps)(Modals);
