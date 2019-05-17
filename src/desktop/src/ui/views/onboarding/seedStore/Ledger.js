import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import SeedStore from 'libs/SeedStore';

import { generateAlert } from 'actions/alerts';
import { setAccountInfoDuringSetup } from 'actions/accounts';

import Button from 'ui/components/Button';
import Number from 'ui/components/input/Number';
import Toggle from 'ui/components/Toggle';
import Modal from 'ui/components/modal/Modal';

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
        /** @ignore */
        restoringLedgerAccount: PropTypes.bool.isRequired,
    };

    state = {
        index: this.props.additionalAccountMeta.index || 0,
        page: this.props.additionalAccountMeta.page || 0,
        loading: false,
        advancedMode: false,
        udevError: false,
        countdown: 5,
        displayedIndexInfo: false
    };

    componentDidMount() {
        const { t, generateAlert } = this.props;
        generateAlert(
            'info',
            t('ledger:checkLedger'),
            t('ledger:acceptWarningExplanation'),
            10000
        );
        this.interval = setInterval(() => {
            const { countdown } = this.state;
            this.setState({
                countdown: countdown - 1,
            });
        }, 1000);
    }

    componentDidUpdate(_, prevState) {
        if (prevState.index !== this.state.index && !this.state.displayedIndexInfo && !this.props.restoringLedgerAccount) {
              const { t, generateAlert } = this.props;
              generateAlert('error', t('ledger:writtenDownInfoTitle'), t('ledger:writtenDownInfoExplanation'), 10000);
        }
    }

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

            // Handle udev errors
            // See https://github.com/LedgerHQ/ledger-live-desktop/issues/1057 and https://github.com/iotaledger/trinity-wallet/issues/589
            if (error.message.includes('cannot open device with path')) {
                this.setState({
                    udevError: true,
                });
            }

            this.setState({
                loading: false,
            });
        }
    };

    showUdevModal = (udevError) => {
        if (udevError) {
            const { t } = this.props;

            return (
                <Modal variant="fullscreen" isOpen isForced onClose={() => {}}>
                    <h1>{t('ledger:udevError')}</h1>
                    <p>{t('ledger:udevErrorExplanation')}</p>
                    <p>
                        <a href="https://support.ledger.com/hc/articles/115005165269">
                            https://support.ledger.com/hc/articles/115005165269
                        </a>
                    </p>
                    <footer>
                        <Button to="/onboarding/seed-intro" className="square"variant="dark">
                            {t('goBackStep')}
                        </Button>
                    </footer>
                </Modal>
            );
        }
        return null;
    };

    render() {
        const { t, restoringLedgerAccount } = this.props;
        const { page, index, loading, advancedMode, udevError, countdown } = this.state;

        return (
            <form className={css.ledger} onSubmit={this.setIndex}>
                {this.showUdevModal(udevError)}
                <section>
                    <h1>{t('ledger:chooseAccountIndex')}</h1>
                    <p>{t('ledger:accountIndexExplanation')}</p>
                    <p>{restoringLedgerAccount ? t('ledger:restoreLedgerAccountInfo') : t('ledger:createNewLedgerAccountInfo')}</p>
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
                        on={t('global:expert')}
                        off={t('modeSelection:standard')}
                    />
                    <small>{advancedMode && t('ledger:accountPageExplanation')}</small>
                </section>
                <footer>
                    <Button disabled={loading} to="/onboarding/seed-intro" className="square" variant="dark">
                        {t('goBackStep')}
                    </Button>
                    <Button loading={loading} type="submit" className="square" variant="primary" disabled={countdown > 0}>
                        {countdown && countdown > 0 ? countdown : t('continue')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    accounts: state.accounts.accountInfo,
    additionalAccountMeta: state.accounts.accountInfoDuringSetup.meta,
    restoringLedgerAccount: state.accounts.accountInfoDuringSetup.usedExistingSeed,
});

const mapDispatchToProps = {
    generateAlert,
    setAccountInfoDuringSetup,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(Ledger));
