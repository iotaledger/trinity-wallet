import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate } from 'react-i18next';
import OnboardingTemplate from './OnboardingTemplate';
import BoxedSeed from './BoxedSeed';
import Button from '../UI/Button';
import Steps from '../UI/Steps';

class SeedPaperWallet extends PureComponent {
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
                header={'save your seed'}
                subHeader={<Steps />}
                main={
                    <div style={{ display: 'flex', minHeight: '200px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <BoxedSeed t={t} seed={seed} />
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'space-around',
                                }}
                            >
                                <span style={{ flex: 1 }}>Logo</span>
                                <span style={{ flex: 3 }}>
                                    Your seed is 81 characters long. Please read from left to right.
                                </span>
                            </div>
                            <QRCode value={seed} />
                        </div>
                    </div>
                }
                footer={
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button to="/" variant="warning">
                            {t('done')}
                        </Button>
                    </div>
                }
            />
        );
    }
}

export default translate('seedManualCopy')(SeedPaperWallet);
