import head from 'lodash/head';
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import { getAccountNamesFromState } from 'selectors/accounts';
import { setAccountName } from 'actions/exchanges/MoonPay';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Icon from 'ui/components/Icon';
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
            goBack: PropTypes.func.isRequired,
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** @ignore */
        setAccountName: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        this.state = {
            accountName: props.accountName || head(this.props.accountNames),
        };
    }

    render() {
        const { accountNames, t } = this.props;

        return (
            <form>
                <Icon icon="moonpay" size={200} />
                <section className={css.long}>
                    <Info displayIcon={false}>
                        <div style={{ textAlign: 'center' }}>
                            <p style={{ fontSize: '28px' }}> {t('moonpay:selectAccount')}</p>
                            <p
                                style={{
                                    paddingTop: '20px',
                                }}
                            >
                                {t('moonpay:selectAccountExplanation')}
                            </p>
                        </div>
                    </Info>
                    <div style={{ width: '100%' }}>
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
                            onClick={() => {
                                this.props.history.push('/exchanges/moonpay/add-amount');
                                this.props.setAccountName(this.state.name);
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
});

const mapDispatchToProps = {
    setAccountName,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(SelectAccount));
