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
    seedVaultImportContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'center',
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
        address: PropTypes.string.isRequired,
        /** @ignore */
        city: PropTypes.string.isRequired,
        /** @ignore */
        country: PropTypes.string.isRequired,
        /** @ignore */
        zipCode: PropTypes.string.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        updateCustomer: PropTypes.func.isRequired,
    };

    /**
     * Navigates to chosen screen
     *
     * @method redirectToScreen
     */
    static redirectToScreen(screen) {
        navigator.push(screen);
    }

    constructor(props) {
        super(props);

        this.state = {
            address: isNull(props.address) ? '' : props.address,
            city: isNull(props.city) ? '' : props.city,
            country: isNull(props.country) ? '' : props.country,
            zipCode: isNull(props.zipCode) ? '' : props.zipCode,
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isUpdatingCustomer && !nextProps.isUpdatingCustomer && !nextProps.hasErrorUpdatingCustomer) {
            UserAdvancedInfo.redirectToScreen('addPaymentMethod');
        }
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

        return this.props.updateCustomer({
            address: {
                street: this.state.address,
                town: this.state.city,
                country: this.state.country,
                postCode: this.state.zipCode,
            },
        });
    }

    render() {
        const { countries, t, theme, isUpdatingCustomer } = this.props;
        const countryNames = map(filter(countries, (country) => country.isAllowed), (country) => country.name);
        const selectedCountry = find(countries, { alpha3: this.state.country });

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                <View>
                    <View style={styles.topContainer}>
                        <AnimatedComponent
                            animationInType={['slideInRight', 'fadeIn']}
                            animationOutType={['slideOutLeft', 'fadeOut']}
                            delay={400}
                        >
                            <Header textColor={theme.body.color} />
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
                                        width: isIPhoneX ? width / 1.08 : width / 2.5,
                                        marginRight: 13,
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
                                        width: isIPhoneX ? width / 1.08 : width / 2.5,
                                        marginLeft: 13,
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
                                value={selectedCountry.name}
                                options={countryNames}
                                saveSelection={(name) => {
                                    this.setState({
                                        country: find(countries, { name }).alpha3,
                                    });
                                }}
                            />
                        </AnimatedComponent>
                        <View style={{ flex: 0.6 }} />
                    </View>
                    <View style={styles.bottomContainer}>
                        <AnimatedComponent animationInType={['fadeIn']} animationOutType={['fadeOut']} delay={0}>
                            <DualFooterButtons
                                onLeftButtonPress={() => UserAdvancedInfo.redirectToScreen('userBasicInfo')}
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
