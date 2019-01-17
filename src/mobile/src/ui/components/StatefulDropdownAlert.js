import last from 'lodash/last';
import { withNamespaces } from 'react-i18next';
import React, { Component } from 'react';
import { StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import { dismissAlert } from 'shared-modules/actions/alerts';
import { connect } from 'react-redux';
import tinycolor from 'tinycolor2';
import DropdownAlert from 'react-native-dropdownalert/DropdownAlert';
import { width, height } from 'libs/dimensions';
import { Styling, getBackgroundColor } from 'ui/theme/general';
import { rgbToHex } from 'shared-modules/libs/utils';
import { isAndroid } from 'libs/device';

const errorIcon = require('shared-modules/images/error.png');
const successIcon = require('shared-modules/images/successIcon.png');
const warnIcon = require('shared-modules/images/warnIcon.png');
const infoIcon = require('shared-modules/images/infoIcon.png');

class StatefulDropdownAlert extends Component {
    static propTypes = {
        /** @ignore */
        alerts: PropTypes.object.isRequired,
        /** @ignore */
        dismissAlert: PropTypes.func.isRequired,
        /** @ignore */
        closeInterval: PropTypes.number,
        /**
         * Returns this component instance to the parent component
         *
         * @param {object} component instance
         */
        onRef: PropTypes.func,
        /** @ignore */
        hasConnection: PropTypes.bool.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        navStack: PropTypes.array,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        shouldUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        isModalActive: PropTypes.bool.isRequired,
    };

    static defaultProps = {
        closeInterval: 5500,
    };

    constructor() {
        super();
        this.refFunc = this.refFunc.bind(this);
    }

    componentDidMount() {
        this.checkForAlerts();
    }

    componentWillReceiveProps(newProps) {
        const { alerts, navStack } = this.props;
        const hasAnAlert = newProps.alerts.category && newProps.alerts.title && newProps.alerts.message;
        const alertIsNew = alerts.message !== newProps.alerts.message;
        const alertIsNotEmpty = newProps.alerts.message !== '';
        const shouldGenerateAlert = hasAnAlert && alertIsNew && alertIsNotEmpty;
        if (shouldGenerateAlert) {
            if (this.dropdown) {
                this.dropdown.alertWithType(newProps.alerts.category, newProps.alerts.title, newProps.alerts.message);
            }
        }
        if (last(navStack) !== last(newProps.navStack) && this.dropdown) {
            this.dropdown.closeDirectly(false);
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
        this.props.dismissAlert();
    }

    /**
     * Returns status bar colour dependent on current route
     *
     * @method getStatusBarColor
     * @param {string} currentRoute
     *
     * @returns {string}
     */
    getStatusBarColor(currentRoute) {
        const statusBarColor = getBackgroundColor(currentRoute, this.props.theme);
        if (statusBarColor) {
            return rgbToHex(statusBarColor);
        }
    }

    /**
     * Returns status bar style (light or dark) dependent on theme
     *
     * @method getStatusBarStyle
     *
     * @returns {string}
     */
    getStatusBarStyle() {
        return tinycolor(getBackgroundColor(last(this.props.navStack), this.props.theme)).isDark()
            ? 'light-content'
            : 'dark-content';
    }

    /**
     * Checks for alerts on mount
     *
     * @method generateAlertWhenNoConnection
     *
     */
    checkForAlerts() {
        const { alerts: { category, title, message }, hasConnection, shouldUpdate, forceUpdate } = this.props;

        if (this.dropdown && (shouldUpdate || forceUpdate)) {
            return this.dropdown.alertWithType(category, title, message);
        }

        if (!hasConnection && this.dropdown) {
            this.dropdown.alertWithType(category, title, message);
        }
    }

    /**
     * Automatically hides active alert when wallet restores internet connection
     *
     * @method disposeIfConnectionIsRestored
     *
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
        const { onRef, theme: { positive, negative }, navStack, dismissAlert, forceUpdate, isModalActive } = this.props;
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
                titleStyle={{
                    fontSize: Styling.fontSize3,
                    textAlign: 'left',
                    fontWeight: 'bold',
                    color: 'white',
                    backgroundColor: 'transparent',
                    fontFamily: 'SourceSansPro-Regular',
                }}
                defaultTextContainer={{
                    flex: 1,
                    paddingLeft: width / 20,
                    paddingRight: width / 15,
                    paddingVertical: height / 30,
                }}
                messageStyle={{
                    fontSize: Styling.fontSize2,
                    textAlign: 'left',
                    fontWeight: 'normal',
                    color: 'white',
                    backgroundColor: 'transparent',
                    fontFamily: 'SourceSansPro-Regular',
                    paddingTop: height / 60,
                }}
                imageStyle={{
                    marginLeft: width / 25,
                    width: width / 15,
                    height: width / 15,
                    alignSelf: 'center',
                }}
                defaultContainer={isAndroid && isModalActive ? { paddingTop: StatusBar.currentHeight } : null}
                inactiveStatusBarStyle={statusBarStyle}
                inactiveStatusBarBackgroundColor={this.getStatusBarColor(last(navStack))}
                onCancel={dismissAlert}
                onClose={dismissAlert}
                closeInterval={closeAfter}
                tapToCloseEnabled={this.props.hasConnection && forceUpdate === false}
            />
        );
    }
}

const mapStateToProps = (state) => ({
    alerts: state.alerts,
    hasConnection: state.wallet.hasConnection,
    shouldUpdate: state.wallet.shouldUpdate,
    forceUpdate: state.wallet.forceUpdate,
    theme: state.settings.theme,
    navStack: state.wallet.navStack,
    isModalActive: state.ui.isModalActive,
});

const mapDispatchToProps = { dismissAlert };

export default withNamespaces(['global'])(connect(mapStateToProps, mapDispatchToProps)(StatefulDropdownAlert));
