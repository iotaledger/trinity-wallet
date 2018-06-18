/* global Electron */
import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate, Trans } from 'react-i18next';

import QRCode from 'qr.js/lib/QRCode';

import { byteToChar } from 'libs/crypto';

import Modal from 'ui/components/modal/Modal';
import Button from 'ui/components/Button';
import Icon from 'ui/components/Icon';

import paperWallet from 'themes/paper-wallet.svg';
import paperWalletFilled from 'themes/paper-wallet-filled.svg';

import SeedSaveWrite from './SeedSaveWrite';
import SeedSaveExport from './SeedSaveExport';

import css from './index.scss';

const wallets = {
    paperWallet: paperWallet,
    paperWalletFilled: paperWalletFilled,
};

/**
 * Onboarding, Seed backup step
 */
class SeedSave extends PureComponent {
    static propTypes = {
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         * @ignore
         */
        t: PropTypes.func.isRequired,
    };

    state = {
        seed: Electron.getOnboardingSeed(),
        writeVisible: false,
        exportVisible: false,
    };

    render() {
        const { t } = this.props;
        const { writeVisible, exportVisible, seed } = this.state;

        const checksum = Electron.getChecksum(seed);

        const qr = new QRCode(-1, 1);

        seed.forEach((byte) => {
            qr.addData(byteToChar(byte));
        });
        qr.make();

        const cells = qr.modules;

        return (
            <form>
                <section className={css.wide}>
                    <h1>{t('saveYourSeed:saveYourSeed')}</h1>
                    <Trans i18nKey="saveYourSeed:mustSaveYourSeed">
                        <p>
                            You must save your seed with <strong>at least one</strong> of the options listed below.
                        </p>
                    </Trans>
                    <nav className={css.choice}>
                        <a onClick={() => this.setState({ exportVisible: true })}>
                            <div>
                                <Icon icon="password" size={24} />
                            </div>
                            <h4>{t('addToPasswordManager')}</h4>
                        </a>
                        <a onClick={() => this.setState({ writeVisible: true, writeIndex: 1 })} className={css.secure}>
                            <h3>{t('saveYourSeed:mostSecure')}</h3>
                            <div>
                                <Icon icon="write" size={24} />
                            </div>
                            <h4>{t('saveYourSeed:writeYourSeedDown')}</h4>
                        </a>
                        <a onClick={() => window.print()}>
                            <div>
                                <Icon icon="print" size={24} />
                            </div>
                            <h4>{t('paperWallet')}</h4>
                        </a>
                    </nav>
                </section>
                <footer>
                    <Button to="/onboarding/seed-generate" className="square" variant="dark">
                        {t('goBackStep')}
                    </Button>
                    <Button to="/onboarding/seed-verify" className="square" variant="primary">
                        {t('saveYourSeed:iHavesavedMySeed')}
                    </Button>
                </footer>
                <Modal
                    variant="fullscreen"
                    isOpen={writeVisible || exportVisible}
                    onClose={() => this.setState({ writeVisible: false, exportVisible: false })}
                >
                    {writeVisible ? (
                        <SeedSaveWrite
                            seed={seed}
                            checksum={checksum}
                            onClose={() => this.setState({ writeVisible: false })}
                        />
                    ) : (
                        <SeedSaveExport seed={seed} onClose={() => this.setState({ exportVisible: false })} />
                    )}
                </Modal>
                <div className={css.print} onClick={() => window.print()}>
                    {writeVisible && seed ? null : (
                        <svg viewBox="0 0 595 841" xmlns="http://www.w3.org/2000/svg">
                            {seed &&
                                seed.map((byte, index) => {
                                    const letter = byteToChar(byte % 27);
                                    const space = index % 9 > 5 ? 38 : index % 9 > 2 ? 19 : 0;
                                    const x = 193 + (index % 9) * 26 + space;
                                    const y = 365 + Math.floor(index / 9) * 32.8;
                                    return (
                                        <text x={x} y={y} key={`${index}${letter}`}>
                                            {letter}
                                        </text>
                                    );
                                })}
                            {cells.map((row, rowIndex) => {
                                return row.map((cell, cellIndex) => (
                                    <rect
                                        height={1.6}
                                        key={cellIndex}
                                        style={{ fill: cell ? '#000000' : 'none' }}
                                        width={1.6}
                                        x={160 + cellIndex * 1.6}
                                        y={698 + rowIndex * 1.6}
                                    />
                                ));
                            })}
                            <text x="373" y="735">
                                {checksum}
                            </text>
                        </svg>
                    )}
                    <img width="auto" height="100vh" src={writeVisible ? paperWallet : wallets.paperWalletFilled} />
                </div>
            </form>
        );
    }
}

export default translate()(SeedSave);
