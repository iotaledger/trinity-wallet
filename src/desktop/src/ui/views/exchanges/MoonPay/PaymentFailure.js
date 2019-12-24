import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getAnimation } from 'animations';

import Button from 'ui/components/Button';
import Lottie from 'ui/components/Lottie';

import css from './index.scss';

/** MoonPay payment failure screen component */
class PaymentFailure extends React.PureComponent {
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
                            <p>{t('moonpay:paymentFailure')}</p>
                            <Lottie
                                width={180}
                                height={180}
                                data={getAnimation('sendingDesktop', themeName)}
                                segments={[89, 624]}
                                loop
                            />
                        </React.Fragment>
                        <p>{t('moonpay:paymentFailureExplanation')}</p>
                    </div>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-review-purchase"
                            onClick={() => {
                                this.props.history.push('/wallet');
                            }}
                            className="square"
                            variant="primary"
                        >
                            {t('global:goToDashboard')}
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

export default connect(mapStateToProps)(withTranslation()(PaymentFailure));
