import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isAndroid } from '../util/device';

const mapStateToProps = (state) => ({
    body: state.settings.theme.body,
});

export default () => (C) => {
    class WithBackPressGoToHome extends Component {
        constructor(props) {
            super(props);

            if (isAndroid) {
                this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
            }
        }

        onNavigatorEvent(event) {
            switch (event.id) {
                case 'willAppear':
                    this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
                    break;
                case 'willDisappear':
                    this.backHandler.remove();
                    break;
                default:
                    break;
            }
        }

        handleBackPress = () => {
            const { body } = this.props;
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'home',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: body.bg,
                    },
                },
            });
            return true;
        };

        render() {
            return <C {...this.props} />;
        }
    }

    WithBackPressGoToHome.propTypes = {
        navigator: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
    };

    return connect(mapStateToProps, null)(WithBackPressGoToHome);
};
