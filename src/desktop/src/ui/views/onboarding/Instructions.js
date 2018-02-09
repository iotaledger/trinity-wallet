import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Button from 'ui/components/Button';

/**
 * Onboarding welcome content
 */
class Instructions extends React.PureComponent {
    static propTypes = {
        /* Translation helper
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
                    <h2>{t('welcome:thankYou')}</h2>
                    <p>{t('welcome:weWillSpend')}</p>
                    <p>
                        <strong>{t('welcome:reminder')}</strong>
                    </p>
                </section>
                <footer>
                    <Button to="/" className="outline" variant="highlight">
                        {t('global:back')}
                    </Button>
                    <Button to="/onboarding/seed-intro" className="outline" variant="primary">
                        {t('global:next')}
                    </Button>
                </footer>
            </main>
        );
    }
}

export default translate()(Instructions);
