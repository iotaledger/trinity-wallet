import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
import Input from 'ui/components/input/Text';

import css from './index.scss';

/** MoonPay add payment method screen component */
class AddPaymentMethod extends React.PureComponent {
    static propTypes = {
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

    state = {
        cardNumber: '',
        cvv: '',
        expiryDate: '',
    };

    render() {
        const { t } = this.props;
        const { cardNumber, cvv, expiryDate } = this.state;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}> Add a payment method</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                Please enter your billing details below
                            </p>
                        </div>
                    </Info>
                    <div style={{ width: '100%' }}>
                        <Input
                            style={{ maxWidth: '100%' }}
                            value={cardNumber}
                            label="CARD NUMBER"
                            onChange={(value) => this.setState({ cardNumber: value })}
                        />
                    </div>
                    <div style={{ display: 'flex' }}>
                        <Input
                            value={expiryDate}
                            label="EXPIRY DATE"
                            onChange={(value) => this.setState({ expiryDate: value })}
                        />
                        <Input
                            style={{ marginLeft: '30px' }}
                            value={cvv}
                            label="CVV"
                            onChange={(value) => this.setState({ cvv: value })}
                        />
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
                        <Button
                            id="to-transfer-funds"
                            onClick={() => this.props.history.push('/exchanges/moonpay/review-purchase')}
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

const mapDispatchToProps = {
    generateAlert,
};

export default connect(
    null,
    mapDispatchToProps,
)(withTranslation()(AddPaymentMethod));
