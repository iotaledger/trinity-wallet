import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withTranslation } from 'react-i18next';
import ReactMarkdown from 'react-markdown';

import { I18N_LOCALE_LABELS, I18N_LOCALES } from 'libs/i18n';
import i18next from 'libs/i18next';

import { acceptTerms, acceptPrivacy, setLocale } from 'actions/settings';

import { enTermsAndConditionsIOS, deTermsAndConditionsIOS, enPrivacyPolicyIOS, dePrivacyPolicyIOS } from 'markdown';

import Button from 'ui/components/Button';
import Select from 'ui/components/input/Select';
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
        setLocale: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    state = {
        step: 'language',
        scrollEnd: false,
    };

    onNextClick = () => {
        const { history, acceptedTerms, acceptedPrivacy, acceptTerms, acceptPrivacy } = this.props;
        const { step } = this.state;

        if (acceptedTerms && acceptedPrivacy) {
            return history.push('/onboarding/seed-intro');
        }

        switch (step) {
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

    changeLanguage = (language) => {
        this.props.setLocale(language);
        i18next.changeLanguage(language);
    };

    render() {
        const { forceUpdate, language, t } = this.props;
        const { step, scrollEnd } = this.state;

        let markdown = '';

        if (language === 'de') {
            markdown = step === 'terms' ? deTermsAndConditionsIOS : dePrivacyPolicyIOS;
        } else {
            markdown = step === 'terms' ? enTermsAndConditionsIOS : enPrivacyPolicyIOS;
        }

        return (
            <form>
                <section className={step !== 'language' ? css.welcome : null}>
                    {step === 'language' ? (
                        <React.Fragment>
                            <h1>{t('welcome:thankYou')}</h1>
                            <Select
                                label={t('languageSetup:language')}
                                value={I18N_LOCALE_LABELS[I18N_LOCALES.indexOf(language)]}
                                onChange={this.changeLanguage}
                                options={I18N_LOCALES.map((item, index) => {
                                    return { value: item, label: I18N_LOCALE_LABELS[index] };
                                })}
                            />
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
                        disabled={forceUpdate || (step !== 'language' && !scrollEnd)}
                        onClick={this.onNextClick}
                        className="square"
                        variant="primary"
                        id="to-seed-intro"
                    >
                        {step === 'language'
                            ? t('continue')
                            : !scrollEnd
                            ? t('terms:readAllToContinue')
                            : t('terms:accept')}
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
});

const mapDispatchToProps = {
    acceptTerms,
    acceptPrivacy,
    setLocale,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(withTranslation()(Welcome));
