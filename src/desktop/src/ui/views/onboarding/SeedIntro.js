/* global Electron */
import React from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { withTranslation, Trans } from 'react-i18next';

import { getAnimation } from 'animations';

import { setAccountInfoDuringSetup } from 'actions/accounts';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';
import Lottie from 'ui/components/Lottie';

import css from './index.scss';

/**
 * Onboarding, Seed introduction
 */
class SeedIntro extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        themeName: PropTypes.string.isRequired,
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

    stepForward(route, existingSeed) {
        this.props.setAccountInfoDuringSetup({
            meta: { type: 'keychain' },
            usedExistingSeed: existingSeed,
        });

        this.props.history.push(`/onboarding/${route}`);
    }

    render() {
        const { t, themeName, setAccountInfoDuringSetup } = this.props;
        const { ledger } = this.state;

        return (
            <form>
                <section className={css.long}>
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
                    <div className={css.usb}>
                        <Lottie width={240} height={200} data={getAnimation('ledger', themeName)} paused={!ledger} />
                    </div>
                    <p>{ledger ? t('ledger:ready') : t('ledger:notReady')}</p>
                </section>
                <footer className={!ledger ? css.choiceDefault : css.choiceLedger}>
                    <div>
                        <Button
                            id="to-seed-verify"
                            onClick={() => this.stepForward('seed-verify', true)}
                            className="square"
                            variant="dark"
                        >
                            {t('walletSetup:noIHaveOne')}
                        </Button>
                        <Button
                            id="to-seed-generate"
                            onClick={() => this.stepForward('seed-generate', false)}
                            className="square"
                            variant="primary"
                        >
                            {t('walletSetup:yesINeedASeed')}
                        </Button>
                    </div>
                    <div>
                        <Button
                            to="/onboarding/seed-ledger"
                            onClick={() => setAccountInfoDuringSetup({ usedExistingSeed: true })}
                            className="square"
                            variant="dark"
                        >
                            {t('ledger:restoreLedgerAccount')}
                        </Button>
                        <Button
                            id="to-seed-ledger"
                            to="/onboarding/seed-ledger"
                            onClick={() => setAccountInfoDuringSetup({ usedExistingSeed: false })}
                            className="square"
                            variant="primary"
                        >
                            {t('ledger:createNewLedgerAccount')}
                        </Button>
                    </div>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    setAccountInfoDuringSetup,
};

export default connect(
    null,
    mapDispatchToProps,
)(withTranslation()(SeedIntro));
