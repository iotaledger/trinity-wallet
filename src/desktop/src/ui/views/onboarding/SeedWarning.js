import React from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';

/**
 * Onboarding, Seed warnging
 */
class SeedWarning extends React.PureComponent {
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
                </section>
                <footer>
                    <Button to="/onboarding/seed-intro" className="inline" variant="secondary">
                        Back
                    </Button>
                    <Button to="/onboarding/seed-generate" className="large" variant="primary">
                        Generate seed
                    </Button>
                </footer>
            </React.Fragment>
        );
    }
}

export default translate()(SeedWarning);
