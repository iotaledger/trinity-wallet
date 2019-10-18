import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { setAmount } from 'actions/exchanges/MoonPay';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
import Input from 'ui/components/input/Text';

import css from './index.scss';

/** MoonPay add amount screen component */
class AddAmount extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        amount: PropTypes.string.isRequired,
        /** @ignore */
        setAmount: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { amount, t } = this.props;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}>{t('moonpay:addAmount')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:addAmountExplanation')}
                            </p>
                        </div>
                    </Info>
                    <div style={{ width: '100%' }}>
                        <Input
                            style={{ maxWidth: '100%' }}
                            value={amount}
                            label={t('moonpay:enterAmount')}
                            onChange={(newAmount) => {
                                this.props.setAmount(newAmount);
                            }}
                        />
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '7px',
                        }}
                    >
                        <span>{t('moonpay:youWillReceive')}</span>
                        <span>20 Mi</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '7px',
                        }}
                    >
                        <span>{t('moonpay:marketPrice')}: 20 Mi @ $0.28</span>
                        <span>$20</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '30px',
                        }}
                    >
                        <span>{t('moonpay:moonpayFee')}</span>
                        <span>$4.99</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            fontSize: '22px',
                        }}
                    >
                        <span>{t('global:total')}</span>
                        <span>$10</span>
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
                            onClick={() => this.props.history.push('/exchanges/moonpay/select-account')}
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
    amount: state.exchanges.moonpay.amount,
});

const mapDispatchToProps = {
    setAmount,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(AddAmount));
