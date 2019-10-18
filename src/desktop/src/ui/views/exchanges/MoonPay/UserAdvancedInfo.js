import isNull from 'lodash/isNull';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
import Input from 'ui/components/input/Text';
import Select from 'ui/components/input/Select';

import css from './index.scss';

/** MoonPay user advanced info screen component */
class UserAdvancedInfo extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        countries: PropTypes.array.isRequired,
        /** @ignore */
        address: PropTypes.string.isRequired,
        /** @ignore */
        city: PropTypes.string.isRequired,
        /** @ignore */
        country: PropTypes.string.isRequired,
        /** @ignore */
        zipCode: PropTypes.string.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        address: isNull(this.props.address) ? '' : this.props.address,
        city: isNull(this.props.city) ? '' : this.props.city,
        country: isNull(this.props.country) ? '' : this.props.country,
        zipCode: isNull(this.props.zipCode) ? '' : this.props.zipCode,
    };

    render() {
        const { countries, t } = this.props;
        const { address, city, country, zipCode } = this.state;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}> {t('moonpay:tellUsMore')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:cardRegistrationName')}
                            </p>
                        </div>
                    </Info>
                    <div style={{ width: '100%' }}>
                        <Input
                            style={{ maxWidth: '100%' }}
                            value={address}
                            label={t('moonpay:address')}
                            onChange={(newAddress) => this.setState({ address: newAddress })}
                        />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Input
                            value={city}
                            label={t('moonpay:city')}
                            onChange={(newCity) => this.setState({ city: newCity })}
                        />
                        <Input
                            style={{ marginLeft: '30px' }}
                            value={zipCode}
                            label={t('moonpay:zipCode')}
                            onChange={(newZipCode) => this.setState({ zipCode: newZipCode })}
                        />
                    </div>
                    <Select
                        label="Country"
                        value={country}
                        onChange={(newCountry) => this.setState({ country: newCountry })}
                        options={countries.map((item) => {
                            return { value: item, label: item };
                        })}
                    />
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            onClick={() => this.props.history.goBack()}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            id="to-transfer-funds"
                            onClick={() => this.props.history.push('/exchanges/moonpay/add-payment-method')}
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
    countries: state.exchanges.moonpay.countries,
    address: state.exchanges.moonpay.customer.address.street,
    city: state.exchanges.moonpay.customer.address.town,
    country: state.exchanges.moonpay.customer.address.country,
    zipCode: state.exchanges.moonpay.customer.address.postCode,
});

export default connect(mapStateToProps)(withTranslation()(UserAdvancedInfo));
