import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Button from 'ui/components/Button';

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
            <React.Fragment>
                <section>
                    <form className="center">
                        <fieldset>
                            <p>{t('walletSetup:doYouAlreadyHaveASeed')}</p>
                            <Button to="/onboarding/seed-generate" className="outline" variant="primary">
                                {t('global:no')}
                            </Button>
                            <Button to="/onboarding/seed-verify" className="outline" variant="positive">
                                {t('global:yes')}
                            </Button>
                        </fieldset>
                    </form>
                </section>
                <footer />
            </React.Fragment>
        );
    }
}

export default translate()(SeedIntro);
