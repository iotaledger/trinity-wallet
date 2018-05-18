import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Confirm from 'ui/components/modal/Confirm';
import Password from 'ui/components/modal/Password';
import Button from 'ui/components/Button';

import { generateAlert } from 'actions/alerts';
import css from './modals.scss';

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
        passwordOn: false,
        warningOn: false,
    };

    render() {
        return (
            <div className={css.modals}>
                <h1>Modals</h1>
                <Button onClick={() => this.setState({ confirmOn: true })} variant="primary">
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
                <Button onClick={() => this.setState({ passwordOn: true })} variant="secondary">
                    With input
                </Button>
                <Password
                    isOpen={this.state.passwordOn}
                    content={{
                        title: 'Enter password to continue',
                        confirm: 'Ok',
                        cancel: 'Cancel',
                    }}
                    onClose={() => this.setState({ passwordOn: false })}
                    onSuccess={() => this.setState({ passwordOn: false })}
                />
                <Button onClick={() => this.setState({ warningOn: true })} variant="negative">
                    Negative
                </Button>
                <Confirm
                    isOpen={this.state.warningOn}
                    category="negative"
                    content={{
                        title: 'Are you sure?',
                        message: 'The thing you want to do is dangerous',
                        confirm: 'Yes',
                        cancel: 'No',
                    }}
                    onCancel={() => this.setState({ warningOn: false })}
                    onConfirm={() => this.setState({ warningOn: false })}
                />
                <hr />
                <h1>Alerts</h1>
                <Button
                    onClick={() =>
                        this.props.generateAlert('success', 'All fine!', 'The thing you did, finished up just fine!')
                    }
                    variant="positive"
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
