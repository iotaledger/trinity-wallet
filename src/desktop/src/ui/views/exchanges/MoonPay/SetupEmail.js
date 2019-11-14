import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { authenticateViaEmail } from 'actions/exchanges/MoonPay';
import { generateAlert } from 'actions/alerts';
import { isValidEmail } from 'libs/utils';

import Button from 'ui/components/Button';
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

    constructor(props) {
        super(props);

        this.state = {
            email: '',
        };

        this.authenticateViaEmail = this.authenticateViaEmail.bind(this);
    }

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
            <form onSubmit={this.authenticateViaEmail}>
                <section className={css.long}>
                    <div>
                        <p> {t('moonpay:setupEmail')}</p>
                        <p>{t('moonpay:setupEmailExplanation')}</p>
                    </div>
                    <fieldset>
                        <Input
                            focus
                            value={email}
                            name="email"
                            label={t('moonpay:yourEmail')}
                            onChange={(updatedEmail) => this.setState({ email: updatedEmail })}
                        />
                    </fieldset>
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
                            id="to-verify-email"
                            type="submit"
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
