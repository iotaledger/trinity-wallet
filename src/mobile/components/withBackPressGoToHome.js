import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

const mapStateToProps = state => ({
    backgroundColor: state.settings.theme.backgroundColor,
});

export default () => C => {
    class WithBackPressGoToHome extends Component {
        constructor(props) {
            super(props);
            this.props.navigator.setOnNavigatorEvent(this.onNavigatorEvent.bind(this));
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
            Navigation.startSingleScreenApp({
                screen: {
                    screen: 'home',
                    navigatorStyle: {
                        navBarHidden: true,
                        navBarTransparent: true,
                        screenBackgroundColor: this.props.backgroundColor,
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
        backgroundColor: PropTypes.string.isRequired,
    };

    return connect(mapStateToProps, null)(WithBackPressGoToHome);
};
