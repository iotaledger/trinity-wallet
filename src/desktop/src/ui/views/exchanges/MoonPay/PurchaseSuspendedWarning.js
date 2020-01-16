import React from 'react';
import PropTypes from 'prop-types';
import { withTranslation } from 'react-i18next';

import Button from 'ui/components/Button';

import css from './index.scss';

/** MoonPay purchase suspended screen component */
class PurchaseSuspendedWarning extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;

        return (
            <form onSubmit={this.redirect}>
                <section className={css.long}>
                    <div>
                        <p> {t('moonpay:purchasesAreSuspended')}</p>
                        <p>{t('moonpay:purchasesAreSuspendedExplanation')}</p>
                    </div>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            onClick={() => this.props.history.push('/wallet')}
                            className="square"
                            variant="primary"
                        >
                            {t('global:goBack')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

export default withTranslation()(PurchaseSuspendedWarning);
