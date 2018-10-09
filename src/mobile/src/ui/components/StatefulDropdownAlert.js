import { translate } from 'react-i18next';
import React, { Component } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import { Navigation } from 'react-native-navigation';
import PropTypes from 'prop-types';
import { disposeOffAlert } from 'shared-modules/actions/alerts';
import { connect } from 'react-redux';
import tinycolor from 'tinycolor2';
import DropdownAlert from 'react-native-dropdownalert/DropdownAlert';
import { width, height } from 'libs/dimensions';
import { isAndroid, isIPhoneX } from 'libs/device';
import { Styling, getBackgroundColor } from 'ui/theme/general';

const errorIcon = require('shared-modules/images/error.png');
const successIcon = require('shared-modules/images/successIcon.png');
const warnIcon = require('shared-modules/images/warnIcon.png');
const infoIcon = require('shared-modules/images/infoIcon.png');

const styles = StyleSheet.create({
    dropdownTitle: {
        fontSize: Styling.fontSize3,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        paddingLeft: width / 20,
        paddingRight: width / 15,
        paddingVertical: height / 30,
    },
    dropdownMessage: {
        fontSize: Styling.fontSize2,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        paddingTop: height / 60,
    },
    dropdownImage: {
        marginLeft: width / 25,
        width: width / 15,
        height: width / 15,
        alignSelf: 'center',
    },
});

class StatefulDropdownAlert extends Component {
    static propTypes = {
        /** @ignore */
        alerts: PropTypes.object.isRequired,
        /** @ignore */
        disposeOffAlert: PropTypes.func.isRequired,
        /** @ignore */
        closeInterval: PropTypes.number,
        /**
         * Returns this component instance to the parent component
         *
         * @param {object} component instance
         */
        onRef: PropTypes.func,
        /** @ignore */
        isModalActive: PropTypes.bool.isRequired,
        /** @ignore */
        hasConnection: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        closeInterval: 5500,
    };

    constructor() {
        super();
        this.refFunc = this.refFunc.bind(this);
        this.state = {
            currentScreen: '',
        };
    }

    componentWillMount() {
        Navigation.events().registerComponentDidAppearListener((componentId) => {
            this.setState({ currentScreen: componentId.componentName });
        });
        Navigation.events().registerComponentDidDisappearListener(() => {
            if (this.dropdown) {
                this.dropdown.close();
            }
        });
    }

    componentDidMount() {
        this.generateAlertWhenNoConnection();
    }

    componentWillReceiveProps(newProps) {
        const { alerts, isModalActive, theme } = this.props;
        const hasAnAlert = newProps.alerts.category && newProps.alerts.title && newProps.alerts.message;
        const alertIsNew = alerts.message !== newProps.alerts.message;
        const alertIsNotEmpty = newProps.alerts.message !== '';
        const shouldGenerateAlert = hasAnAlert && alertIsNew && alertIsNotEmpty;

        if (shouldGenerateAlert) {
            if (this.dropdown) {
                this.dropdown.alertWithType(newProps.alerts.category, newProps.alerts.title, newProps.alerts.message);
            }
        }

        if (isModalActive !== newProps.isModalActive) {
            this.dropdown.close();
            if (isAndroid) {
                StatusBar.setBackgroundColor(getBackgroundColor(this.state.currentScreen, theme), false);
            }
        }

        this.disposeIfConnectionIsRestored(newProps);
    }

    shouldComponentUpdate(newProps) {
        if (newProps.alerts.message === '' || newProps.alerts.title === '') {
            return false;
        }
        return true;
    }

    componentWillUnmount() {
        this.props.disposeOffAlert();
    }

    getStatusBarStyle() {
        if (isIPhoneX) {
            return 'light-content';
        }
        return tinycolor(getBackgroundColor(this.state.currentScreen, this.props.theme)).isDark()
            ? 'light-content'
            : 'dark-content';
    }

    /**
     * Generates an alert if wallet has no internet connection
     */
    generateAlertWhenNoConnection() {
        const { alerts: { category, title, message }, hasConnection } = this.props;

        if (!hasConnection && this.dropdown) {
            this.dropdown.alertWithType(category, title, message);
        }
    }

    /**
     * Automatically hides active alert when wallet restores internet connection
     */
    disposeIfConnectionIsRestored(newProps) {
        if (!this.props.hasConnection && newProps.hasConnection && this.dropdown) {
            this.dropdown.close();
        }
    }

    refFunc = (ref) => {
        this.dropdown = ref;
    };

    render() {
        const { closeInterval } = this.props.alerts;
        const { onRef, theme: { positive, negative }, theme } = this.props;
        const closeAfter = closeInterval;
        const statusBarStyle = this.getStatusBarStyle();
        return (
            <DropdownAlert
                ref={onRef || this.refFunc}
                successColor={positive.color}
                errorColor={negative.color}
                errorImageSrc={errorIcon}
                successImageSrc={successIcon}
                warnImageSrc={warnIcon}
                infoImageSrc={infoIcon}
                titleStyle={styles.dropdownTitle}
                defaultTextContainer={styles.dropdownTextContainer}
                messageStyle={styles.dropdownMessage}
                imageStyle={styles.dropdownImage}
                inactiveStatusBarStyle={statusBarStyle}
                inactiveStatusBarBackgroundColor={getBackgroundColor(this.state.currentScreen, theme)}
                onCancel={this.props.disposeOffAlert}
                onClose={this.props.disposeOffAlert}
                closeInterval={closeAfter}
                tapToCloseEnabled={this.props.hasConnection}
                translucent={isAndroid}
            />
        );
    }
}

const mapStateToProps = (state) => ({
    alerts: state.alerts,
    isModalActive: state.ui.isModalActive,
    hasConnection: state.wallet.hasConnection,
    theme: state.settings.theme,
});

const mapDispatchToProps = { disposeOffAlert };

export default translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(StatefulDropdownAlert));
