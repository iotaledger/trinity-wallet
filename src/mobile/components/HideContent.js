import React, { Component } from 'react';
import PropTypes from 'prop-types';
import timer from 'react-native-timer';
import { View, AppState } from 'react-native';
import { connect } from 'react-redux';

export default () => (C) => {
    class WithHideContent extends Component {
        constructor(props) {
            super(props);
            this.state = {
                hidden: false,
            };
        }
        componentDidMount() {
            AppState.addEventListener('change', this.handleAppStateChange);
        }

        componentWillUnmount() {
            AppState.removeEventListener('change', this.handleAppStateChange);
            timer.clearTimeout('background');
        }

        handleAppStateChange = (nextAppState) => {
            this.setState({ hidden: true });

            if (nextAppState.match(/inactive|background/)) {
                this.setState({ hidden: true });
            } else if (nextAppState === 'active') {
                this.setState({ hidden: false });
            }
        };

        render() {
            const { hidden } = this.state;
            const { body } = this.props;
            if (hidden) {
                return <View style={{ backgroundColor: body.bg, flex: 1 }} />;
            }
            return <C {...this.props} />;
        }
    }

    WithHideContent.propTypes = {
        /** Theme setting */
        body: PropTypes.object.isRequired,
    };

    const mapStateToProps = (state) => ({
        body: state.settings.theme.body,
    });

    return connect(mapStateToProps, null)(WithHideContent);
};
