import isEqual from 'lodash/isEqual';
import { withTranslation } from 'react-i18next';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View } from 'react-native';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import EnterPassword from 'ui/components/EnterPassword';
import { hash } from 'libs/keychain';
import { generateAlert } from 'shared-modules/actions/alerts';
import { setUserActivity } from 'shared-modules/actions/ui';
import navigator from 'libs/navigation';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    inactivityLogoutContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

/**
 * Inactivity logout component
 */
class InactivityLogout extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        isFingerprintEnabled: PropTypes.bool.isRequired,
        /** @ignore */
        setUserActivity: PropTypes.func.isRequired,
    };

    constructor() {
        super();
        this.onInactivityLoginPress = this.onInactivityLoginPress.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('InactivityLogout');
    }

    /**
     * Validates user provided password and sets wallet state as active
     *
     * @method onInactivityLoginPress
     *
     * @param {string} password
     *
     * @returns {void}
     */
    async onInactivityLoginPress(password) {
        const { t } = this.props;
        if (!password) {
            return this.props.generateAlert('error', t('login:emptyPassword'), t('login:emptyPasswordExplanation'));
        }
        const passwordHash = await hash(password);
        if (!isEqual(passwordHash, global.passwordHash)) {
            this.props.generateAlert(
                'error',
                t('global:unrecognisedPassword'),
                t('global:unrecognisedPasswordExplanation'),
            );
        } else {
            this.props.setUserActivity({ inactive: false });
            navigator.pop(this.props.componentId);
        }
    }

    render() {
        const {
            isFingerprintEnabled,
            theme: { body, negative, positive },
            theme,
        } = this.props;
        const textColor = { color: body.color };
        const backgroundColor = { backgroundColor: theme.body.bg };

        return (
            <View style={[styles.container, backgroundColor]}>
                <View style={[styles.inactivityLogoutContainer, { backgroundColor: body.bg }]}>
                    <EnterPassword
                        onLoginPress={this.onInactivityLoginPress}
                        backgroundColor={body.bg}
                        negativeColor={negative.color}
                        positiveColor={positive.color}
                        bodyColor={body.color}
                        textColor={textColor}
                        setUserActive={() => {
                            this.props.setUserActivity({ inactive: false });
                            navigator.pop(this.props.componentId);
                        }}
                        generateAlert={(error, title, explanation) =>
                            this.props.generateAlert(error, title, explanation)
                        }
                        isFingerprintEnabled={isFingerprintEnabled}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    isFingerprintEnabled: state.settings.isFingerprintEnabled,
});

const mapDispatchToProps = {
    generateAlert,
    setUserActivity,
};

export default withTranslation(['global'])(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(InactivityLogout),
);
