import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import { MAX_SEED_LENGTH } from 'libs/util';
import Template, { Main, Footer } from './Template';
import BoxedSeed from '../UI/BoxedSeed';
import Button from '../UI/Button';
import Steps from '../UI/Steps';
import css from './SeedPaperWallet.css';

class SeedPaperWallet extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    print = e => {
        window.print();
    };

    render() {
        const { t, seed } = this.props;

        return (
            <div>
                <p>{t('paperWallet:clickToPrint')}</p>
                <div className={css.wrapper}>
                    <div className={css.innerWrapper}>
                        <BoxedSeed t={t} seed={seed} color="black" size="small" />
                        <div className={css.midWrapper}>
                            <span>{t('writeSeedDown:yourSeedIs')}</span>
                        </div>
                        <div className={css.qrCodeWrapper}>
                            <QRCode value={seed} />
                        </div>
                    </div>
                </div>
                <div className={css.printBtnWrapper}>
                    <Button onClick={this.print} variant="secondary">
                        {t('paperWallet:printWallet')}
                    </Button>
                </div>
            </div>
        );
    }
}

const mapStateToProps = state => ({
    seed: getSelectedSeed(state).seed,
});

export default translate('saveYourSeed4')(connect(mapStateToProps)(SeedPaperWallet));
