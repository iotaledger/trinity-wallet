/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';

import css from './index.scss';

/**
 * Onboarding, Seed introduction
 */
class SeedIntro extends React.PureComponent {
    static propTypes = {
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

    ledgerCallback(event) {
        this.setState({
            ledger: event === 'add',
        });
    }

    render() {
        const { t } = this.props;
        const { ledger } = this.state;

        return (
            <form>
                <section>
                    <h1>{t('walletSetup:creatingSeed')}</h1>
                    <p>{t('walletSetup:doYouNeedASeed')}</p>
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
                    <a>{ledger ? t('ledger:ready') : t('ledger:notReeady')}</a>
                </section>
                <footer className={!ledger ? css.choiceDefault : css.choiceLedger}>
                    <div>
                        <Button to="/onboarding/seed-verify" className="square" variant="dark">
                            {t('walletSetup:noIHaveOne')}
                        </Button>
                        <Button to="/onboarding/seed-generate" className="square" variant="primary">
                            {t('walletSetup:yesINeedASeed')}
                        </Button>
                    </div>
                    <div>
                        <Button to="/onboarding/seed-ledger" className="square" variant="primary">
                            {t('ledger:proceedWithLedger')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

export default translate()(SeedIntro);
