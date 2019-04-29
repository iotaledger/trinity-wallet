import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withI18n } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import { acceptTerms, acceptPrivacy } from 'actions/settings';

import { getAnimation } from 'animations';

import { enTermsAndConditionsIOS, deTermsAndConditionsIOS, enPrivacyPolicyIOS, dePrivacyPolicyIOS } from 'markdown';

import Button from 'ui/components/Button';
import Language from 'ui/components/input/Language';
import Lottie from 'ui/components/Lottie';
import Scrollbar from 'ui/components/Scrollbar';

import css from './welcome.scss';

/**
 * Onboarding, initial language selection
 */
class Welcome extends React.PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.shape({
            push: PropTypes.func.isRequired,
        }).isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        language: PropTypes.string.isRequired,
        /** @ignore */
        acceptedPrivacy: PropTypes.bool.isRequired,
        /** @ignore */
        acceptedTerms: PropTypes.bool.isRequired,
        /** @ignore */
        forceUpdate: PropTypes.bool.isRequired,
        /** @ignore */
        acceptTerms: PropTypes.func.isRequired,
        /** @ignore */
        acceptPrivacy: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        step: 'intro',
        scrollEnd: false,
    };

    onNextClick = () => {
        const { history, acceptedTerms, acceptedPrivacy, acceptTerms, acceptPrivacy } = this.props;
        const { step } = this.state;

        if (acceptedTerms && acceptedPrivacy && step === 'language') {
            return history.push('/onboarding/seed-intro');
        }

        switch (step) {
            case 'intro':
                this.setState({
                    step: 'language',
                });
                break;
            case 'language':
                this.setState({
                    step: 'terms',
                    scrollEnd: false,
                });
                break;
            case 'terms':
                acceptTerms();
                this.setState({
                    step: 'privacy',
                    scrollEnd: false,
                });
                break;
            default:
                acceptPrivacy();
                history.push('/onboarding/seed-intro');
        }
    };

    render() {
        const { forceUpdate, language, themeName, t } = this.props;
        const { step, scrollEnd } = this.state;

        let markdown = '';

        if (language === 'de') {
            markdown = step === 'terms' ? deTermsAndConditionsIOS : dePrivacyPolicyIOS;
        } else {
            markdown = step === 'terms' ? enTermsAndConditionsIOS : enPrivacyPolicyIOS;
        }

        return (
            <form>
                <section className={css.welcome}>
                    {step === 'intro' ? (
                        <React.Fragment>
                            <h1>{t('welcome:welcome')}</h1>
                            <Lottie
                                width={280}
                                height={280}
                                data={getAnimation('welcome', themeName)}
                                segments={[161, 395]}
                                loop
                            />
                        </React.Fragment>
                    ) : step === 'language' ? (
                        <React.Fragment>
                            <h1>{t('welcome:welcome')}</h1>
                            <Language />
                            <div className={css.language}>
                                <Lottie
                                    width={240}
                                    height={240}
                                    data={getAnimation('language', themeName)}
                                    segments={[52, 431]}
                                    loop
                                />
                            </div>
                        </React.Fragment>
                    ) : (
                        <React.Fragment>
                            <h1>
                                {step === 'terms' ? t('terms:termsAndConditions') : t('privacyPolicy:privacyPolicy')}
                            </h1>
                            <article>
                                <Scrollbar contentId={step} onScrollEnd={() => this.setState({ scrollEnd: true })}>
                                    <ReactMarkdown source={markdown} />
                                </Scrollbar>
                            </article>
                        </React.Fragment>
                    )}
                </section>
                <footer>
                    <Button
                        disabled={forceUpdate || (step !== 'language' && step !== 'intro' && !scrollEnd)}
                        onClick={this.onNextClick}
                        className="square"
                        variant="primary"
                    >
                        {step === 'intro'
                            ? t('languageSetup:letsGetStarted')
                            : step === 'language'
                                ? t('continue')
                                : !scrollEnd ? t('terms:readAllToContinue') : t('terms:accept')}
                    </Button>
                </footer>
            </form>
        );
    }
}

const mapStateToProps = (state) => ({
    acceptedPrivacy: state.settings.acceptedPrivacy,
    acceptedTerms: state.settings.acceptedTerms,
    language: state.settings.locale,
    forceUpdate: state.wallet.forceUpdate,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    acceptTerms,
    acceptPrivacy,
};

export default connect(mapStateToProps, mapDispatchToProps)(withI18n()(Welcome));
