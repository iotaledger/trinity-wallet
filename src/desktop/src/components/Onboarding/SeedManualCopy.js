import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import BoxedSeed from './BoxedSeed';
import Header from './Header';
import Button from '../UI/Button';
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
            <div>
                <Header headline={t('title')} />
                <Steps currentStep="manual" />
                <main>
                    <div>
                        <BoxedSeed t={t} seed={seed} />
                    </div>
                </main>
                <footer>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button to="/" variant="warning">
                            {t('done')}
                        </Button>
                    </div>
                </footer>
            </div>
        );
    }
}

export default translate('saveYourSeed2')(SeedManualCopy);
