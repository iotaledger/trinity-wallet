// Updates global state when keyboard opens/closes. Applies keyboard avoidance globally

import React, { Component } from 'react';
import { Keyboard } from 'react-native';
import PropTypes from 'prop-types';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { setKeyboardActivity } from 'shared-modules/actions/ui';
import { isAndroid } from 'libs/device';

const mapDispatchToProps = {
    setKeyboardActivity,
};

const mapStateToProps = (state) => ({
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
            inactive: PropTypes.bool.isRequired,
            /** @ignore */
            minimised: PropTypes.bool.isRequired,
        };

        componentWillMount() {
            if (isAndroid) {
                this.keyboardWillShowSub = Keyboard.addListener('keyboardDidShow', this.keyboardDidShow);
                this.keyboardWillHideSub = Keyboard.addListener('keyboardDidHide', this.keyboardDidHide);
            } else {
                this.keyboardWillShowSub = Keyboard.addListener('keyboardWillShow', this.keyboardWillShow);
                this.keyboardWillHideSub = Keyboard.addListener('keyboardWillHide', this.keyboardWillHide);
            }
        }

        componentWillUnmount() {
            this.keyboardWillShowSub.remove();
            this.keyboardWillHideSub.remove();
        }

        keyboardWillShow = () => {
            const { inactive, minimised } = this.props;
            if (inactive || minimised) {
                return;
            }
            this.props.setKeyboardActivity(true);
        };

        keyboardWillHide = () => {
            this.props.setKeyboardActivity(false);
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
            return (
                <KeyboardAwareScrollView
                    resetScrollToCoords={{ x: 0, y: 0 }}
                    scrollEnabled={false}
                    extraHeight={0}
                    contentContainerStyle={{ flex: 1 }}
                    keyboardShouldPersistTaps="handled"
                >
                    <C {...this.props} />
                </KeyboardAwareScrollView>
            );
        }
    }

    return connect(mapStateToProps, mapDispatchToProps)(EnhancedComponent);
}
