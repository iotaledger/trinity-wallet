import get from 'lodash/get';
import head from 'lodash/head';
import filter from 'lodash/filter';
import find from 'lodash/find';
import map from 'lodash/map';
import isNull from 'lodash/isNull';
import React from 'react';
import { withTranslation } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import navigator from 'libs/navigation';
import { generateAlert } from 'shared-modules/actions/alerts';
import { updateCustomer } from 'shared-modules/actions/exchanges/MoonPay';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { getThemeFromState } from 'shared-modules/selectors/global';
import WithUserActivity from 'ui/components/UserActivity';
import CustomTextInput from 'ui/components/CustomTextInput';
import DropdownComponent from 'ui/components/Dropdown';
import InfoBox from 'ui/components/InfoBox';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import AnimatedComponent from 'ui/components/AnimatedComponent';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import Header from 'ui/components/Header';
import { isIPhoneX } from 'libs/device';

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
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
});

/** MoonPay user advanced info component */
class UserAdvancedInfo extends React.Component {
    static propTypes = {
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        countries: PropTypes.array.isRequired,
        /** @ignore */
        isUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        address: PropTypes.string,
        /** @ignore */
        city: PropTypes.string,
        /** @ignore */
        country: PropTypes.string,
        /** @ignore */
        zipCode: PropTypes.string,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        updateCustomer: PropTypes.func.isRequired,
        /** Component ID */
        componentId: PropTypes.string.isRequired,
    };

    constructor(props) {
        super(props);

        const allowedCountries = filter(props.countries, (country) => country.isAllowed);

        this.state = {
            address: isNull(props.address) ? '' : props.address,
            city: isNull(props.city) ? '' : props.city,
            country: isNull(props.country)
                ? {
                      name: get(head(allowedCountries), 'name'),
                      alpha3: get(head(allowedCountries), 'alpha3'),
                  }
                : {
                      name: get(find(props.countries, { alpha3: props.country }), 'name'),
                      alpha3: props.country,
                  },
            zipCode: isNull(props.zipCode) ? '' : props.zipCode,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isUpdatingCustomer && !nextProps.isUpdatingCustomer && !nextProps.hasErrorUpdatingCustomer) {
            this.redirectToScreen('addAmount');
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

        if (!this.state.address) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidAddress'),
                t('moonpay:invalidAddressExplanation'),
            );
        }

        if (!this.state.city) {
            return this.props.generateAlert('error', t('moonpay:invalidCity'), t('moonpay:invalidCityExplanation'));
        }

        if (!this.state.zipCode) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidZipCode'),
                t('moonpay:invalidZipCodeExplanation'),
            );
        }

        return this.props.updateCustomer({
            address: {
                street: this.state.address,
                town: this.state.city,
                country: this.state.country.alpha3,
                postCode: this.state.zipCode,
            },
        });
    }

    render() {
        const { countries, t, theme, isUpdatingCustomer } = this.props;
        const countryNames = map(filter(countries, (country) => country.isAllowed), (country) => country.name);

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
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
                                    {t('moonpay:tellUsMore')}
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
                                label={t('moonpay:address')}
                                onValidTextChange={(address) => this.setState({ address })}
                                theme={theme}
                                autoCorrect={false}
                                enablesReturnKeyAutomatically
                                returnKeyType="done"
                                value={this.state.address}
                                testID="enterSeed-seedbox"
                            />
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={160}
                        >
                            <View
                                style={{
                                    flexDirection: 'row',
                                }}
                            >
                                <CustomTextInput
                                    containerStyle={{
                                        width: isIPhoneX ? width / 2.33 : width / 2.5,
                                        marginHorizontal: width / 30,
                                    }}
                                    label={t('moonpay:city')}
                                    onValidTextChange={(city) => this.setState({ city })}
                                    theme={theme}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    value={this.state.city}
                                />
                                <CustomTextInput
                                    containerStyle={{
                                        width: isIPhoneX ? width / 2.33 : width / 2.5,
                                        marginHorizontal: width / 30,
                                    }}
                                    label={t('moonpay:zipCode')}
                                    onValidTextChange={(zipCode) => this.setState({ zipCode })}
                                    theme={theme}
                                    autoCorrect={false}
                                    enablesReturnKeyAutomatically
                                    returnKeyType="done"
                                    value={this.state.zipCode}
                                />
                            </View>
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={80}
                        >
                            <DropdownComponent
                                onRef={(c) => {
                                    this.dropdown = c;
                                }}
                                dropdownWidth={{ width: isIPhoneX ? width / 1.1 : width / 1.2 }}
                                value={this.state.country.name}
                                options={countryNames}
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
                        <View style={{ flex: 0.6 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => this.goBack()}
                                onRightButtonPress={() => this.updateCustomer()}
                                isRightButtonLoading={isUpdatingCustomer}
                                leftButtonText={t('global:goBack')}
                                rightButtonText={t('global:continue')}
                                leftButtonTestID="moonpay-back"
                                rightButtonTestID="moonpay-add-payment-method"
                            />
                        </AnimatedComponent>
                    </View>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    countries: state.exchanges.moonpay.countries,
    isUpdatingCustomer: state.exchanges.moonpay.isUpdatingCustomer,
    hasErrorUpdatingCustomer: state.exchanges.moonpay.hasErrorUpdatingCustomer,
    address: state.exchanges.moonpay.customer.address.street,
    city: state.exchanges.moonpay.customer.address.town,
    country: state.exchanges.moonpay.customer.address.country,
    zipCode: state.exchanges.moonpay.customer.address.postCode,
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
        )(UserAdvancedInfo),
    ),
);
