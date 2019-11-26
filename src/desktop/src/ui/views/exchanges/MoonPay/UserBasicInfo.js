import isNull from 'lodash/isNull';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { updateCustomer } from 'actions/exchanges/MoonPay';
import { generateAlert } from 'actions/alerts';
import { moment } from 'libs/exports';

import Button from 'ui/components/Button';
import Input from 'ui/components/input/Text';

import css from './index.scss';

/** MoonPay user basic info screen component */
class UserBasicInfo extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        isUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        hasErrorUpdatingCustomer: PropTypes.bool.isRequired,
        /** @ignore */
        firstName: PropTypes.string,
        /** @ignore */
        lastName: PropTypes.string,
        /** @ignore */
        dateOfBirth: PropTypes.string,
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        updateCustomer: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            firstName: isNull(this.props.firstName) ? '' : this.props.firstName,
            lastName: isNull(this.props.lastName) ? '' : this.props.lastName,
            dateOfBirth: moment(
                props.dateOfBirth ||
                    // Using 1970 as default
                    new Date(1970),
            ).format('DD/MM/YYYY'),
        };
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.isUpdatingCustomer && !nextProps.isUpdatingCustomer && !nextProps.hasErrorUpdatingCustomer) {
            this.props.history.push('/exchanges/moonpay/user-advanced-info');
        }
    }

    /**
     * Updates customer information
     *
     * @method updateCustomer
     *
     * @returns {function}
     */
    updateCustomer() {
        const { t } = this.props;

        if (!this.state.firstName) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidFirstName'),
                t('moonpay:invalidFirstNameExplanation'),
            );
        }

        if (!this.state.lastName) {
            return this.props.generateAlert(
                'error',
                t('moonpay:invalidLastName'),
                t('moonpay:invalidLastNameExplanation'),
            );
        }

        return this.props.updateCustomer({
            firstName: this.state.firstName,
            lastName: this.state.lastName,
            dateOfBirth: moment(this.state.dateOfBirth, 'DD/MM/YYYY').toISOString(),
        });
    }

    /**
     * Updates date of birth value
     *
     * @method updateDateOfBirth
     *
     * @param {string} newDateOfBirth
     *
     * @returns {void}
     */
    updateDateOfBirth(newDateOfBirth) {
        const value = newDateOfBirth.replace(/\D/g, '').slice(0, 10);

        if (value.length >= 5) {
            this.setState({ dateOfBirth: `${value.slice(0, 2)}/${value.slice(2, 4)}/${value.slice(4, 8)}` });
        } else if (value.length >= 3) {
            this.setState({ dateOfBirth: `${value.slice(0, 2)}/${value.slice(2)}` });
        } else {
            this.setState({ dateOfBirth: value });
        }
    }

    render() {
        const { isUpdatingCustomer, t } = this.props;
        const { firstName, lastName, dateOfBirth } = this.state;

        return (
            <form>
                <section className={css.long}>
                    <div>
                        <p>{t('moonpay:tellUsMore')}</p>
                        <p>{t('moonpay:cardRegistrationName')}</p>
                    </div>
                    <fieldset>
                        <Input
                            focus
                            value={firstName}
                            label={t('moonpay:firstName')}
                            onChange={(updatedFirstName) => this.setState({ firstName: updatedFirstName })}
                        />
                        <Input
                            value={lastName}
                            label={t('moonpay:lastName')}
                            onChange={(updatedLastName) => this.setState({ lastName: updatedLastName })}
                        />
                        <Input
                            value={dateOfBirth}
                            label={t('moonpay:dateOfBirth')}
                            onChange={(updatedDateOfBirth) => this.updateDateOfBirth(updatedDateOfBirth)}
                        />
                    </fieldset>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            disabled={isUpdatingCustomer}
                            id="to-cancel"
                            onClick={() => this.props.history.goBack()}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            loading={isUpdatingCustomer}
                            id="to-user-advanced-info"
                            onClick={() => this.updateCustomer()}
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
    isUpdatingCustomer: state.exchanges.moonpay.isUpdatingCustomer,
    hasErrorUpdatingCustomer: state.exchanges.moonpay.hasErrorUpdatingCustomer,
    firstName: state.exchanges.moonpay.customer.firstName,
    lastName: state.exchanges.moonpay.customer.lastName,
    dateOfBirth: state.exchanges.moonpay.customer.dateOfBirth,
});

const mapDisaptchToProps = {
    generateAlert,
    updateCustomer,
};

export default connect(mapStateToProps, mapDisaptchToProps)(withTranslation()(UserBasicInfo));
