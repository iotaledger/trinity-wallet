/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import SeedStore from 'libs/SeedStore';

import { generateAlert } from 'actions/alerts';
import { setAdditionalAccountInfo } from 'actions/wallet';

import Button from 'ui/components/Button';
import Number from 'ui/components/input/Number';

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
		t: PropTypes.func.isRequired
	};

	state = {
		index: this.props.wallet.additionalAccountMeta.index
			? this.props.wallet.additionalAccountName
			: this.getDefaultIndex(),
		loading: false
	};

	getIndexes() {
		const { accounts } = this.props;

		const indexes = Object.keys(accounts).map(
			(account) =>
				accounts[account].meta && accounts[account].meta.type === 'ledger' ? accounts[account].index : -1
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

	/**
     * Check for unused ledger index and set it to state
     * @param {Event} event - Form submit event
     * @returns {undefined}
     */
	setIndex = async (event) => {
		const { index } = this.state;
		const { generateAlert, history, t } = this.props;

		event.preventDefault();

		this.setState({
			loading: true
		});

		try {
			const vault = await new SeedStore.ledger(null, null, { index });
			await vault.getSeed();

			this.props.setAdditionalAccountInfo({
				additionalAccountMeta: { type: 'ledger', index }
         });
         
         history.push('/onboarding/account-name');

		} catch (err) {
         console.log(err);
			generateAlert('error', t('ledger:connectionError'), t('ledger:connectionErrorExplanation'));
		}

		this.setState({
			loading: false
		});
	};

	render() {
		const { t } = this.props;
		const { index, loading } = this.state;

		return (
			<form onSubmit={this.setIndex}>
				<section>
					<h1>{t('ledger:chooseAccountIndex')}</h1>
					<p>{t('ledger:accountIndexExplanation')}</p>
					<Number
						value={index}
						focus
						label={t('ledger:accountIndex')}
						onChange={(value) => this.setState({ index: value })}
					/>
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
	accounts: state.accounts.accountInfo
});

const mapDispatchToProps = {
	generateAlert,
	setAdditionalAccountInfo
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Ledger));
