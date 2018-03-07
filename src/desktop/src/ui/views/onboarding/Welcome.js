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
                    <Language />
                </section>
                <footer>
                    <Button to="/onboarding/seed-intro" className="outline" variant="positive">
                        {t('global:next')}
                    </Button>
                </footer>
            </React.Fragment>
        );
    }
}

export default translate()(Welcome);
