import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qr.js/lib/QRCode';

import { byteToChar } from 'libs/crypto';

import paperWallet from 'themes/paper-wallet.svg';
import paperWalletFilled from 'themes/paper-wallet-filled.svg';

import css from './seedPrint.scss';

const wallets = {
    paperWallet: paperWallet,
    paperWalletFilled: paperWalletFilled,
};

/**
 * Paper wallet layout component
 */
export default class SeedPrint extends PureComponent {
    static propTypes = {
        /** Should print filled wallet */
        filled: PropTypes.bool.isRequired,
        /** Seed byte array */
        seed: PropTypes.array.isRequired,
        /** Seed checksum */
        checksum: PropTypes.string.isRequired,
    };

    render() {
        const { filled, seed, checksum } = this.props;

        const qr = new QRCode(-1, 1);

        seed.forEach((byte) => {
            qr.addData(byteToChar(byte));
        });
        qr.make();

        const cells = qr.modules;

        return (
            <div className={css.print} onClick={() => window.print()}>
                {filled && (
                    <svg viewBox="0 0 595 841" xmlns="http://www.w3.org/2000/svg">
                        {seed.map((byte, index) => {
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
                        <text x="278" y="735">
                            {checksum}
                        </text>
                    </svg>
                )}
                <img width="auto" height="100vh" src={filled ? wallets.paperWallet : wallets.paperWalletFilled} />
            </div>
        );
    }
}
