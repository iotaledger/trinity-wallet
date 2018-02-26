import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { isValidSeed } from 'libs/util';
import { showError } from 'actions/notifications';
import { addAndSelectSeed, clearSeeds } from 'actions/seeds';
import { getSelectedSeed } from 'selectors/seeds';
import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';
import SeedInput from 'ui/components/input/Seed';

/**
 * Onboarding, Seed correct backup validation or existing seed input component
 */
class SeedEnter extends React.PureComponent {
    static propTypes = {
        /** Add and select seed to state */
        addAndSelectSeed: PropTypes.func.isRequired,
        /** Clear state seed data */
        clearSeeds: PropTypes.func.isRequired,
        /** Browser History object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Current generated seed */
        selectedSeed: PropTypes.shape({
            seed: PropTypes.string,
        }).isRequired,
        /** Error modal helper
         * @param {Object} content - error screen content
         * @ignore
         */
        showError: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: '',
    };

    onChange = (value) => {
        this.setState(() => ({
            seed: value.replace(/[^a-zA-Z9]*/g, '').toUpperCase(),
        }));
    };

    setSeed = (e) => {
        e.preventDefault();
        const { addAndSelectSeed, clearSeeds, history, showError, selectedSeed, t } = this.props;
        const { seed } = this.state;

        if (selectedSeed.seed && seed !== selectedSeed.seed) {
            showError({ title: t('seedReentry:incorrectSeed'), text: t('seedReentry:incorrectSeedExplanation') });
            return;
        }

        if (!isValidSeed(seed)) {
            showError({
                title: t('seedReentry:incorrectSeed'),
                text: t('enterSeed:seedTooShort'),
            });
            return;
        }

        clearSeeds();
        addAndSelectSeed(seed);
        history.push('/onboarding/account-name');
    };

    render() {
        const { selectedSeed, t } = this.props;
        const { seed = '' } = this.state;
        return (
            <form onSubmit={this.setSeed}>
                <div />
                <section>
                    <SeedInput
                        seed={seed}
                        onChange={this.onChange}
                        label={t('global:seed')}
                        closeLabel={t('global:back')}
                    />
                    <Infobox>
                        <p>{t('seedReentry:thisIsACheck')}</p>
                        <p>{t('seedReentry:ifYouHaveNotSaved')}</p>
                    </Infobox>
                </section>
                <footer>
                    <Button
                        to={`/onboarding/seed-${selectedSeed.seed ? 'save' : 'intro'}`}
                        className="outline"
                        variant="highlight"
                    >
                        {t('global:back')}
                    </Button>
                    <Button type="submit" className="outline" variant="primary">
                        {t('global:next')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    selectedSeed: getSelectedSeed(state),
});

const mapDispatchToProps = {
    showError,
    addAndSelectSeed,
    clearSeeds,
};

export default translate()(connect(mapStateToProps, mapDispatchToProps)(SeedEnter));
