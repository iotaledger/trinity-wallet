import React, { Component } from 'react';
import { Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import timer from 'react-native-timer';
import { setKeyboardActivity } from 'shared-modules/actions/ui';
import { isAndroid } from 'libs/device';

const mapDispatchToProps = {
    setKeyboardActivity,
};

const mapStateToProps = (state) => ({
    isKeyboardActive: state.ui.isKeyboardActive,
    inactive: state.ui.inactive,
    minimised: state.ui.minimised,
});

/**
 * Handles back button events on Android by wrapping a component
 * @param {Component} C Component to be wrapped
 * @return {Component} A wrapped component
 */
export default function withKeyboardMonitor(C) {
    class EnhancedComponent extends Component {
        static propTypes = {
            /** @ignore */
            setKeyboardActivity: PropTypes.func.isRequired,
            /** @ignore */
            isKeyboardActive: PropTypes.bool.isRequired,
            /** @ignore */
            inactive: PropTypes.bool.isRequired,
            /** @ignore */
            minimised: PropTypes.bool.isRequired,
        };

        componentWillMount() {
            if (!isAndroid) {
                this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
                this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
            }
            if (isAndroid) {
                this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
                this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
            }
        }

        componentWillUnmount() {
            this.keyboardWillShowSub.remove();
            this.keyboardWillHideSub.remove();
            timer.clearTimeout('iOSKeyboardTimeout');
        }

        keyboardWillShow = () => {
            const { inactive, minimised } = this.props;
            if (inactive || minimised) {
                return;
            }
            this.props.setKeyboardActivity(true);
        };

        keyboardWillHide = (event) => {
            timer.setTimeout('iOSKeyboardTimeout', () => this.props.setKeyboardActivity(false), event.duration);
        };

        keyboardDidShow = () => {
            const { inactive, minimised } = this.props;
            if (inactive || minimised) {
                return;
            }
            this.props.setKeyboardActivity(true);
        };

        keyboardDidHide = () => {
            this.props.setKeyboardActivity(false);
        };

        render() {
            return <C {...this.props} />;
        }
    }

    return connect(mapStateToProps, mapDispatchToProps)(EnhancedComponent);
}
