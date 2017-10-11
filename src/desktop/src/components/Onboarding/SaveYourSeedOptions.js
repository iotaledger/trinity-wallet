import React from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import OnboardingTemplate from './OnboardingTemplate';
import ButtonLink from '../UI/ButtonLink';

class SaveYourSeedOptions extends React.PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        match: PropTypes.object.isRequired,
        savingOptions: PropTypes.array,
        history: PropTypes.object.isRequired,
    };

    static defaultProps = {
        savingOptions: [
            {
                title: 'manual_copy',
                href: '/onboarding/seed/generate/save/manual',
                variant: 'info',
            },
            {
                title: 'print_paper_wallet',
                href: '/onboarding/seed/generate/save/print-paper-wallet',
                variant: 'info',
            },
            {
                title: 'copy_to_clipboard',
                href: '/onboarding/seed/generate/save/print-paper-wallet',
                variant: 'info',
            },
        ],
    };

    static getDefaultStyles() {
        return {
            wrapper: {
                flex: 2,
                display: 'flex',
                flexDirection: 'column',
                alignSelf: 'center',
                justifyContent: 'space-around',
            },
        };
    }

    render() {
        const styles = SaveYourSeedOptions.getDefaultStyles();
        const { t } = this.props;

        return (
            <OnboardingTemplate
                header="save your seed"
                subHeader={<h3>You must save your seed with at least one of the options below</h3>}
                main={
                    <div style={styles.wrapper}>
                        <ButtonLink to="/" variant="extra">
                            {t('Manual Copy')}
                        </ButtonLink>
                        <ButtonLink to="/" variant="extra">
                            {t('Print Paper Wallet')}
                        </ButtonLink>
                        <ButtonLink to="/" variant="extra">
                            {t('Copy to clipboard')}
                        </ButtonLink>
                    </div>
                }
                footer={
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <ButtonLink to="/" variant="warning">
                            {t('Go Back')}
                        </ButtonLink>
                        <ButtonLink to="/" variant="success">
                            {t('Next')}
                        </ButtonLink>
                    </div>
                }
            />
        );
    }
}

export default translate('welcome1')(SaveYourSeedOptions);
