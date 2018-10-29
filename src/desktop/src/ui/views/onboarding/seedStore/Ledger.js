import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import SeedStore from 'libs/SeedStore';

import { generateAlert } from 'actions/alerts';
import { setAdditionalAccountInfo } from 'actions/wallet';

import Button from 'ui/components/Button';
import Number from 'ui/components/input/Number';
import Toggle from 'ui/components/Toggle';

import css from './index.scss';

/**
 * Onboarding, set Ledger accoutn index
 */
class Ledger extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        wallet: PropTypes.object.isRequired,
        /** @ignore */
        accounts: PropTypes.object.isRequired,
        /** @ignore */
        setAdditionalAccountInfo: PropTypes.func.isRequired,
        /** @ignore */
        history: PropTypes.object.isRequired,
        /** @ignore */
        generateAlert: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        index: this.props.wallet.additionalAccountMeta.index || this.getDefaultIndex(),
        page: this.props.wallet.additionalAccountMeta.page || 0,
        loading: false,
        advancedMode: false,
    };

    getIndexes() {
        const { accounts } = this.props;

        const indexes = Object.keys(accounts).map(
            (account) =>
                accounts[account].meta && accounts[account].meta.type === 'ledger' ? accounts[account].meta.index : -1,
        );
        return indexes;
    }

    getDefaultIndex() {
        const indexes = this.getIndexes();

        for (let i = 0; i <= indexes.length; i++) {
            if (indexes.indexOf(i) < 0) {
                return i;
            }
        }
    }

    getIndexAccountName(index) {
        const indexes = this.getIndexes();
        return Object.keys(this.props.accounts)[indexes.indexOf(index)];
    }

    /**
     * Check for unused ledger index and set it to state
     * @param {Event} event - Form submit event
     * @returns {undefined}
     */
    setIndex = async (event) => {
        const { index, page } = this.state;
        const { generateAlert, history, t } = this.props;

        event.preventDefault();

        const indexInUse = this.getIndexAccountName(index);

        if (indexInUse) {
            return generateAlert(
                'error',
                t('ledger:indexInUse', { account: indexInUse }),
                t('ledger:indexInUseExplanation', { account: indexInUse }),
            );
        }

        this.setState({
            loading: true,
        });

        try {
            const vault = await new SeedStore.ledger(null, null, { index });
            const indexAddress = await vault.generateAddress({
                index: 0,
                security: 1,
            });

            this.props.setAdditionalAccountInfo({
                additionalAccountMeta: { type: 'ledger', index, page, indexAddress },
            });

            history.push('/onboarding/account-name');
        } catch (err) {
            // Do nothing if user cancels modal
        }

        this.setState({
            loading: false,
        });
    };

    render() {
        const { t } = this.props;
        const { page, index, loading, advancedMode } = this.state;

        const usedIndex = this.getIndexAccountName(index);

        return (
            <form className={css.ledger} onSubmit={this.setIndex}>
                <section className={usedIndex ? css.usedIndex : null}>
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
                    <strong>{usedIndex ? t('ledger:indexInUse', { account: usedIndex }) : ' '}</strong>
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
    wallet: state.wallet,
    accounts: state.accounts.accountInfo,
});

const mapDispatchToProps = {
    generateAlert,
    setAdditionalAccountInfo,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Ledger));
