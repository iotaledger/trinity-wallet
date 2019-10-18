import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getTotalPurchaseAmount } from 'selectors/exchanges/MoonPay';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';

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
        totalAmount: PropTypes.string.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { totalAmount, t } = this.props;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}>{t('moonpay:reviewYourPurchase')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:pleaseCarefullyCheckOrder')}
                            </p>
                        </div>
                    </Info>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '25px',
                            fontSize: '22px',
                        }}
                    >
                        <span> {t('moonpay:order')}</span>
                        <span>20 Mi</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '7px',
                        }}
                    >
                        <span>{t('moonpay:trinityWalletAddress')}</span>
                    </div>
                    <div
                        style={{
                            textAlign: 'left',
                            marginBottom: '22px',
                        }}
                    >
                        <p style={{ wordWrap: 'break-word' }}>{'U'.repeat(81)}</p>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '7px',
                        }}
                    >
                        <span>{t('moonpay:debitCard', { brand: 'Visa' })}</span>
                        <span>**** **** **** 2536</span>
                    </div>
                    <div
                        style={{
                            display: 'flex',
                            justifyContent: 'space-between',
                            marginBottom: '25px',
                        }}
                    >
                        <span> {t('moonpay:cardExpiry', { brand: 'Visa' })}</span>
                        <span>12/20</span>
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
                            marginBottom: '25px',
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
                        <span>${totalAmount}</span>
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
                        <Button id="to-transfer-funds" onClick={() => {}} className="square" variant="primary">
                            {t('global:continue')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    totalAmount: getTotalPurchaseAmount(state),
});

export default connect(mapStateToProps)(withTranslation()(ReviewPurchase));
