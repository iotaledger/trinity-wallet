import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';
import { CopyToClipboard } from 'react-copy-to-clipboard';
import { generateAlert } from 'actions/alerts';

import Button from 'ui/components/Button';

import css from './seedSave.css';

/**
 * Onboarding, Seed backup step
 */
class SeedSave extends PureComponent {
    static propTypes = {
        /** Current user defined seed */
        seed: PropTypes.string,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, seed, generateAlert } = this.props;

        return (
            <React.Fragment>
                <section>
                    <div className={css.seed}>
                        <QRCode size={148} value={seed} />
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
                                className="small"
                                variant="secondary"
                                onClick={() =>
                                    generateAlert(
                                        'success',
                                        t('copyToClipboard:seedCopied'),
                                        t('copyToClipboard:seedCopiedExplanation'),
                                    )
                                }
                            >
                                {t('copyToClipboard:copyToClipboard')}
                            </Button>
                        </CopyToClipboard>
                        <Button className="small" onClick={() => window.print()} variant="secondary">
                            {t('paperWallet:printWallet')}
                        </Button>
                    </nav>
                </section>
                <footer>
                    <Button to="/onboarding/seed-generate" className="outline" variant="secondary">
                        {t('global:back')}
                    </Button>
                    <Button to="/onboarding/seed-verify" className="outline" variant="primary">
                        {t('global:done')}
                    </Button>
                </footer>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.seeds.newSeed,
});

const mapDispatchToProps = {
    generateAlert,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(SeedSave));
