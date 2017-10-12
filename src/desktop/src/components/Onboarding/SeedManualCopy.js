import toUpper from 'lodash/toUpper';
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import OnboardingTemplate from './OnboardingTemplate';
import BoxedSeed from './BoxedSeed';
import ButtonLink from '../UI/ButtonLink';
import Steps from '../UI/Steps';

class SeedManualCopy extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    static defaultProps = {
        seed: 'BSWMMBSBPVWAXYYVTYAAHDONCCZIXGJCMQOXTRGKK9PIVVRCMXYJWKUBWHOP9VUIZNFTIKHOIYKTIODGD',
    };

    render() {
        const { t, seed } = this.props;

        return (
            <OnboardingTemplate
                header={toUpper('save your seed')}
                subHeader={<Steps />}
                main={
                    <div>
                        <BoxedSeed t={t} seed={seed} />
                    </div>
                }
                footer={
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <ButtonLink to="/" variant="warning">
                            {t(toUpper('done'))}
                        </ButtonLink>
                    </div>
                }
            />
        );
    }
}

export default translate('seedManualCopy')(SeedManualCopy);
