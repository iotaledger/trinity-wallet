import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getCustomerEmail } from 'selectors/exchanges/MoonPay';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
import Input from 'ui/components/input/Text';

import css from './index.scss';

/** MoonPay verify email screen component */
class VerifyEmail extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        email: PropTypes.string.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        securityCode: '',
    };

    render() {
        const { email, t } = this.props;
        const { securityCode } = this.state;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}> {t('moonpay:checkInbox')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:verificationCodeSent', { email })}
                            </p>
                        </div>
                    </Info>
                    <div style={{ width: '100%' }}>
                        <Input
                            style={{ maxWidth: '100%' }}
                            value={securityCode}
                            label={t('moonpay:verificationCode')}
                            onChange={(updatedSecurityCode) => this.setState({ securityCode: updatedSecurityCode })}
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
                            onClick={() => this.props.history.push('/exchanges/moonpay/user-basic-info')}
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
    email: getCustomerEmail(state),
});

export default connect(mapStateToProps)(withTranslation()(VerifyEmail));
