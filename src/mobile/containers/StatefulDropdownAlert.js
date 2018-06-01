import { translate } from 'react-i18next';
import React, { Component } from 'react';
import { StyleSheet, StatusBar } from 'react-native';
import PropTypes from 'prop-types';
import { disposeOffAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import tinycolor from 'tinycolor2';
import DropdownAlert from 'react-native-dropdownalert/DropdownAlert';
import { width, height } from '../utils/dimensions';
import { isIPhoneX } from '../utils/device';
import GENERAL from '../theme/general';

const errorIcon = require('iota-wallet-shared-modules/images/error.png');
const successIcon = require('iota-wallet-shared-modules/images/successIcon.png');
const warnIcon = require('iota-wallet-shared-modules/images/warnIcon.png');
const infoIcon = require('iota-wallet-shared-modules/images/infoIcon.png');

const styles = StyleSheet.create({
    dropdownTitle: {
        fontSize: GENERAL.fontSize3,
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
        fontSize: GENERAL.fontSize2,
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
        alerts: PropTypes.object.isRequired,
        disposeOffAlert: PropTypes.func.isRequired,
        closeInterval: PropTypes.number,
        backgroundColor: PropTypes.string.isRequired,
        onRef: PropTypes.func,
        /** Determines whether modal is open */
        isModalActive: PropTypes.bool.isRequired,
        /** Determines whether has internet connection */
        hasConnection: PropTypes.bool.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        closeInterval: 5500,
    };

    constructor() {
        super();
        this.refFunc = this.refFunc.bind(this);
    }

    componentDidMount() {
        this.generateAlertWhenNoConnection();
    }

    componentWillReceiveProps(newProps) {
        const { alerts, isModalActive, backgroundColor } = this.props;
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
            StatusBar.setBackgroundColor(backgroundColor, false);
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
        const { backgroundColor } = this.props;
        if (isIPhoneX) {
            return 'light-content';
        }
        return tinycolor(backgroundColor).isDark() ? 'light-content' : 'dark-content';
    }

    generateAlertWhenNoConnection() {
        const { alerts: { category, title, message }, hasConnection } = this.props;

        if (!hasConnection && this.dropdown) {
            this.dropdown.alertWithType(category, title, message);
        }
    }

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
        const { backgroundColor, onRef, isModalActive, theme: { positive, negative } } = this.props;
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
                inactiveStatusBarBackgroundColor={backgroundColor}
                onCancel={this.props.disposeOffAlert}
                onClose={this.props.disposeOffAlert}
                closeInterval={closeAfter}
                tapToCloseEnabled={this.props.hasConnection}
                translucent={!isModalActive}
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
