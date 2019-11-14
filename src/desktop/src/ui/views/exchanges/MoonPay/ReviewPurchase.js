import get from 'lodash/get';
import React from 'react';
import PropTypes from 'prop-types';

import { TRANSACTION_STATUS_WAITING_AUTHORIZATION } from 'exchanges/MoonPay';

import Button from 'ui/components/Button';
import withPurchaseSummary from 'ui/views/exchanges/MoonPay/WithPurchaseSummary';

import css from './index.scss';

/** MoonPay review purchase screen component */
class ReviewPurchase extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        children: PropTypes.node.isRequired,
        /** @ignore */
        isCreatingTransaction: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorCreatingTransaction: PropTypes.bool.isRequired,
        /** @ignore */
        createTransaction: PropTypes.func.isRequired,
        /** @ignore */
        activeTransaction: PropTypes.object,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    componentWillReceiveProps(nextProps) {
        if (
            this.props.isCreatingTransaction &&
            !nextProps.isCreatingTransaction &&
            !nextProps.hasErrorCreatingTransaction
        ) {
            const { activeTransaction } = nextProps;

            // See https://www.moonpay.io/api_reference/v3#three_d_secure
            if (get(activeTransaction, 'status') === TRANSACTION_STATUS_WAITING_AUTHORIZATION) {
                window.open(get(activeTransaction, 'redirectUrl'));
            } else {
                this.props.history.push('/exchanges/moonpay/purchase-complete');
            }
        }
    }

    render() {
        const { isCreatingTransaction, createTransaction, children, t } = this.props;

        return (
            <form onSubmit={createTransaction}>
                <section className={css.long}>
                    <div>
                        <p>{t('moonpay:reviewYourPurchase')}</p>
                        <p>{t('moonpay:pleaseCarefullyCheckOrder')}</p>
                    </div>
                    {children}
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            disabled={isCreatingTransaction}
                            id="to-cancel"
                            onClick={() => this.props.history.goBack()}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            loading={isCreatingTransaction}
                            id="to-purchase-complete"
                            type="submit"
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

export default withPurchaseSummary(ReviewPurchase);
