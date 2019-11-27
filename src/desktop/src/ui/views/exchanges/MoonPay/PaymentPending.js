import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getAnimation } from 'animations';
import { getActiveTransaction } from 'selectors/exchanges/MoonPay';

import { fetchTransactionDetails } from 'actions/exchanges/MoonPay';

import { MOONPAY_TRANSACTION_STATUSES } from 'exchanges/MoonPay';

import Button from 'ui/components/Button';
import Lottie from 'ui/components/Lottie';

import css from './index.scss';

/** MoonPay payment pending screen component */
class PaymentPending extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
            location: PropTypes.object.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        isFetchingTransactionDetails: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorFetchingTransactionDetails: PropTypes.bool.isRequired,
        /** @ignore */
        activeTransaction: PropTypes.object,
        /** @ignore */
        fetchTransactionDetails: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        const { t } = props;

        this.state = {
            subtitle: t('moonpay:paymentPendingExplanation'),
            buttonText: t('moonpay:viewReceipt'),
            hasErrorFetchingTransactionDetails: false,
        };

        this.onButtonPress = this.onButtonPress.bind(this);
    }

    componentDidMount() {
        const { activeTransaction, t } = this.props;
        const status = get(activeTransaction, 'status');

        if (status === MOONPAY_TRANSACTION_STATUSES.completed) {
            this.props.history.push('/exchanges/moonpay/payment-success');
        } else if (status === MOONPAY_TRANSACTION_STATUSES.failed) {
            this.props.history.push('/exchanges/moonpay/payment-failure');
        } else if (status === MOONPAY_TRANSACTION_STATUSES.waitingAuthorization) {
            this.setState({
                subtitle: t('moonpay:pleaseComplete3DSecure'),
                buttonText: t('global:complete'),
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
                    this.props.history.push('/exchanges/moonpay/payment-success');
                } else if (status === MOONPAY_TRANSACTION_STATUSES.failed) {
                    this.props.history.push('/exchanges/moonpay/payment-failure');
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

    /**
     * Renders buttons in case of errors
     *
     * @method renderButtons
     *
     * @returns {void}
     */
    renderButtons() {
        const { history, activeTransaction, t } = this.props;
        const transactionId = get(history.location, 'state.transactionId');

        return (
            <div>
                <Button
                    id="to-cancel"
                    onClick={() => this.props.history.push('/wallet')}
                    className="square"
                    variant="dark"
                >
                    {t('global:close')}
                </Button>
                <Button
                    id="to-purchase-receipt"
                    onClick={() => {
                        this.props.fetchTransactionDetails(transactionId || get(activeTransaction, 'id'));
                        this.setState({
                            hasErrorFetchingTransactionDetails: false,
                        });
                    }}
                    className="square"
                    variant="primary"
                >
                    {t('global:tryAgain')}
                </Button>
            </div>
        );
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
            window.open(get(activeTransaction, 'redirectUrl'));
        } else {
            this.props.history.push('/exchanges/moonpay/purchase-receipt');
        }
    }

    render() {
        const { t, themeName, isFetchingTransactionDetails } = this.props;
        const { hasErrorFetchingTransactionDetails, subtitle, buttonText } = this.state;

        return (
            <form>
                <section className={css.long}>
                    <div>
                        <React.Fragment>
                            <p>{t('moonpay:paymentPending')}</p>
                            <Lottie
                                width={250}
                                height={250}
                                data={getAnimation('onboardingComplete', themeName)}
                                loop={false}
                            />
                        </React.Fragment>
                        <p>{subtitle}</p>
                    </div>
                </section>
                <footer className={css.choiceDefault}>
                    {hasErrorFetchingTransactionDetails ? (
                        this.renderButtons()
                    ) : (
                        <div>
                            <Button
                                loading={isFetchingTransactionDetails}
                                id="to-purchase-receipt"
                                onClick={this.onButtonPress}
                                className="square"
                                variant="primary"
                            >
                                {buttonText}
                            </Button>
                        </div>
                    )}
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
    isFetchingTransactionDetails: state.exchanges.moonpay.isFetchingTransactionDetails,
    hasErrorFetchingTransactionDetails: state.exchanges.moonpay.hasErrorFetchingTransactionDetails,
    activeTransaction: getActiveTransaction(state),
});

const mapDispatchToProps = {
    fetchTransactionDetails,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(PaymentPending));
