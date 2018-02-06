import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qrcode.react';
import { translate } from 'react-i18next';
import { connect } from 'react-redux';
import { getSelectedSeed } from 'selectors/seeds';
import BoxedSeed from 'components/UI/BoxedSeed';
import Button from 'ui/components/Button';
import css from 'components/Onboarding/SeedPaperWallet.css';

class SeedPaperWallet extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        seed: PropTypes.string,
    };

    print = () => {
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

const mapStateToProps = (state) => ({
    seed: getSelectedSeed(state).seed,
});

export default translate('saveYourSeed4')(connect(mapStateToProps)(SeedPaperWallet));
