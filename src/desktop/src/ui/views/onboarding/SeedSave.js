import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate, Trans } from 'react-i18next';
import { connect } from 'react-redux';

import Button from 'ui/components/Button';
import Clipboard from 'ui/components/Clipboard';

import css from './seedSave.css';

/**
 * Onboarding, Seed backup step
 */
class SeedSave extends PureComponent {
    static propTypes = {
        /** Current user defined seed */
        seed: PropTypes.string,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t, seed } = this.props;

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
                        <Clipboard
                            text={seed}
                            timeout={60}
                            title={t('copyToClipboard:seedCopied')}
                            success={t('copyToClipboard:seedCopiedExplanation')}
                        >
                            <Button className="small" variant="secondary">
                                {t('copyToClipboard:copyToClipboard')}
                            </Button>
                        </Clipboard>
                        <Button className="small" onClick={() => window.print()} variant="secondary">
                            {t('paperWallet:printWallet')}
                        </Button>
                    </nav>
                </section>
                <footer>
                    <Button to="/onboarding/seed-generate" className="outline" variant="secondary">
                        {t('back')}
                    </Button>
                    <Button to="/onboarding/seed-verify" className="outline" variant="primary">
                        {t('done')}
                    </Button>
                </footer>
            </React.Fragment>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.seeds.newSeed,
});

export default connect(mapStateToProps)(translate()(SeedSave));
