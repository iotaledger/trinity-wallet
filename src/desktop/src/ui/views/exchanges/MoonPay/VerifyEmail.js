import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { MOONPAY_PRIVACY_POLICY_LINK, MOONPAY_TERMS_OF_USE_LINK } from 'exchanges/MoonPay';
import { getCustomerEmail } from 'selectors/exchanges/MoonPay';
import { generateAlert } from 'actions/alerts';
import { verifyEmailAndFetchMeta } from 'actions/exchanges/MoonPay';

import Button from 'ui/components/Button';
import Checkbox from 'ui/components/Checkbox';
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
        isVerifyingEmail: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorVerifyingEmail: PropTypes.bool.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        verifyEmailAndFetchMeta: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        securityCode: '',
        agreeWithMoonPayTerms: false,
    };

    componentWillReceiveProps(nextProps) {
        if (this.props.isVerifyingEmail && !nextProps.isVerifyingEmail && !nextProps.hasErrorVerifyingEmail) {
            this.props.history.push('/exchanges/moonpay/select-account');
        }
    }

    /**
     * Verifies user email
     *
     * @method verify
     *
     * @returns {function}
     */
    verify() {
        const { t } = this.props;

        if (!this.state.securityCode) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidSecurityCode'),
                t('moonpay:pleaseEnterValidSecurityCode'),
            );
        }

        if (!this.state.agreeWithMoonPayTerms) {
            return this.props.generateAlert(
                'error',
                t('moonpay:notAcceptedTermsOfUse'),
                t('moonpay:pleaseAcceptMoonPayTermsOfUse'),
            );
        }

        return this.props.verifyEmailAndFetchMeta(this.state.securityCode);
    }

    render() {
        const { email, isVerifyingEmail, t } = this.props;
        const { agreeWithMoonPayTerms, securityCode } = this.state;

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
                    <div className={css.agreement}>
                        <Checkbox
                            checked={agreeWithMoonPayTerms}
                            className="small"
                            onChange={(value) => this.setState({ agreeWithMoonPayTerms: value })}
                        />
                        <span>
                            {t('moonpay:agreeWithMoonPay')}{' '}
                            <a href={MOONPAY_TERMS_OF_USE_LINK}>{t('moonpay:termsOfUse')}</a> {t('global:and')}{' '}
                            <a href={MOONPAY_PRIVACY_POLICY_LINK}>{t('privacyPolicy:privacyPolicy')}</a>
                        </span>
                    </div>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            disabled={isVerifyingEmail}
                            onClick={() => this.props.history.goBack()}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            id="to-transfer-funds"
                            loading={isVerifyingEmail}
                            onClick={() => this.verify()}
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
    isVerifyingEmail: state.exchanges.moonpay.isVerifyingEmail,
    hasErrorVerifyingEmail: state.exchanges.moonpay.hasErrorVerifyingEmail,
});

const mapDispatchToProps = {
    generateAlert,
    verifyEmailAndFetchMeta,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(VerifyEmail));
