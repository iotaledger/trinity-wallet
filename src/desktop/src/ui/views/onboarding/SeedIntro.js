import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';

import { clearNewSeed } from 'actions/seeds';

import Button from 'ui/components/Button';

/**
 * Onboarding, Seed introduction
 */
class SeedIntro extends React.PureComponent {
    static propTypes = {
        /** Clears new seed data from state */
        clearNewSeed: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        this.props.clearNewSeed();
    }

    render() {
        const { t } = this.props;
        return (
            <React.Fragment>
                <section>
                    <form className="center">
                        <fieldset>
                            <h2>{t('walletSetup:doYouAlreadyHaveASeed')}</h2>
                            <Button to="/onboarding/seed-verify" className="large" variant="secondary">
                                {t('yes')}
                            </Button>
                            <Button to="/onboarding/seed-warning" className="large" variant="primary">
                                {t('no')}
                            </Button>
                        </fieldset>
                    </form>
                </section>
                <footer />
            </React.Fragment>
        );
    }
}

const mapDispatchToProps = {
    clearNewSeed,
};

export default connect(null, mapDispatchToProps)(translate()(SeedIntro));
