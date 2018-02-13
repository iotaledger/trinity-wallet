import React from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';
import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';

/**
 * Onboarding, Seed introduction
 */
class SeedIntro extends React.PureComponent {
    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    render() {
        const { t } = this.props;
        return (
            <main>
                <section>
                    <h2>{t('walletSetup:okay')}</h2>
                    <p>{t('walletSetup:doYouAlreadyHaveASeed')}</p>
                    <Infobox>
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
                        <p>
                            <strong>{t('walletSetup:keepSafe')}</strong>
                        </p>
                    </Infobox>
                </section>
                <footer>
                    <Button to="/onboarding/seed-generate" className="outline" variant="highlight">
                        {t('global:no')}
                    </Button>
                    <Button to="/onboarding/seed-verify" className="outline" variant="primary">
                        {t('global:yes')}
                    </Button>
                </footer>
            </main>
        );
    }
}

export default translate()(SeedIntro);
