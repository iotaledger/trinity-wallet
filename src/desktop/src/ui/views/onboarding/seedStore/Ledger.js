/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import SeedStore from 'libs/SeedStore';

import { generateAlert } from 'actions/alerts';
import { setAdditionalAccountInfo } from 'actions/wallet';

import Button from 'ui/components/Button';
import Input from 'ui/components/input/Text';

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
        index: this.props.wallet.additionalAccountMeta.index
            ? this.props.wallet.additionalAccountName
            : this.getIndex(),
    };

    getIndex() {
        const ledgerAccounts = this.props.accounts.filter((account) => account.meta && account.meta.type === 'ledger');
        const indexes = ledgerAccounts.map((account) => account.meta.index);

        if (!indexes.length) {
            return 0;
        }

        for (let i = 0; i <= indexes.length; i++) {
            if (indexes.indexOf(i) < 0) {
                return i;
            }
        }
    }

    /**
     * Check for unused ledger index and set it to state
     * @param {Event} event - Form submit event
     * @returns {undefined}
     */
    setIndex = async (event) => {
        event.preventDefault();
    };

    render() {
        const { t } = this.props;
        const { index } = this.state;
        return (
            <form onSubmit={this.setIndex}>
                <section>
                    <h1>{t('ledger:chooseAccountIndex')}</h1>
                    <p>{t('ledger:accountIndexExplanation')}</p>
                    <Input
                        value={index}
                        focus
                        label={t('ledger:accountIndex')}
                        onChange={(value) => this.setState({ index: value })}
                    />
                </section>
                <footer>
                    <Button to="/onboarding/seed-intro" className="square" variant="dark">
                        {t('goBackStep')}
                    </Button>
                    <Button type="submit" className="square" variant="primary">
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
