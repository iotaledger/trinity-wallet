import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { setOnboardingComplete } from 'actions/accounts';

import Button from 'ui/components/Button';

/**
 * Onboarding complete component
 */
class Done extends React.PureComponent {
    static propTypes = {
        /** Browser history object */
        history: PropTypes.object.isRequired,
        /** Set onboarding status to complete */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    setComplete = () => {
        const { history, setOnboardingComplete } = this.props;
        setOnboardingComplete(true);
        history.push('/onboarding/');
    };

    render() {
        const { t } = this.props;
        return (
            <form>
                <section>
                    <h1>{t('onboardingComplete:allDone')}</h1>
                    <p>{t('onboardingComplete:walletReady')}</p>
                </section>
                <footer>
                    <Button onClick={this.setComplete} className="square" variant="primary">
                        {t('onboardingComplete:openYourWallet')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapDispatchToProps = {
    setOnboardingComplete,
};

export default connect(null, mapDispatchToProps)(translate()(Done));
