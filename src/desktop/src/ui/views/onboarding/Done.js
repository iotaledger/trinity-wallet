import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { setOnboardingComplete } from 'actions/accounts';

import Button from 'ui/components/Button';
import Logo from 'ui/components/Logo';

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
            <React.Fragment>
                <section>
                    <h2>{t('onboardingComplete:walletReady')}</h2>
                </section>
                <footer>
                    <Button onClick={this.setComplete} className="large" variant="primary">
                        {t('done').toLowerCase()}
                    </Button>
                </footer>
            </React.Fragment>
        );
    }
}

const mapDispatchToProps = {
    setOnboardingComplete,
};

export default connect(null, mapDispatchToProps)(translate()(Done));
