/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';
import Message from 'ui/components/input/Message';
import Modal from 'ui/components/modal/Modal';
import Info from 'ui/components/Info';
/**
 * Application feedback view
 */
class Feedback extends React.PureComponent {
    static propTypes = {
        /** Current application state */
        state: PropTypes.object.isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {String} translationString - Locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        message: '',
        loading: false,
        open: false,
    };

    componentDidMount() {
        this.onMenuToggle = this.menuToggle.bind(this);
        Electron.onEvent('menu', this.onMenuToggle);
    }

    componentWillUnmount() {
        Electron.removeEvent('menu', this.onMenuToggle);
    }

    menuToggle(item) {
        if (item === 'feedback') {
            this.setState({
                open: true,
            });
        }
    }

    sendFeedback = (e) => {
        const { state, generateAlert } = this.props;
        const { message, loading } = this.state;

        e.preventDefault();

        if (loading) {
            return;
        }

        this.setState({
            loading: true,
        });

        const filteredState = JSON.parse(JSON.stringify(state));
        delete filteredState.keychain;
        delete filteredState.marketData.chartData;
        delete filteredState.accounts.accountNames;
        delete filteredState.accounts.accountInfo;
        delete filteredState.settings.availableNodes;
        delete filteredState.settings.theme;
        delete filteredState.settings.availablePoWNodes;
        delete filteredState.settings.availableCurrencies;
        delete filteredState.polling.allPollingServices;

        fetch('https://trinity-alpha.iota.org', {
            method: 'POST',
            body: JSON.stringify({ issue: message, state: filteredState }),
            headers: {
                'content-type': 'application/json',
            },
        })
            .then(() => {
                this.setState({
                    message: '',
                    loading: false,
                    open: false,
                });

                generateAlert('success', 'Feedback submitted!', 'The feedback was submitted succesfully!');
            })
            .catch(() => {
                generateAlert('error', 'Error sending feedback', 'Something went wrong :/');
                this.setState({
                    loading: false,
                });
            });
    };

    render() {
        const { open, message, loading } = this.state;
        const { t } = this.props;

        return (
            <Modal isOpen={open} onClose={() => this.setState({ open: false })}>
                <form onSubmit={(e) => this.sendFeedback(e)}>
                    <h1>Feedback report</h1>
                    <p>
                        Describe <strong>what you tried to do</strong> and the <strong>problem you encountered</strong>
                    </p>
                    <Message
                        message={message}
                        label={t('send:message')}
                        onChange={(value) => this.setState({ message: value })}
                    />
                    <Info>
                        An anonymised state of the application will be sent together with your message. No sensitive
                        information (e.g. seeds, password, addresses or balance) will leave your computer.
                    </Info>
                    <footer>
                        <Button onClick={() => this.setState({ open: false })} variant="secondary">
                            {t('cancel')}
                        </Button>
                        <Button type="submit" loading={loading} variant="positive">
                            {t('send:send')}
                        </Button>
                    </footer>
                </form>
            </Modal>
        );
    }
}

const mapStateToProps = (state) => ({
    state: state,
});

const mapDispatchToProps = {
    generateAlert,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Feedback));
