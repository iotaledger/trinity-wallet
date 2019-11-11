import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { authenticateViaEmail } from 'actions/exchanges/MoonPay';
import { generateAlert } from 'actions/alerts';
import { isValidEmail } from 'libs/utils';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
import Input from 'ui/components/input/Text';

import css from './index.scss';

/** MoonPay setup email screen component */
class SetupEmail extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        isAuthenticatingEmail: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorAuthenticatingEmail: PropTypes.bool.isRequired,
        /** @ignore */
        authenticateViaEmail: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
    };

    state = {
        email: '',
    };

    componentWillReceiveProps(nextProps) {
        if (
            this.props.isAuthenticatingEmail &&
            !nextProps.isAuthenticatingEmail &&
            !nextProps.hasErrorAuthenticatingEmail
        ) {
            this.props.history.push('/exchanges/moonpay/verify-email');
        }
    }

    /**
     * Authenticates user via email
     *
     * @method authenticateViaEmail
     *
     * @returns {function}
     */
    authenticateViaEmail() {
        const { email } = this.state;
        const { t } = this.props;

        if (!email) {
            return this.props.generateAlert('error', t('moonpay:emptyEmail'), t('moonpay:emptyEmailExplanation'));
        } else if (!isValidEmail(email)) {
            return this.props.generateAlert('error', t('moonpay:invalidEmail'), t('moonpay:invalidEmailExplanation'));
        }

        return this.props.authenticateViaEmail(email);
    }

    render() {
        const { isAuthenticatingEmail, t } = this.props;
        const { email } = this.state;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}> {t('moonpay:setupEmail')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:setupEmailExplanation')}
                            </p>
                        </div>
                    </Info>
                    <div style={{ width: '100%' }}>
                        <Input
                            style={{ maxWidth: '100%' }}
                            value={email}
                            label={t('moonpay:yourEmail')}
                            onChange={(updatedEmail) => this.setState({ email: updatedEmail })}
                        />
                    </div>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            disabled={isAuthenticatingEmail}
                            id="to-cancel"
                            onClick={() => this.props.history.goBack()}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            loading={isAuthenticatingEmail}
                            id="to-transfer-funds"
                            onClick={() => this.authenticateViaEmail()}
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
    isAuthenticatingEmail: state.exchanges.moonpay.isAuthenticatingEmail,
    hasErrorAuthenticatingEmail: state.exchanges.moonpay.hasErrorAuthenticatingEmail,
});

const mapDispatchToProps = {
    authenticateViaEmail,
    generateAlert,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(SetupEmail));
