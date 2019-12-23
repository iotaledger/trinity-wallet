import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { AppState, Linking, StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import LottieView from 'lottie-react-native';
import { fetchTransactionDetails } from 'shared-modules/actions/exchanges/MoonPay';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { getActiveTransaction } from 'shared-modules/selectors/exchanges/MoonPay';
import { MOONPAY_TRANSACTION_STATUSES } from 'shared-modules/exchanges/MoonPay';
import { getAnimation } from 'shared-modules/animations';
import navigator from 'libs/navigation';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import SingleFooterButton from 'ui/components/SingleFooterButton';

const styles = StyleSheet.create({
    animation: {
        width: width / 1.35,
        height: width / 1.35,
        alignSelf: 'center',
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.9,
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    midContainer: {
        flex: 3.1,
        alignItems: 'center',
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
        backgroundColor: 'transparent',
        textAlign: 'center',
    },
});

/** MoonPay payment pending screen component */
class PaymentPending extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        isFetchingTransactionDetails: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorFetchingTransactionDetails: PropTypes.bool.isRequired,
        /** @ignore */
        activeTransaction: PropTypes.object,
        /** @ignore */
        transactionId: PropTypes.string,
        /** @ignore */
        fetchTransactionDetails: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        const { t } = props;

        this.state = {
            appState: AppState.currentState,
            subtitle: t('moonpay:paymentPendingExplanation'),
            buttonText: t('moonpay:viewReceipt'),
            hasErrorFetchingTransactionDetails: false,
        };

        this.handleAppStateChange = this.handleAppStateChange.bind(this);
        this.onButtonPress = this.onButtonPress.bind(this);
    }

    componentDidMount() {
        AppState.addEventListener('change', this.handleAppStateChange);

        const { activeTransaction, t } = this.props;
        const status = get(activeTransaction, 'status');

        if (status === MOONPAY_TRANSACTION_STATUSES.completed) {
            this.redirectToScreen('paymentSuccess');
        } else if (status === MOONPAY_TRANSACTION_STATUSES.failed) {
            this.redirectToScreen('paymentFailure');
        } else if (status === MOONPAY_TRANSACTION_STATUSES.waitingAuthorization) {
            this.setState({
                subtitle: t('moonpay:pleaseComplete3DSecure'),
                buttonText: t('global:continue'),
            });
        }
    }

    componentWillReceiveProps(nextProps) {
        const { activeTransaction, t } = nextProps;

        if (this.props.isFetchingTransactionDetails && !nextProps.isFetchingTransactionDetails) {
            if (nextProps.hasErrorFetchingTransactionDetails) {
                this.setState({
                    subtitle: t('moonpay:errorGettingTransactionDetails'),
                    buttonText: t('moonpay:tryAgain'),
                    hasErrorFetchingTransactionDetails: true,
                });
            } else {
                const status = get(activeTransaction, 'status');

                if (status === MOONPAY_TRANSACTION_STATUSES.completed) {
                    this.redirectToScreen('paymentSuccess');
                } else if (status === MOONPAY_TRANSACTION_STATUSES.failed) {
                    this.redirectToScreen('paymentFailure');
                } else if (status === MOONPAY_TRANSACTION_STATUSES.waitingAuthorization) {
                    this.setState({
                        subtitle: t('moonpay:pleaseComplete3DSecure'),
                        buttonText: t('global:complete'),
                    });
                } else if (status === MOONPAY_TRANSACTION_STATUSES.pending) {
                    this.setState({
                        subtitle: t('moonpay:paymentPendingExplanation'),
                        buttonText: t('moonpay:viewReceipt'),
                    });
                }
            }
        }
    }

    componentWillUnmount() {
        AppState.removeEventListener('change', this.handleAppStateChange);
    }

    /**
     * Handles app state changes
     *
     * @method handleAppStateChange
     *
     * @param {string} nextAppState
     *
     * @returns {void}
     */
    handleAppStateChange(nextAppState) {
        if (this.state.appState.match(/inactive|background/) && nextAppState === 'active') {
            const { activeTransaction, isFetchingTransactionDetails, transactionId } = this.props;

            if (
                !isFetchingTransactionDetails &&
                get(activeTransaction, 'status') === MOONPAY_TRANSACTION_STATUSES.waitingAuthorization
            ) {
                this.props.fetchTransactionDetails(transactionId || get(activeTransaction, 'id'));

                this.setState({ hasErrorFetchingTransactionDetails: false });
            }
        }
        this.setState({ appState: nextAppState });
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
     * On (Single) button press callback handler
     *
     * @method onButtonPress
     *
     * @returns {void}
     */
    onButtonPress() {
        const { activeTransaction } = this.props;

        if (get(activeTransaction, 'status') === MOONPAY_TRANSACTION_STATUSES.waitingAuthorization) {
            Linking.openURL(get(activeTransaction, 'redirectUrl'));
        } else {
            this.redirectToScreen('purchaseReceipt');
        }
    }

    render() {
        const {
            activeTransaction,
            transactionId,
            t,
            theme: { body },
            themeName,
            isFetchingTransactionDetails,
        } = this.props;
        const { hasErrorFetchingTransactionDetails, subtitle, buttonText } = this.state;

        const textColor = { color: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={400}
                    >
                        <Header iconSize={width / 3} iconName="moonpay" textColor={body.color} />
                    </AnimatedComponent>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.2 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={266}
                    >
                        <InfoBox>
                            <Text style={[styles.infoText, textColor]}>{t('moonpay:paymentPending')}</Text>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 60 }]}>
                                {subtitle}
                            </Text>
                        </InfoBox>
                    </AnimatedComponent>
                    <View style={{ flex: 0.4 }} />
                    <AnimatedComponent
                        animationInType={['fadeIn', 'slideInRight']}
                        animationOutType={['fadeOut', 'slideOutLeft']}
                        delay={200}
                        style={styles.animation}
                    >
                        <LottieView
                            source={getAnimation('onboardingComplete', themeName)}
                            loop={false}
                            autoPlay
                            style={styles.animation}
                        />
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        {hasErrorFetchingTransactionDetails ? (
                            <DualFooterButtons
                                onLeftButtonPress={() => navigator.setStackRoot('home')}
                                onRightButtonPress={() => {
                                    this.props.fetchTransactionDetails(transactionId || get(activeTransaction, 'id'));
                                    this.setState({
                                        hasErrorFetchingTransactionDetails: false,
                                    });
                                }}
                                leftButtonText={t('global:close')}
                                rightButtonText={t('global:tryAgain')}
                                leftButtonTestID="moonpay-back-to-home"
                                rightButtonTestID="moonpay-purchase-receipt"
                            />
                        ) : (
                            <SingleFooterButton
                                isLoading={isFetchingTransactionDetails}
                                onButtonPress={this.onButtonPress}
                                buttonText={buttonText}
                            />
                        )}
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    themeName: state.settings.themeName,
    isFetchingTransactionDetails: state.exchanges.moonpay.isFetchingTransactionDetails,
    hasErrorFetchingTransactionDetails: state.exchanges.moonpay.hasErrorFetchingTransactionDetails,
    activeTransaction: getActiveTransaction(state),
});

const mapDispatchToProps = {
    fetchTransactionDetails,
};

export default withTranslation()(connect(mapStateToProps, mapDispatchToProps)(PaymentPending));
