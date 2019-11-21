import get from 'lodash/get';
import head from 'lodash/head';
import filter from 'lodash/filter';
import find from 'lodash/find';
import map from 'lodash/map';
import isNull from 'lodash/isNull';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import LottieView from 'lottie-react-native';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { isIPAddressAllowed, getAlpha3CodeForIPAddress } from 'shared-modules/selectors/exchanges/MoonPay';
import { updateCustomerInfo, setLoggingIn } from 'shared-modules/actions/exchanges/MoonPay';
import { getAnimation } from 'shared-modules/animations';
import navigator from 'libs/navigation';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import InfoBox from 'ui/components/InfoBox';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import DropdownComponent from 'ui/components/Dropdown';

const styles = StyleSheet.create({
    animation: {
        width: width / 2.4,
        height: width / 2.4,
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

/** MoonPay landing screen component */
class Landing extends Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        countries: PropTypes.array.isRequired,
        /** @ignore */
        country: PropTypes.string,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        isIPAddressAllowed: PropTypes.bool.isRequired,
        /** @ignore */
        alpha3CodeForIPAddress: PropTypes.string.isRequired,
        /** @ignore */
        updateCustomerInfo: PropTypes.func.isRequired,
        /** @ignore */
        setLoggingIn: PropTypes.func.isRequired,
        /** @ignore */
        isLoggingIn: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        const allowedCountries = filter(props.countries, (country) => country.isAllowed);
        const _setCountryBasedOnIPAddress = () => {
            const fallbackCountryName = get(head(allowedCountries), 'name');
            const fallbackCountryAlpha3 = get(head(allowedCountries), 'alpha3');

            if (props.isIPAddressAllowed) {
                return {
                    name:
                        get(find(props.countries, { alpha3: props.alpha3CodeForIPAddress }), 'name') ||
                        fallbackCountryName,
                    alpha3: props.alpha3CodeForIPAddress || fallbackCountryAlpha3,
                };
            }

            return {
                name: fallbackCountryName,
                alpha3: fallbackCountryAlpha3,
            };
        };

        this.state = {
            country: isNull(props.country)
                ? _setCountryBasedOnIPAddress()
                : {
                      name: get(find(props.countries, { alpha3: props.country }), 'name'),
                      alpha3: props.country,
                  },
        };
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
        this.props.setLoggingIn(false);
        navigator.pop(this.props.componentId);
    }

    render() {
        const {
            t,
            theme: { body },
            themeName,
            countries,
            isLoggingIn
        } = this.props;
        const textColor = { color: body.color };
        const countryNames = map(filter(countries, (country) => country.isAllowed), (country) => country.name);

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
                            <Text style={[styles.infoText, textColor]}>{isLoggingIn ? t('moonpay:loginToMoonPay') : t('moonpay:buyIOTA')}</Text>
                            <AnimatedComponent
                                animationInType={['fadeIn', 'slideInRight']}
                                animationOutType={['fadeOut', 'slideOutLeft']}
                                delay={266}
                                style={styles.animation}
                            >
                                <LottieView
                                    source={getAnimation('sending', themeName)}
                                    style={styles.animation}
                                    loop
                                    autoPlay
                                    ref={(ref) => {
                                        this.animation = ref;
                                    }}
                                    onAnimationFinish={() => this.animation.play(89, 624)}
                                />
                            </AnimatedComponent>
                            <Text style={[styles.infoTextRegular, textColor, { paddingTop: height / 60 }]}>
                                {t('moonpay:supportExplanation')}
                            </Text>
                        </InfoBox>
                    </AnimatedComponent>
                    <View style={{ flex: 0.4 }} />
                    <AnimatedComponent
                        animationInType={['slideInRight', 'fadeIn']}
                        animationOutType={['slideOutLeft', 'fadeOut']}
                        delay={80}
                    >
                        <DropdownComponent
                            title={t('moonpay:selectCountry')}
                            onRef={(c) => {
                                this.dropdown = c;
                            }}
                            value={this.state.country.name}
                            options={countryNames}
                            dropdownWidth={{ width: Styling.contentWidth }}
                            saveSelection={(name) => {
                                const country = find(countries, { name });

                                this.setState({
                                    country: {
                                        name: country.name,
                                        alpha3: country.alpha3,
                                    },
                                });
                            }}
                        />
                    </AnimatedComponent>
                </View>
                <View style={styles.bottomContainer}>
                    <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']}>
                        <DualFooterButtons
                            onLeftButtonPress={() => this.goBack()}
                            onRightButtonPress={() => {
                                this.props.updateCustomerInfo({
                                    address: {
                                        country: this.state.country.alpha3,
                                    },
                                });

                                this.redirectToScreen('setupEmail');
                            }}
                            leftButtonText={t('global:goBack')}
                            rightButtonText={t('global:continue')}
                            leftButtonTestID="moonpay-back-to-home"
                            rightButtonTestID="moonpay-add-amount"
                        />
                    </AnimatedComponent>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    themeName: state.settings.themeName,
    countries: state.exchanges.moonpay.countries,
    country: state.exchanges.moonpay.customer.address.country,
    isIPAddressAllowed: isIPAddressAllowed(state),
    alpha3CodeForIPAddress: getAlpha3CodeForIPAddress(state),
    isLoggingIn: state.exchanges.moonpay.isLoggingIn,
});

const mapDispatchToProps = {
    updateCustomerInfo,
    setLoggingIn
};

export default withTranslation()(
    connect(
        mapStateToProps,
        mapDispatchToProps,
    )(Landing),
);
