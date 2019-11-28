import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { MOONPAY_PRIVACY_POLICY_LINK, MOONPAY_TERMS_OF_USE_LINK } from 'exchanges/MoonPay';
import { getCustomerEmail } from 'selectors/exchanges/MoonPay';
import { generateAlert } from 'actions/alerts';
import { verifyEmailAndFetchMeta, setLoggingIn } from 'actions/exchanges/MoonPay';
import MoonPayKeychainAdapter from 'libs/MoonPay';

import Button from 'ui/components/Button';
import Checkbox from 'ui/components/Checkbox';
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
        /** @ignore */
        setLoggingIn: PropTypes.func.isRequired,
        /** @ignore */
        isLoggingIn: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            securityCode: '',
            agreeWithMoonPayTerms: false,
        };

        this.verify = this.verify.bind(this);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isVerifyingEmail && !nextProps.isVerifyingEmail && !nextProps.hasErrorVerifyingEmail) {
            if (this.props.isLoggingIn) {
                this.props.setLoggingIn(false);
                return this.props.history.push('/wallet');
            }
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

        return this.props.verifyEmailAndFetchMeta(this.state.securityCode, MoonPayKeychainAdapter);
    }

    render() {
        const { email, isVerifyingEmail, t } = this.props;
        const { agreeWithMoonPayTerms, securityCode } = this.state;

        return (
            <form onSubmit={this.verify}>
                <section className={css.long}>
                    <div>
                        <p>{t('moonpay:checkInbox')}</p>
                        <p>{t('moonpay:verificationCodeSent', { email })}</p>
                    </div>
                    <fieldset>
                        <Input
                            focus
                            value={securityCode}
                            label={t('moonpay:verificationCode')}
                            onChange={(updatedSecurityCode) => this.setState({ securityCode: updatedSecurityCode })}
                        />
                    </fieldset>
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
                            id="to-select-account"
                            type="submit"
                            loading={isVerifyingEmail}
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
    isLoggingIn: state.exchanges.moonpay.isLoggingIn,
});

const mapDispatchToProps = {
    generateAlert,
    verifyEmailAndFetchMeta,
    setLoggingIn
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(VerifyEmail));
