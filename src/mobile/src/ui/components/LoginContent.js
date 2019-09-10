import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, TouchableWithoutFeedback, Keyboard } from 'react-native';
import { connect } from 'react-redux';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { getAnimation } from 'shared-modules/animations';
import LottieView from 'lottie-react-native';
import DualFooterButtons from './DualFooterButtons';

const styles = StyleSheet.create({
    topContainer: {
        flex: 5.6,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    bottomContainer: {
        flex: 0.7,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
});

export class EnterPasswordOnLogin extends Component {
    static propTypes = {
        /** Verify two factor authentication token */
        /** @param {object} password - user's password */
        onLoginPress: PropTypes.func.isRequired,
        /** Navigate to node selection screen */
        navigateToNodeOptions: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);
        this.openModal = this.openModal.bind(this);
        this.hideModal = this.hideModal.bind(this);
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('EnterPasswordOnLogin');
    }

    handleLogin = () => {
        this.props.onLoginPress();
    };

    changeNode = () => {
        const { navigateToNodeOptions } = this.props;
        navigateToNodeOptions();
    };

    openModal() {
        const { theme, t } = this.props;
        this.props.toggleModalActivity('biometricInfo', {
            theme,
            t,
            hideModal: () => this.props.toggleModalActivity(),
        });
    }

    hideModal() {
        this.props.toggleModalActivity();
    }

    render() {
        const { t, themeName } = this.props;

        return (
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                <View>
                    <View style={styles.topContainer}>
                        <LottieView
                            source={getAnimation('onboardingComplete', themeName)}
                            loop={false}
                            autoPlay
                            style={styles.animation}
                        />
                    </View>
                    <View style={styles.bottomContainer}>
                        <DualFooterButtons
                            onLeftButtonPress={this.changeNode}
                            onRightButtonPress={this.handleLogin}
                            leftButtonText={t('settings:nodeSettings')}
                            rightButtonText={t('login')}
                        />
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapDispatchToProps = {
    toggleModalActivity,
};

export default withTranslation(['login', 'global'])(
    connect(
        null,
        mapDispatchToProps,
    )(EnterPasswordOnLogin),
);
