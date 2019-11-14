import toLower from 'lodash/toLower';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { prepareMoonPayExternalLink, getAmountInFiat, getActiveFiatCurrency } from 'exchanges/MoonPay/utils';
import { getCustomerEmail } from 'selectors/exchanges/MoonPay';
import { getLatestAddressForMoonPaySelectedAccount } from 'selectors/accounts';

import Button from 'ui/components/Button';

import css from './index.scss';

/** MoonPay identity confirmation warning screen component */
class IdentityConfirmationWarning extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        denomination: PropTypes.string.isRequired,
        /** @ignore */
        address: PropTypes.string.isRequired,
        /** @ignore */
        exchangeRates: PropTypes.object.isRequired,
        /** @ignore */
        email: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.redirect = this.redirect.bind(this);
    }

    /**
     * Redirects to MoonPay external URL for identiy verification
     *
     * @method redirect
     *
     * @returns {void}
     */
    redirect() {
        const { address, amount, denomination, email, exchangeRates } = this.props;

        window.open(
            prepareMoonPayExternalLink(
                email,
                address,
                getAmountInFiat(Number(amount), denomination, exchangeRates),
                toLower(getActiveFiatCurrency(denomination)),
            ),
        );
    }

    render() {
        const { t } = this.props;

        return (
            <form onSubmit={this.redirect}>
                <section className={css.long}>
                    <div>
                        <p>{t('moonpay:confirmIdentity')}</p>
                        <p>{t('moonpay:moonpayRedirect')}</p>
                    </div>
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
                        <Button id="to-identity-verification" type="submit" className="square" variant="primary">
                            {t('global:continue')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    amount: state.exchanges.moonpay.amount,
    denomination: state.exchanges.moonpay.denomination,
    exchangeRates: state.exchanges.moonpay.exchangeRates,
    address: getLatestAddressForMoonPaySelectedAccount(state),
    email: getCustomerEmail(state),
});

export default connect(mapStateToProps)(withTranslation()(IdentityConfirmationWarning));
