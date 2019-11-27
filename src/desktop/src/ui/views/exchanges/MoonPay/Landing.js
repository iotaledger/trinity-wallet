import get from 'lodash/get';
import head from 'lodash/head';
import filter from 'lodash/filter';
import find from 'lodash/find';
import map from 'lodash/map';
import isNull from 'lodash/isNull';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getAnimation } from 'animations';

import { isIPAddressAllowed, getAlpha3CodeForIPAddress } from 'selectors/exchanges/MoonPay';
import { updateCustomerInfo, setLoggingIn } from 'actions/exchanges/MoonPay';

import Select from 'ui/components/input/Select';
import Button from 'ui/components/Button';
import Lottie from 'ui/components/Lottie';

import css from './index.scss';

/** MoonPay landing screen component */
class Landing extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        countries: PropTypes.array.isRequired,
        /** @ignore */
        country: PropTypes.string,
        /** @ignore */
        isIPAddressAllowed: PropTypes.bool.isRequired,
        /** @ignore */
        alpha3CodeForIPAddress: PropTypes.string.isRequired,
        /** @ignore */
        updateCustomerInfo: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
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

    render() {
        const { isLoggingIn, countries, t, themeName } = this.props;

        const countryNames = map(filter(countries, (country) => country.isAllowed), (country) => country.name);

        return (
            <form>
                <section className={css.long}>
                    <div>
                        <React.Fragment>
                            <p>{isLoggingIn ? t('moonpay:loginToMoonPay') : t('moonpay:buyIOTA')}</p>
                            <Lottie
                                width={180}
                                height={180}
                                data={getAnimation('sendingDesktop', themeName)}
                                segments={[89, 624]}
                                loop
                            />
                        </React.Fragment>
                        <p>{t('moonpay:supportExplanation')}</p>
                    </div>
                    <fieldset>
                        <Select
                            value={this.state.country.name}
                            label={t('moonpay:selectCountry')}
                            onChange={(name) => {
                                const country = find(countries, { name });

                                this.setState({
                                    country: {
                                        name: country.name,
                                        alpha3: country.alpha3,
                                    },
                                });
                            }}
                            options={map(countryNames, (countryName) => ({
                                value: countryName,
                                label: countryName,
                            }))}
                        />
                    </fieldset>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            onClick={() => {
                                this.props.setLoggingIn(false);
                                this.props.history.goBack();
                            }}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            id="to-setup-email"
                            onClick={() => {
                                this.props.updateCustomerInfo({
                                    address: {
                                        country: this.state.country.alpha3,
                                    },
                                });
                                this.props.history.push('/exchanges/moonpay/setup-email');
                            }}
                            className="square"
                            variant="primary"
                        >
                            {t('global:continue')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
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

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(Landing));
