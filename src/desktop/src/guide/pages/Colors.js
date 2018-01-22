import React from 'react';
import classNames from 'classnames';

import css from './colors.css';

const colors = ['positive', 'negative', 'highlight', 'extra'];

const Colors = () => {
    return (
        <div>
            {colors.map((color, key) => {
                return (
                    <div key={key} className={css.color}>
                        <strong className={css[color]}>{color}</strong>
                        <strong className={classNames(css[color], css.hover)}>{color} hover</strong>
                    </div>
                );
            })}
            <div className={css.color}>
                <strong className={css.bar}>Bar background</strong>
                <strong className={css.bgSecondary}>Secondary background</strong>
                <strong className={css.input}>input</strong>
            </div>
        </div>
    );
};

export default Colors;
