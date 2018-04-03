/*global Electron*/
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { setPassword } from 'actions/wallet';

import ModalPassword from 'ui/components/modal/Password';

const events = ['mousemove', 'mousedown', 'keydown', 'touchstart', 'scroll'];

/**
 * User idle lock screen
 * @ignore
 */
class Idle extends React.Component {
    static propTypes = {
        /** Set password state data
         * @param {String} password - Current password
         * @ignore
         */
        setPassword: PropTypes.func.isRequired,
        /** Idle timeout*/
        timeout: PropTypes.number.isRequired,
        /** User authorised state */
        isAuthorised: PropTypes.bool.isRequired,
    };

    state = {
        locked: false,
    };

    componentDidMount() {
        this.attachEvents();
        this.onSetIdle = this.lock.bind(this);
        Electron.onEvent('lockScreen', this.onSetIdle);
    }

    componentWillReceiveProps(nextProps) {
        if (!this.props.isAuthorised && nextProps.isAuthorised) {
            this.handleEvent();
        }
    }

    componentWillUnmount() {
        this.removeEvents();
        Electron.removeEvent('lockScreen', this.onSetIdle);
    }

    lock() {
        if (this.props.isAuthorised) {
            this.props.setPassword('');
            this.setState({ locked: true });
        }
    }

    unlock(password) {
        this.props.setPassword(password);
        this.setState({
            locked: false,
        });
    }

    attachEvents() {
        events.forEach((event) => {
            window.addEventListener(event, this.handleEvent, true);
        });
    }

    removeEvents() {
        events.forEach((event) => {
            window.removeEventListener(event, this.handleEvent, true);
        });
    }

    handleEvent = () => {
        clearTimeout(this.timeout);

        this.timeout = setTimeout(() => {
            if (this.props.isAuthorised) {
                this.lock();
            } else {
                this.handleEvent();
            }
        }, this.props.timeout);
    };

    render() {
        if (!this.state.locked) {
            return null;
        }
        return <ModalPassword isOpen isForced content={{}} onSuccess={(password) => this.unlock(password)} />;
    }
}

const mapStateToProps = (state) => ({
    isAuthorised: state.wallet.ready,
});

const mapDispatchToProps = {
    setPassword,
};

export default connect(mapStateToProps, mapDispatchToProps)(Idle);
