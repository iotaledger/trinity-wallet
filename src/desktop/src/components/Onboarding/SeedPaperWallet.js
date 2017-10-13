import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate } from 'react-i18next';
import Header from './Header';
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
            <div>
                <Header headline={t('title')} />
                <Steps currentStep="clipboard" />
                <main style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-around' }}>
                    <div style={{ display: 'flex', minHeight: '200px', background: 'white', padding: '12px' }}>
                        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                            <BoxedSeed t={t} seed={seed} color="black" size="small" />
                            <div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    color: 'black',
                                    paddingLeft: '8px',
                                    paddingRight: '8px',
                                }}
                            >
                                <span>Your seed is 81 characters long. Please read from left to right.</span>
                            </div>
                            <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                                <QRCode value={seed} />
                            </div>
                        </div>
                    </div>
                    <Button to="/" variant="success">
                        {t('button1')}
                    </Button>
                </main>
                <footer>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button to="/" variant="success">
                            {t('button2')}
                        </Button>
                    </div>
                </footer>
            </div>
        );
    }
}

export default translate('saveYourSeed4')(SeedPaperWallet);
