import isNull from 'lodash/isNull';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
import Input from 'ui/components/input/Text';

import css from './index.scss';

/** MoonPay user basic info screen component */
class UserBasicInfo extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        firstName: PropTypes.string.isRequired,
        /** @ignore */
        lastName: PropTypes.string.isRequired,
        /** @ignore */
        dateOfBirth: PropTypes.string.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        firstName: isNull(this.props.firstName) ? '' : this.props.firstName,
        lastName: isNull(this.props.lastName) ? '' : this.props.lastName,
        dateOfBirth: isNull(this.props.dateOfBirth) ? '' : this.props.dateOfBirth,
    };

    render() {
        const { t } = this.props;
        const { firstName, lastName, dateOfBirth } = this.state;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}> {t('moonpay:tellUsMore')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:cardRegistrationName')}
                            </p>
                        </div>
                    </Info>
                    <div style={{ width: '100%' }}>
                        <Input
                            style={{ maxWidth: '100%' }}
                            value={firstName}
                            label={t('moonpay:firstName')}
                            onChange={(updatedFirstName) => this.setState({ firstName: updatedFirstName })}
                        />
                    </div>
                    <div style={{ width: '100%' }}>
                        <Input
                            style={{ maxWidth: '100%' }}
                            value={lastName}
                            label={t('moonpay:lastName')}
                            onChange={(updatedLastName) => this.setState({ lastName: updatedLastName })}
                        />
                    </div>
                    <div style={{ width: '100%' }}>
                        <Input
                            style={{ maxWidth: '100%' }}
                            value={dateOfBirth}
                            label={t('moonpay:dateOfBirth')}
                            onChange={(updatedDateOfBirth) => this.setState({ dateOfBirth: updatedDateOfBirth })}
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
                            onClick={() => this.props.history.push('/exchanges/moonpay/user-advanced-info')}
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
    firstName: state.exchanges.moonpay.customer.firstName,
    lastName: state.exchanges.moonpay.customer.lastName,
    dateOfBirth: state.exchanges.moonpay.customer.dateOfBirth,
});

export default connect(mapStateToProps)(withTranslation()(UserBasicInfo));
