import map from 'lodash/map';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import OnboardingTemplate from './OnboardingTemplate';
import Button from '../UI/Button';
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
                href: '/onboarding/seed/save/manual',
                variant: 'extra',
            },
            {
                title: 'print paper wallet',
                href: '/onboarding/seed/save/paper-wallet',
                variant: 'extra',
            },
            {
                title: 'copy to clipboard',
                href: '/onboarding/seed/save/copy-to-clipboard',
                variant: 'extra',
            },
        ],
    };

    renderOptions(options, t) {
        return map(options, (value, k) => (
            <Button to={value.href} variant={value.variant} key={k}>
                {t(value.title)}
            </Button>
        ));
    }

    render() {
        const { t, savingOptions } = this.props;

        const options = this.renderOptions(savingOptions, t);
        return (
            <OnboardingTemplate
                header={'save your seed'}
                subHeader={<h3>You must save your seed with at least one of the options below</h3>}
                main={<div className={css['options-wrapper']}>{options}</div>}
                footer={
                    <div className={css['options-links']}>
                        <Button to="/" variant="warning">
                            {t('Go Back')}
                        </Button>
                        <Button to="/" variant="success">
                            {t('Next')}
                        </Button>
                    </div>
                }
            />
        );
    }
}

export default translate('welcome1')(SaveYourSeedOptions);
