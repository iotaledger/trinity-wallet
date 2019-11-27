import React from 'react';
import PropTypes from 'prop-types';

import Button from 'ui/components/Button';
import withPurchaseSummary from 'ui/views/exchanges/MoonPay/WithPurchaseSummary';

import css from './index.scss';

/** MoonPay purchase receipt screen component */
class PurchaseReceipt extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        children: PropTypes.node.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.redirectToDashboard = this.redirectToDashboard.bind(this);
    }

    /**
     * Redirects to wallet dashboard
     *
     * @method redirectToDashboard
     *
     * @returns {void}
     */
    redirectToDashboard() {
        const { history, t, generateAlert } = this.props;

        generateAlert('success', t('moonpay:purchaseComplete'), t('moonpay:transactionMayTakeAFewMinutes'), 12000);

        history.push('/wallet');
    }

    render() {
        const { children, t } = this.props;

        return (
            <form onSubmit={this.redirectToDashboard}>
                <section className={css.withSummary}>
                    <div>
                        <p>{t('moonpay:purchaseComplete')}</p>
                        <p>{t('moonpay:transactionMayTakeAFewMinutes')}</p>
                    </div>
                    {children}
                </section>
                <footer>
                    <Button id="done-next" type="submit" className="square" variant="primary">
                        {t('global:done')}
                    </Button>
                </footer>
            </form>
        );
    }
}

export default withPurchaseSummary(PurchaseReceipt);
