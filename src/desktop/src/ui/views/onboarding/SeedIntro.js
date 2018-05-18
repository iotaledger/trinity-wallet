import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate, Trans } from 'react-i18next';

import { setOnboardingSeed } from 'actions/ui';

import Button from 'ui/components/Button';
import Info from 'ui/components/Info';

/**
 * Onboarding, Seed introduction
 */
class SeedIntro extends React.PureComponent {
    static propTypes = {
        /** Set onboarding seed state
         * @param {String} seed - New seed
         * @param {Boolean} isGenerated - Is the new seed generated
         */
        setOnboardingSeed: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.setOnboardingSeed(null);
    }

    render() {
        const { t } = this.props;
        return (
            <form>
                <section>
                    <h1>{t('walletSetup:creatingSeed')}</h1>
                    <p>{t('walletSetup:doYouAlreadyHaveASeed')}</p>
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
                    <Button to="/onboarding/seed-verify" className="square" variant="dark">
                        {t('walletSetup:noIHaveOne')}
                    </Button>
                    <Button to="/onboarding/seed-generate" className="square" variant="primary">
                        {t('walletSetup:yesINeedASeed')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapDispatchToProps = {
    setOnboardingSeed,
};

export default connect(null, mapDispatchToProps)(translate()(SeedIntro));
