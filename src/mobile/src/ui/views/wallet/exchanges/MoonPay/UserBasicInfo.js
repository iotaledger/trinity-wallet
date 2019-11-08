import last from 'lodash/last';
import isNull from 'lodash/isNull';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { Keyboard, KeyboardAvoidingView, StyleSheet, View, Text } from 'react-native';
import navigator from 'libs/navigation';
import { updateCustomer } from 'shared-modules/actions/exchanges/MoonPay';
import { generateAlert } from 'shared-modules/actions/alerts';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { moment } from 'shared-modules/libs/exports';
import WithUserActivity from 'ui/components/UserActivity';
import CustomTextInput from 'ui/components/CustomTextInput';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        width,
        justifyContent: 'space-between',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextRegular: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** MoonPay user basic info component */
class UserBasicInfo extends React.Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        isUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        firstName: PropTypes.string,
        /** @ignore */
        lastName: PropTypes.string,
        /** @ignore */
        dateOfBirth: PropTypes.string,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        updateCustomer: PropTypes.func.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        navStack: PropTypes.array.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            firstName: isNull(props.firstName) ? '' : props.firstName,
            lastName: isNull(props.lastName) ? '' : props.lastName,
            dateOfBirth: moment(
                props.dateOfBirth ||
                    // Using 1970 as default
                    new Date(1970),
            ).format('DD/MM/YYYY'),
        };
    }

    componentWillReceiveProps(nextProps) {
        if (
            this.props.isUpdatingCustomer &&
            !nextProps.isUpdatingCustomer &&
            !nextProps.hasErrorUpdatingCustomer &&
            last(this.props.navStack) === this.props.componentId
        ) {
            this.redirectToScreen('userAdvancedInfo');
        }
    }

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    redirectToScreen(screen) {
        navigator.push(screen);
    }

    /**
     * Pops the active screen from the navigation stack
     * @method goBack
     */
    goBack() {
        navigator.pop(this.props.componentId);
    }

    /**
     * Updates customer information
     *
     * @method updateCustomer
     *
     * @returns {function}
     */
    updateCustomer() {
        const { t } = this.props;

        if (!this.state.firstName) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidFirstName'),
                t('moonpay:invalidFirstNameExplanation'),
            );
        }

        if (!this.state.lastName) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidLastName'),
                t('moonpay:invalidLastNameExplanation'),
            );
        }

        return this.props.updateCustomer({
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            dateOfBirth: moment(this.state.dateOfBirth, 'DD/MM/YYYY').toISOString(),
        });
    }

    /**
     * Updates date of birth value
     *
     * @method updateDateOfBirth
     *
     * @param {string} newDateOfBirth
     *
     * @returns {void}
     */
    updateDateOfBirth(newDateOfBirth) {
        const value = newDateOfBirth.replace(/\D/g, '').slice(0, 10);

        if (value.length >= 5) {
            this.setState({ dateOfBirth: `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4, 8)}` });
        } else if (value.length >= 3) {
            this.setState({ dateOfBirth: `${value.slice(0, 2)}/${value.slice(2)}` });
        } else {
            this.setState({ dateOfBirth: value });
        }
    }

    render() {
        const { t, theme, isUpdatingCustomer } = this.props;

        return (
            <KeyboardAvoidingView
                style={[styles.container, { backgroundColor: theme.body.bg }]}
                behavior="position"
                keyboardVerticalOffset={10}
                enabled
            >
                <View>
                    <View style={styles.topContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={400}
                        >
                            <Header iconSize={width / 3} iconName="moonpay" textColor={theme.body.color} />
                        </AnimatedComponent>
                    </View>
                    <View style={styles.midContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={320}
                        >
                            <InfoBox>
                                <Text style={[styles.infoText, { color: theme.body.color }]}>
                                    {t('moonpay:tellUsAbout')}
                                </Text>
                                <Text
                                    style={[
                                        styles.infoTextRegular,
                                        { paddingTop: height / 60, color: theme.body.color },
                                    ]}
                                >
                                    {t('moonpay:cardRegistrationName')}
                                </Text>
                            </InfoBox>
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={240}
                        >
                            <CustomTextInput
                                label={t('moonpay:firstName')}
                                onValidTextChange={(firstName) => this.setState({ firstName })}
                                theme={theme}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    if (this.state.firstName) {
                                        this.lastName.focus();
                                    }
                                }}
                                value={this.state.firstName}
                            />
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={160}
                        >
                            <CustomTextInput
                                onRef={(c) => {
                                    this.lastName = c;
                                }}
                                label={t('moonpay:lastName')}
                                onValidTextChange={(lastName) => this.setState({ lastName })}
                                theme={theme}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="next"
                                onSubmitEditing={() => {
                                    if (this.state.lastName) {
                                        this.dateOfBirth.focus();
                                    }
                                }}
                                value={this.state.lastName}
                            />
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={80}
                        >
                            <CustomTextInput
                                onRef={(c) => {
                                    this.dateOfBirth = c;
                                }}
                                label={t('moonpay:dateOfBirth')}
                                onValidTextChange={(dateOfBirth) => this.updateDateOfBirth(dateOfBirth)}
                                theme={theme}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                blurOnSubmit
                                onSubmitEditing={() => Keyboard.dismiss()}
                                value={this.state.dateOfBirth}
                            />
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => this.goBack()}
                                onRightButtonPress={() => this.updateCustomer()}
                                isRightButtonLoading={isUpdatingCustomer}
                                disableLeftButton={isUpdatingCustomer}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:continue')}
                                leftButtonTestID="moonpay-back"
                                rightButtonTestID="moonpay-next"
                            />
                        </AnimatedComponent>
                    </View>
                </View>
            </KeyboardAvoidingView>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    isUpdatingCustomer: state.exchanges.moonpay.isUpdatingCustomer,
    hasErrorUpdatingCustomer: state.exchanges.moonpay.hasErrorUpdatingCustomer,
    firstName: state.exchanges.moonpay.customer.firstName,
    lastName: state.exchanges.moonpay.customer.lastName,
    dateOfBirth: state.exchanges.moonpay.customer.dateOfBirth,
    navStack: state.wallet.navStack,
});

const mapDispatchToProps = {
    generateAlert,
    updateCustomer,
};

export default WithUserActivity()(
    withTranslation()(
        connect(
            mapStateToProps,
            mapDispatchToProps,
        )(UserBasicInfo),
    ),
);
