/* global Electron */
import React from 'react';
import classNames from 'classnames';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withI18n, Trans } from 'react-i18next';

import { setAccountInfoDuringSetup } from 'actions/accounts';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';

import css from './index.scss';

/**
 * Onboarding, Seed introduction
 */
class SeedIntro extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        setAccountInfoDuringSetup: PropTypes.func.isRequired,
        /** @ignore */
        history: PropTypes.object,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        ledger: false,
    };

    componentDidMount() {
        Electron.setOnboardingSeed(null);

        this.ledgerListener = this.ledgerCallback.bind(this);
        Electron.ledger.addListener(this.ledgerListener);
    }

    componentWillUnmount() {
        Electron.ledger.removeListener(this.ledgerListener);
    }

    ledgerCallback(isConnected) {
        this.setState({
            ledger: isConnected,
        });
    }

    stepForward(route) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
        });

        this.props.history.push(`/onboarding/${route}`);
    }

    render() {
        const { t, setAccountInfoDuringSetup } = this.props;
        const { ledger } = this.state;

        return (
            <form>
                <section>
                    <h1>{t('walletSetup:doYouNeedASeed')}</h1>
                    <Info>
                        <p>{t('walletSetup:seedExplanation')}</p>
                        <Trans i18nKey="walletSetup:explanation">
                            <p>
                                <span>You can use it to access your funds from</span>
                                <strong> any wallet</strong>
                                <span>, on</span>
                                <strong> any device</strong>
                                <span>. But if you lose your seed, you also lose your IOTA.</span>
                            </p>
                        </Trans>
                    </Info>
                    <p className={classNames(css.usb, ledger ? css.on : null)}>
                        <svg width="34" height="32" viewBox="0 0 34 32" xmlns="http://www.w3.org/2000/svg">
                            <path d="M6.75 24c0 8 12.5 8 12.5 0 0-.414.336-.75.75-.75s.75.336.75.75c0 10-15.5 10-15.5 0v-9.333h1.5v.333c0 .414-.336.75-.75.75s-.75-.336-.75-.75v-.333h1.5v9.333zm14-18c0 .414-.336.75-.75.75s-.75-.336-.75-.75c0-3.635 2.534-6 5.75-6s5.75 2.365 5.75 6v14.5h-1.5v-14.5c0-2.782-1.841-4.5-4.25-4.5s-4.25 1.718-4.25 4.5z" />
                            <circle cx="20" cy="15" r="6" />
                            <path d="M17.5 15.5l2 2 3-4" />
                            <path d="M27.5 32v-3h5v3z" />
                            <path d="M30 19c2 0 4 1 4 4v4h-8v-4c0-3 2-4 4-4z" />
                            <path d="M12 17c-.021 3.328-2.672 5.979-6 6-3.331-.014-5.986-2.669-6-6v-4h12v4z" />
                            <path d="M10.5 6v5h-9v-5z" />
                            <path d="M16.5 14h7v2h-7z" />
                        </svg>
                        <span>{ledger ? t('ledger:ready') : t('ledger:notReady')}</span>
                    </p>
                </section>
                <footer className={!ledger ? css.choiceDefault : css.choiceLedger}>
                    <div>
                        <Button onClick={() => this.stepForward('seed-verify')} className="square" variant="dark">
                            {t('walletSetup:noIHaveOne')}
                        </Button>
                        <Button onClick={() => this.stepForward('seed-generate')} className="square" variant="primary">
                            {t('walletSetup:yesINeedASeed')}
                        </Button>
                    </div>
                    <div>
                        <Button to="/onboarding/seed-ledger" onClick={() => setAccountInfoDuringSetup({usedExistingSeed: true})} className="square" variant="dark">
                            {t('ledger:restoreLedgerAccount')}
                        </Button>
                        <Button to="/onboarding/seed-ledger" onClick={() => setAccountInfoDuringSetup({usedExistingSeed: false})} className="square" variant="primary">
                            {t('ledger:createNewLedgerAccount')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(null, mapDispatchToProps)(withI18n()(SeedIntro));
