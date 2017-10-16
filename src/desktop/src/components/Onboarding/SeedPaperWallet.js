import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import Header from './Header';
import BoxedSeed from '../UI/BoxedSeed';
import Button from '../UI/Button';
import Steps from '../UI/Steps';
import css from './SeedPaperWallet.css';

class SeedPaperWallet extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    render() {
        const { t, seed } = this.props;

        return (
            <div>
                <Header headline={t('title')} />
                <Steps currentStep="paper" />
                <main>
                    <p>Click the button below to print a paper copy of your seed. Store it safely.</p>
                    <div className={css.wrapper}>
                        <div className={css.innerWrapper}>
                            <BoxedSeed t={t} seed={seed} color="black" size="small" />
                            <div className={css.midWrapper}>
                                <span>Your seed is 81 characters long. Please read from left to right.</span>
                            </div>
                            <div className={css.qrCodeWrapper}>
                                <QRCode value={seed} />
                            </div>
                        </div>
                    </div>
                    <div className={css.printBtnWrapper}>
                        <Button to="/" variant="success">
                            {t('button1')}
                        </Button>
                    </div>
                </main>
                <footer>
                    <Button to="/seed/save" variant="success">
                        {t('button2')}
                    </Button>
                </footer>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

export default translate('saveYourSeed4')(connect(mapStateToProps)(SeedPaperWallet));
