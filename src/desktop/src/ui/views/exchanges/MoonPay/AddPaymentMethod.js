import get from 'lodash/get';
import noop from 'lodash/noop';
import some from 'lodash/some';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { generateAlert } from 'actions/alerts';
import { createPaymentCard } from 'actions/exchanges/MoonPay';
import { getThemeFromState } from 'selectors/global';
import { API_KEY } from 'exchanges/MoonPay';
import { getCustomerAddress, getCustomerPaymentCards, getCustomerId } from 'selectors/exchanges/MoonPay';

import Button from 'ui/components/Button';

import css from './index.scss';

/** MoonPay add payment method screen component */
class AddPaymentMethod extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        address: PropTypes.object.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        customerId: PropTypes.string.isRequired,
        /** @ignore */
        paymentCards: PropTypes.array.isRequired,
        /** @ignore */
        isCreatingPaymentCard: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorCreatingPaymentCard: PropTypes.bool.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        createPaymentCard: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.handleSubmit = this.handleSubmit.bind(this);

        this.state = {
            /**
             * Determines if a network call is in progress for token creation
             */
            isCreatingToken: false,
        };
    }

    componentDidMount() {
        const { theme, customerId } = this.props;

        window.moonpay.initialize(API_KEY, customerId);
        window.moonpay.trackPageView();

        this.form = window.moonpay.createCardDetailsForm(noop);

        const css = {
            color: theme.input.color,
            fontSize: '14px',
            fontFamily: 'Source Sans Pro, sans-serif',
            fontWeight: 300,
        };

        this.form.createField('#cc-number', {
            css,
            errorColor: theme.negative.color,
            type: 'card-number',
            name: 'number',
            validations: ['required', 'validCardNumber'],
        });

        this.form.createField('#cc-cvc', {
            css,
            errorColor: theme.negative.color,
            type: 'card-security-code',
            name: 'cvc',
            validations: ['required', 'validCardSecurityCode'],
        });

        this.form.createField('#cc-expiration-date', {
            css,
            errorColor: theme.negative.color,
            type: 'card-expiration-date',
            name: 'expiryDate',
            placeholder: '01 / 2016',
            validations: ['required', 'validCardExpirationDate'],
        });
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isCreatingPaymentCard && !nextProps.isCreatingPaymentCard) {
            const { t } = this.props;

            nextProps.hasErrorCreatingPaymentCard
                ? this.props.generateAlert(
                      'error',
                      t('moonpay:paymentCardCreationError'),
                      t('moonpay:paymentCardCreationErrorExplanation'),
                  )
                : this.props.history.push('/exchanges/moonpay/review-purchase');
        }
    }

    /**
     * Checks if form for payment card details is valid
     *
     * @method isFormValid
     *
     * @returns {boolean}
     */
    isFormValid() {
        const { state } = this.form;

        return state.number.isValid && state.cvc.isValid && state.expiryDate.isValid;
    }

    /**
     * Handles form submission
     *
     * @method handleSubmit
     *
     * @param {object} event
     *
     * @returns {void}
     */
    handleSubmit(event) {
        event.preventDefault();

        const { address, paymentCards, t } = this.props;

        if (this.isFormValid()) {
            this.setState({ isCreatingToken: true });

            this.form.submit(
                address,
                (status, response) => {
                    this.setState({ isCreatingToken: false });

                    if (status.toString().startsWith('2')) {
                        if (
                            some(paymentCards, (card) => {
                                return (
                                    get(card, 'brand') === get(response, 'brand') &&
                                    get(card, 'lastDigits') === get(response, 'lastDigits')
                                );
                            })
                        ) {
                            this.props.generateAlert(
                                'error',
                                t('moonpay:duplicateCard'),
                                t('moonpay:duplicateCardExplanation'),
                            );
                        } else {
                            this.props.createPaymentCard(get(response, 'id'));
                        }
                    } else {
                        this.props.generateAlert(
                            'error',
                            t('global:somethingWentWrong'),
                            t('moonpay:somethingWentWrongProcessingCardInfo'),
                        );
                    }
                },
                () => {
                    this.setState({ isCreatingToken: false });
                    this.props.generateAlert(
                        'error',
                        t('global:somethingWentWrong'),
                        t('moonpay:somethingWentWrongProcessingCardInfo'),
                    );
                },
            );
        } else {
            if (!this.form.state.number.isValid) {
                this.props.generateAlert(
                    'error',
                    t('moonpay:invalidCardNumber'),
                    t('moonpay:invalidCardNumberExplanation'),
                );
            } else if (!this.form.state.cvc.isValid) {
                this.props.generateAlert('error', t('moonpay:invalidCvc'), t('moonpay:invalidCvcExplanation'));
            } else if (!this.form.state.expiryDate.isValid) {
                this.props.generateAlert(
                    'error',
                    t('moonpay:invalidExpiryDate'),
                    t('moonpay:invalidExpiryDateExplanation'),
                );
            }
        }
    }

    render() {
        const { isCreatingPaymentCard, t } = this.props;
        const { isCreatingToken } = this.state;

        return (
            <form onSubmit={this.handleSubmit}>
                <section className={css.long}>
                    <div>
                        <p>{t('moonpay:addPaymentMethod')}</p>
                        <p>{t('moonpay:pleaseEnterYourBillingDetails')}</p>
                    </div>
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
                            disabled={isCreatingToken || isCreatingPaymentCard}
                            id="to-cancel"
                            onClick={() => this.props.history.push('/exchanges/moonpay/user-advanced-info')}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            loading={isCreatingToken || isCreatingPaymentCard}
                            type="submit"
                            id="to-review-purchase"
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
    theme: getThemeFromState(state),
    address: getCustomerAddress(state),
    customerId: getCustomerId(state),
    paymentCards: getCustomerPaymentCards(state),
    isCreatingPaymentCard: state.exchanges.moonpay.isCreatingPaymentCard,
    hasErrorCreatingPaymentCard: state.exchanges.moonpay.hasErrorCreatingPaymentCard,
});

const mapDispatchToProps = {
    generateAlert,
    createPaymentCard,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(AddPaymentMethod));
