import React, { Component } from 'react';
import { BackHandler } from 'react-native';
import { Navigation } from 'react-native-navigation';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { isAndroid } from 'libs/device';

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default () => (C) => {
    class WithBackPressGoToHome extends Component {
        constructor(props) {
            super(props);

            if (isAndroid) {
                Navigation.events().bindComponent(this);
            }
        }

        /**
         * Remove back handler
         *
         * @method componentDidDisappear
         */
        componentDidDisappear() {
            if (this.backHandler) {
                this.backHandler.remove();
            }
        }

        /**
         * Add back handler
         *
         * @method componentDidAppear
         */
        componentDidAppear() {
            this.backHandler = BackHandler.addEventListener('hardwareBackPress', this.handleBackPress);
        }

        /**
         * On backpress, navigate to home.
         *
         * @method handleBackPress
         */
        handleBackPress = () => {
            const { theme: { bar, body } } = this.props;

            Navigation.setStackRoot('appStack', {
                component: {
                    name: 'home',
                    options: {
                        animations: {
                            setStackRoot: {
                                enable: false,
                            },
                        },
                        layout: {
                            backgroundColor: body.bg,
                            orientation: ['portrait'],
                        },
                        topBar: {
                            visible: false,
                            drawBehind: true,
                            elevation: 0,
                        },
                        statusBar: {
                            drawBehind: true,
                            backgroundColor: bar.alt,
                        },
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
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    return connect(mapStateToProps, null)(WithBackPressGoToHome);
};
