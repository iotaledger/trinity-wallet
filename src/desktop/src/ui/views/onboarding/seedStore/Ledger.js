import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';

import SeedStore from 'libs/SeedStore';

import { generateAlert } from 'actions/alerts';
import { setAccountInfoDuringSetup } from 'actions/accounts';

import Button from 'ui/components/Button';
import Number from 'ui/components/input/Number';
import Toggle from 'ui/components/Toggle';

import css from './index.scss';

/**
 * Onboarding, set Ledger account index
 */
class Ledger extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        additionalAccountMeta: PropTypes.object.isRequired,
        /** @ignore */
        accounts: PropTypes.object.isRequired,
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        /** @ignore */
        history: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        index: this.props.additionalAccountMeta.index || 0,
        page: this.props.additionalAccountMeta.page || 0,
        loading: false,
        advancedMode: false,
    };

    /**
     * Check for unused ledger index and set it to state
     * @param {Event} event - Form submit event
     * @returns {undefined}
     */
    setIndex = async (event) => {
        const { index, page } = this.state;
        const { accounts, generateAlert, history, t } = this.props;

        event.preventDefault();

        this.setState({
            loading: true,
        });

        try {
            const vault = await new SeedStore.ledger(null, null, { index, page });
            const indexAddress = await vault.generateAddress({
                index: 0,
                security: 1,
            });

            this.setState({
                loading: false,
            });

            const existingAccount = Object.keys(accounts).find(
                (account) =>
                    accounts[account].meta &&
                    accounts[account].meta.type === 'ledger' &&
                    accounts[account].meta.indexAddress === indexAddress,
            );

            if (existingAccount) {
                return generateAlert(
                    'error',
                    t('ledger:indexInUse', { account: existingAccount }),
                    t('ledger:indexInUseExplanation', { account: existingAccount }),
                );
            }

            this.props.setAccountInfoDuringSetup({
                meta: { type: 'ledger', index, page, indexAddress },
            });

            history.push('/onboarding/account-name');
        } catch (error) {
            if (error.statusCode === 27014) {
                generateAlert(
                    'error',
                    t('ledger:applicationNotInitialised'),
                    t('ledger:applicationNotInitialisedExplanation'),
                );
            }
            this.setState({
                loading: false,
            });
        }
    };

    render() {
        const { t } = this.props;
        const { page, index, loading, advancedMode } = this.state;

        return (
            <form className={css.ledger} onSubmit={this.setIndex}>
                <section>
                    <h1>{t('ledger:chooseAccountIndex')}</h1>
                    <p>{t('ledger:accountIndexExplanation')}</p>
                    <div>
                        <Number
                            value={index}
                            focus
                            label={advancedMode ? t('ledger:accountIndex') : null}
                            onChange={(value) => this.setState({ index: value })}
                        />
                        {advancedMode && (
                            <Number
                                value={page}
                                focus
                                label={t('ledger:accountPage')}
                                onChange={(value) => this.setState({ page: value })}
                            />
                        )}
                    </div>
                    <Toggle
                        checked={advancedMode}
                        onChange={() => this.setState({ advancedMode: !advancedMode, page: 0 })}
                        on={t('modeSelection:advanced')}
                        off={t('modeSelection:standard')}
                    />
                    <small>{advancedMode && t('ledger:accountPageExplanation')}</small>
                </section>
                <footer>
                    <Button disabled={!loading} to="/onboarding/seed-intro" className="square" variant="dark">
                        {t('goBackStep')}
                    </Button>
                    <Button loading={loading} type="submit" className="square" variant="primary">
                        {t('continue')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accounts: state.accounts.accountInfo,
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
});

const mapDispatchToProps = {
    generateAlert,
    setAccountInfoDuringSetup,
};

export default connect(mapStateToProps, mapDispatchToProps)(withTranslation()(Ledger));
