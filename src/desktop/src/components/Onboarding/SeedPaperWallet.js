import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import Header from './Header';
import BoxedSeed from './BoxedSeed';
import Button from '../UI/Button';
import Steps from '../UI/Steps';

class SeedPaperWallet extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    render() {
        const { t, seed } = this.props;

        return (
            <div>
                <Header title={t('title')} />
                <Steps />
                <main>
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
                </main>
                <footer>
                    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
                        <Button to="/seed/save" variant="success">
                            {t('button2')}
                        </Button>
                    </div>
                </footer>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

export default translate('saveYourSeed4')(connect(mapStateToProps)(SeedPaperWallet));
