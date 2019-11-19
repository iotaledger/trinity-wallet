import head from 'lodash/head';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getAccountNamesFromState } from 'selectors/accounts';
import { setAccountName } from 'actions/exchanges/MoonPay';

import Button from 'ui/components/Button';
import Select from 'ui/components/input/Select';

import css from './index.scss';

/** MoonPay select account screen component */
class SelectAccount extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        accountName: PropTypes.string.isRequired,
        /** @ignore */
        history: PropTypes.shape({
            go: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setAccountName: PropTypes.func.isRequired,
        /** @ignore */
        isAuthenticatedForMoonPay: PropTypes.bool.isRequired
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: props.accountName || head(props.accountNames),
        };
    }

    render() {
        const { isAuthenticatedForMoonPay, accountNames, t } = this.props;

        return (
            <form>
                <section className={css.long}>
                    <div>
                        <p> {t('moonpay:selectAccount')}</p>
                        <p>{t('moonpay:selectAccountExplanation')}</p>
                    </div>
                    <fieldset>
                        <Select
                            value={this.state.accountName}
                            onChange={(newAccountName) => {
                                this.setState({ accountName: newAccountName });
                                this.props.setAccountName(newAccountName);
                            }}
                            options={accountNames.map((item) => {
                                return { value: item, label: item };
                            })}
                        />
                    </fieldset>
                </section>
                <footer className={css.choiceDefault}>
                    <div>
                        <Button
                            id="to-cancel"
                            onClick={() => this.props.history.go(isAuthenticatedForMoonPay ? -1 : -2)}
                            className="square"
                            variant="dark"
                        >
                            {t('global:goBack')}
                        </Button>
                        <Button
                            id="to-add-amount"
                            onClick={() => {
                                this.props.history.push('/exchanges/moonpay/add-amount');
                                this.props.setAccountName(this.state.accountName);
                            }}
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
    accountNames: getAccountNamesFromState(state),
    accountName: state.exchanges.moonpay.accountName,
    isAuthenticatedForMoonPay: state.exchanges.moonpay.isAuthenticated,
});

const mapDispatchToProps = {
    setAccountName,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(SelectAccount));
