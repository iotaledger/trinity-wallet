import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';

import Button from 'ui/components/Button';
import Language from 'ui/components/input/Language';

/**
 * Onboarding, initial language selection
 */
class Welcome extends React.PureComponent {
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
                    <h1>{t('welcome:thankYou')}</h1>
                    <form>
                        <Language />
                        <Button to="/onboarding/seed-intro" className="large" variant="primary">
                            {t('continue')}
                        </Button>
                    </form>
                </section>
                <footer />
            </React.Fragment>
        );
    }
}

export default translate()(Welcome);
