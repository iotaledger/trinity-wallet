import size from 'lodash/size';
import React, { Component } from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { clearLog } from 'shared-modules/actions/alerts';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withNamespaces } from 'react-i18next';
import { width } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';

const styles = StyleSheet.create({
    container: {
        width: width / 9,
        height: width / 9,
    },
    innerContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width / 9,
        flex: 1,
    },
    disabled: {
        color: '#a9a9a9',
    },
});

export class NotificationButton extends Component {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isModalActive: PropTypes.bool.isRequired,
        /** @ignore */
        clearLog: PropTypes.func.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        notificationLog: PropTypes.array.isRequired,
        /** Determines whether to display topBar when modal is open */
        displayTopBar: PropTypes.bool,
    };

    static defaultProps = {
        displayTopBar: true,
    };

    /**
     * Displays error log
     *
     * @method showModal
     */
    showModal() {
        const { isTransitioning, theme, notificationLog, displayTopBar } = this.props;
        if (!isTransitioning) {
            this.props.toggleModalActivity('notificationLog', {
                hideModal: this.props.toggleModalActivity,
                theme,
                notificationLog,
                clearLog: this.props.clearLog,
                displayTopBar,
            });
        }
    }

    render() {
        const { theme: { bar }, isModalActive, notificationLog } = this.props;
        const hasNotifications = size(notificationLog) && notificationLog.length > 0;

        return (
            <View style={styles.container}>
                {(hasNotifications && (
                    <TouchableOpacity onPress={() => this.showModal()} style={styles.innerContainer}>
                        <Icon
                            name="notification"
                            size={width / 18}
                            color={bar.color}
                            style={isModalActive && styles.disabled && { opacity: 0.5 }}
                        />
                    </TouchableOpacity>
                )) || <View style={styles.innerContainer} />}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    isModalActive: state.ui.isModalActive,
    isTransitioning: state.ui.isTransitioning,
    notificationLog: state.alerts.notificationLog,
});

const mapDispatchToProps = {
    clearLog,
    toggleModalActivity,
};

export default withNamespaces(['enterSeed', 'global'])(
    connect(mapStateToProps, mapDispatchToProps)(NotificationButton),
);
