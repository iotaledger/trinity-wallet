import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { generateAlert } from 'actions/alerts';
import { getThemeFromState } from 'selectors/global';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';

import css from './index.scss';

/** MoonPay add payment method screen component */
class AddPaymentMethod extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired, // eslint-disable-line
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        window.moonpay.initialize('pk_test_W1g4KpNvqWkHEo58O0CTluQz698eOc');
        window.moonpay.trackPageView();

        this.form = window.moonpay.createCardDetailsForm(() => {});

        const { theme } = this.props;

        const css = {
            color: theme.input.color,
            fontSize: '14px',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 300,
        };

        this.form.createField('#cc-number', {
            css,
            type: 'card-number',
            name: 'number',
            validations: ['required', 'validCardNumber'],
        });

        this.form.createField('#cc-cvc', {
            css,
            type: 'card-security-code',
            name: 'cvc',
            validations: ['required', 'validCardSecurityCode'],
        });

        this.form.createField('#cc-expiration-date', {
            css,
            type: 'card-expiration-date',
            name: 'expiryDate',
            placeholder: '01 / 2016',
            validations: ['required', 'validCardExpirationDate'],
        });
    }

    /**
     * Handles form submission
     *
     * @method handleSubmit
     *
     * @param {object} event
     */
    handleSubmit(event) {
        event.preventDefault();

        this.props.history.push('/exchanges/moonpay/review-purchase');
    }

    render() {
        const { t } = this.props;

        return (
            <form onSubmit={this.handleSubmit}>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}>{t('moonpay:addPaymentMethod')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:pleaseEnterYourBillingDetails')}
                            </p>
                        </div>
                    </Info>
                    <div className={css.input}>
                        <small>{t('moonpay:cardNumber')}</small>
                        <span id="cc-number" />
                    </div>
                    <div className={css.input}>
                        <small>{t('moonpay:cvc')}</small>
                        <span id="cc-cvc" />
                    </div>
                    <div className={css.input}>
                        <small>{t('moonpay:expirationDate')}</small>
                        <span id="cc-expiration-date" />
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
                        <Button type="submit" id="to-transfer-funds" className="square" variant="primary">
                            {t('global:continue')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

const mapDispatchToProps = {
    generateAlert,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(AddPaymentMethod));
