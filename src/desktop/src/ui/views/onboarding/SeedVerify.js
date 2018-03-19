/*global Electron*/
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { isValidSeed } from 'libs/util';

import { generateAlert } from 'actions/alerts';
import { setNewSeed } from 'actions/seeds';

import Button from 'ui/components/Button';
import Infobox from 'ui/components/Info';
import SeedInput from 'ui/components/input/Seed';

/**
 * Onboarding, Seed correct backup validation or existing seed input component
 */
class SeedVerify extends React.PureComponent {
    static propTypes = {
        /** Current generated seed */
        newSeed: PropTypes.string,
        /** Accept current generated seed
         * @param {String} seed - New seed
         */
        setNewSeed: PropTypes.func.isRequired,
        /** Browser History object */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** Create a notification message
         * @param {String} type - notification type - success, error
         * @param {String} title - notification title
         * @param {String} text - notification explanation
         * @ignore
         */
        generateAlert: PropTypes.func.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: '',
    };

    componentDidMount() {
        //Electron.clipboard('');
    }

    onChange = (value) => {
        this.setState(() => ({
            seed: value.replace(/[^a-zA-Z9]*/g, '').toUpperCase(),
        }));
    };

    setSeed = (e) => {
        if (e) {
            e.preventDefault();
        }

        const { history, setNewSeed, generateAlert, newSeed, t } = this.props;
        const { seed } = this.state;

        if (newSeed && seed !== newSeed) {
            generateAlert('error', t('seedReentry:incorrectSeed'), t('seedReentry:incorrectSeedExplanation'));
            return;
        }

        if (!isValidSeed(seed)) {
            generateAlert('error', t('seedReentry:incorrectSeed'), t('enterSeed:seedTooShort'));
            return;
        }

        setNewSeed(seed);
        history.push('/onboarding/account-name');
    };

    render() {
        const { newSeed, t } = this.props;
        const { seed = '' } = this.state;
        return (
            <form onSubmit={(e) => this.setSeed(e)}>
                <section>
                    <SeedInput seed={seed} onChange={this.onChange} label={t('seed')} closeLabel={t('back')} />
                    <Infobox>
                        {newSeed ? (
                            <React.Fragment>
                                <p>
                                    {t('seedReentry:thisIsACheck')}
                                    <br />
                                    {t('seedReentry:ifYouHaveNotSaved')}
                                </p>
                            </React.Fragment>
                        ) : (
                            <React.Fragment>
                                <p>
                                    {t('enterSeed:seedExplanation')}
                                    <br />
                                    {t('enterSeed:neverShare')}
                                </p>
                            </React.Fragment>
                        )}
                    </Infobox>
                </section>
                <footer>
                    <Button
                        to={`/onboarding/seed-${newSeed ? 'save' : 'intro'}`}
                        className="inline"
                        variant="secondary"
                    >
                        {t('back').toLowerCase()}
                    </Button>
                    <Button type="submit" className="large" variant="primary">
                        {t('next').toLowerCase()}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    newSeed: state.seeds.newSeed,
});

const mapDispatchToProps = {
    generateAlert,
    setNewSeed,
};

export default connect(mapStateToProps, mapDispatchToProps)(translate()(SeedVerify));
