import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { setOnboardingSeed } from 'actions/ui';

import Button from 'ui/components/Button';

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
            <React.Fragment>
                <section>
                    <form className="center">
                        <fieldset>
                            <h2>Do you want to create a new seed?</h2>

                            <Button to="/onboarding/seed-verify" className="large" variant="secondary">
                                {t('no')}
                            </Button>
                            <Button to="/onboarding/seed-warning" className="large" variant="primary">
                                {t('yes')}
                            </Button>
                            <small>
                                <strong>Hint:</strong> Click YES if this is your first time using IOTA.
                            </small>
                        </fieldset>
                    </form>
                </section>
                <footer />
            </React.Fragment>
        );
    }
}

const mapDispatchToProps = {
    setOnboardingSeed,
};

export default connect(null, mapDispatchToProps)(translate()(SeedIntro));
