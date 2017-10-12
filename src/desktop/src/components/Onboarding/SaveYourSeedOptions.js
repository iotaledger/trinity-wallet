import map from 'lodash/map';
import toUpper from 'lodash/toUpper';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import OnboardingTemplate from './OnboardingTemplate';
import ButtonLink from '../UI/ButtonLink';
import css from './OnboardingTemplate.css';

class SaveYourSeedOptions extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        savingOptions: PropTypes.array,
    };

    static defaultProps = {
        savingOptions: [
            {
                title: 'manual copy',
                href: '/onboarding/seed/generate/save/manual',
                variant: 'extra',
            },
            {
                title: 'print paper wallet',
                href: '/onboarding/seed/generate/save/paper-wallet',
                variant: 'extra',
            },
            {
                title: 'copy to clipboard',
                href: '/onboarding/seed/generate/save/copy-to-clipboard',
                variant: 'extra',
            },
        ],
    };

    renderOptions(options, t) {
        return map(options, (value, k) => (
            <ButtonLink to={value.href} variant={value.variant} key={k}>
                {t(toUpper(value.title))}
            </ButtonLink>
        ));
    }

    render() {
        const { t, savingOptions } = this.props;

        const options = this.renderOptions(savingOptions, t);
        return (
            <OnboardingTemplate
                header={toUpper('save your seed')}
                subHeader={<h3>You must save your seed with at least one of the options below</h3>}
                main={<div className={css['options-wrapper']}>{options}</div>}
                footer={
                    <div className={css['options-links']}>
                        <ButtonLink to="/" variant="warning">
                            {t(toUpper('Go Back'))}
                        </ButtonLink>
                        <ButtonLink to="/" variant="success">
                            {t(toUpper('Next'))}
                        </ButtonLink>
                    </div>
                }
            />
        );
    }
}

export default translate('welcome1')(SaveYourSeedOptions);
