import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { clearSeeds } from 'actions/seeds';
import { showNotification } from 'actions/notifications';
import { getSelectedSeed } from 'selectors/seeds';

import Button from 'ui/components/Button';

import css from './seedSave.css';

/**
 * Onboarding, Seed backup step
 */
class SeedSave extends PureComponent {
    static propTypes = {
        /** Current user defined seed */
        seed: PropTypes.string,
        /** Notification helper
         * @param {object} content - notification content
         * @ignore
         */
        showNotification: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, seed, showNotification } = this.props;

        return (
            <main>
                <section>
                    <div className={css.seed}>
                        <QRCode size={128} value={seed} />
                        <p>{seed.match(/.{1,3}/g).map((chunk, i) => <span key={i}>{chunk}</span>)}</p>
                    </div>
                    <Trans i18nKey="saveYourSeed:mustSaveYourSeed">
                        <p className={css.hideOnPrint}>
                            You must save your seed with<strong>at least one</strong> of the options listed below.
                        </p>
                    </Trans>
                    <nav className={css.nav}>
                        <CopyToClipboard text={seed}>
                            <Button
                                variant="secondary"
                                onClick={() =>
                                    showNotification({
                                        type: 'success',
                                        title: 'Seed copied to clipboard!',
                                        text:
                                            'Copy your seed to a password manager and do not store the seed in plain text. The seed will stay in your clipboard for 60 seconds',
                                    })
                                }
                            >
                                {t('copyToClipboard:copyToClipboard')}
                            </Button>
                        </CopyToClipboard>
                        <Button onClick={() => window.print()} variant="secondary">
                            {t('paperWallet:printWallet')}
                        </Button>
                    </nav>
                </section>
                <footer>
                    <Button to="/onboarding/seed-generate" className="outline" variant="highlight">
                        {t('global:back')}
                    </Button>
                    <Button to="/onboarding/seed-verify" className="outline" variant="primary">
                        {t('global:done')}
                    </Button>
                </footer>
            </main>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: getSelectedSeed(state).seed,
});

const mapDispatchToProps = {
    clearSeeds,
    showNotification,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(SeedSave));
