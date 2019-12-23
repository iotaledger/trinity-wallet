import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getAnimation } from 'animations';

import Button from 'ui/components/Button';
import Lottie from 'ui/components/Lottie';

import css from './index.scss';

/** MoonPay payment success screen component */
class PaymentSuccess extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, themeName } = this.props;

        return (
            <form>
                <section className={css.long}>
                    <div>
                        <React.Fragment>
                            <p>{t('moonpay:paymentSuccess')}</p>
                            <Lottie
                                width={250}
                                height={250}
                                data={getAnimation('onboardingComplete', themeName)}
                                loop={false}
                            />
                        </React.Fragment>
                        <p>{t('moonpay:paymentSuccessExplanation')}</p>
                    </div>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-purchase-receipt"
                            onClick={() => {
                                this.props.history.push('/exchanges/moonpay/purchase-receipt');
                            }}
                            className="square"
                            variant="primary"
                        >
                            {t('moonpay:viewReceipt')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
});

export default connect(mapStateToProps)(withTranslation()(PaymentSuccess));
