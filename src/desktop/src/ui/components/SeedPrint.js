import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import QRCode from 'qr.js/lib/QRCode';

import { byteToChar } from 'libs/iota/converter';

import paperWallet from 'themes/paper-wallet.svg';
import paperWalletFilled from 'themes/paper-wallet-filled.svg';
import SourceSansPro from 'custom-fonts/SourceSansPro-Regular.json';

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
        seed: PropTypes.array,
        /** Seed checksum */
        checksum: PropTypes.string.isRequired,
    };

    render() {
        const { filled, seed, checksum } = this.props;

        const qr = new QRCode(-1, 1);
        if (seed) {
            seed.forEach((byte) => {
                qr.addData(byteToChar(byte));
            });

            qr.make();
        }

        const cells = seed ? qr.modules : [];

        return (
            <div className={css.print} onClick={() => window.print()}>
                {seed &&
                    filled && (
                        <svg viewBox="0 0 595 841" xmlns="http://www.w3.org/2000/svg">
                            {seed.map((byte, index) => {
                                const letter = byteToChar(byte);
                                const space = index % 9 > 5 ? 38 : index % 9 > 2 ? 19 : 0;
                                const x = 190 + (index % 9) * 26 + space;
                                const y = 348 + Math.floor(index / 9) * 32.8;
                                return (
                                    <path
                                        transform={`translate(${x},${y})`}
                                        d={SourceSansPro[letter]}
                                        key={`${index}${letter}`}
                                    />
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
                            {seed &&
                                checksum.split('').map((letter, index) => {
                                    return (
                                        <path
                                            transform={`translate(${372 + index * 12}, 725) scale(0.75)`}
                                            d={SourceSansPro[letter]}
                                            key={`${index}${letter}`}
                                        />
                                    );
                                })}
                        </svg>
                    )}
                <img width="auto" height="100vh" src={filled ? wallets.paperWalletFilled : wallets.paperWallet} />
            </div>
        );
    }
}
