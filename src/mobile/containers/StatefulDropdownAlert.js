import { translate } from 'react-i18next';
import React, { Component } from 'react';
import { StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { disposeOffAlert } from 'iota-wallet-shared-modules/actions/alerts';
import { connect } from 'react-redux';
import tinycolor from 'tinycolor2';
import DropdownAlert from 'react-native-dropdownalert/DropdownAlert';
import { width, height } from '../utils/dimensions';
import { isIPhoneX } from '../utils/device';

const errorIcon = require('iota-wallet-shared-modules/images/error.png');
const successIcon = require('iota-wallet-shared-modules/images/successIcon.png');
const warnIcon = require('iota-wallet-shared-modules/images/warnIcon.png');
const infoIcon = require('iota-wallet-shared-modules/images/infoIcon.png');

const styles = StyleSheet.create({
    dropdownTitle: {
        fontSize: width / 25.9,
        textAlign: 'left',
        fontWeight: 'bold',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
    },
    dropdownTextContainer: {
        flex: 1,
        paddingLeft: width / 20,
        paddingRight: width / 15,
        paddingVertical: height / 30,
    },
    dropdownMessage: {
        fontSize: width / 29.6,
        textAlign: 'left',
        fontWeight: 'normal',
        color: 'white',
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
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
    };

    static defaultProps = {
        closeInterval: 5500,
    };

    constructor() {
        super();
        this.refFunc = this.refFunc.bind(this);
    }

    componentWillReceiveProps(newProps) {
        const { alerts, isModalActive } = this.props;
        const hasAnAlert = newProps.alerts.category && newProps.alerts.title && newProps.alerts.message;
        const alertIsNew = alerts.message !== newProps.alerts.message;
        const shouldGenerateAlert = hasAnAlert && alertIsNew;

        if (shouldGenerateAlert) {
            if (this.dropdown) {
                this.dropdown.alertWithType(newProps.alerts.category, newProps.alerts.title, newProps.alerts.message);
            }
        }

        if (isModalActive !== newProps.isModalActive) {
            this.dropdown.close();
        }
    }

    componentWillUnmount() {
        this.props.disposeOffAlert();
    }

    getStatusBarStyle() {
        const { backgroundColor } = this.props;
        if (isIPhoneX) {
            return 'dark-content';
        }
        return tinycolor(backgroundColor).isDark() ? 'light-content' : 'dark-content';
    }

    refFunc = (ref) => {
        this.dropdown = ref;
    };

    render() {
        const { closeInterval } = this.props.alerts;
        const { backgroundColor, onRef, isModalActive } = this.props;
        const closeAfter = closeInterval;
        const statusBarStyle = this.getStatusBarStyle();
        return (
            <DropdownAlert
                ref={onRef || this.refFunc}
                successColor="#009f3f"
                errorColor="#A10702"
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
                translucent={!isModalActive}
            />
        );
    }
}

const mapStateToProps = (state) => ({
    alerts: state.alerts,
    isModalActive: state.ui.isModalActive,
});

const mapDispatchToProps = { disposeOffAlert };

export default translate(['global'])(connect(mapStateToProps, mapDispatchToProps)(StatefulDropdownAlert));
