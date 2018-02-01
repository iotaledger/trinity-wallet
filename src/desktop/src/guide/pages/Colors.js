import React from 'react';
import classNames from 'classnames';

import css from './colors.css';

const colors = ['positive', 'secondary', 'negative', 'highlight', 'extra'];

const Colors = () => {
    return (
        <div>
            <h1>Colors</h1>
            <hr />
            {colors.map((color, key) => {
                return (
                    <div key={key} className={css.color}>
                        <strong className={css[color]}>{color}</strong>
                        <strong className={classNames(css[color], css.hover)}>{color} hover</strong>
                    </div>
                );
            })}
            <div className={css.color}>
                <strong className={css.bg}>body-bg</strong>
                <strong className={css.bgSecondary}>body-secondary</strong>
                <strong className={css.bar}>bar</strong>
            </div>
            <div className={css.color}>
                <strong className={css.label}>label</strong>
                <strong className={css.input}>Input</strong>
                <strong className={css.inputSecondary}>Input secondary</strong>
            </div>
            <div className={css.color}>
                <strong className={css.chart}>Chart gradient</strong>
                <strong className={css.cta}>cta</strong>
            </div>
        </div>
    );
};

export default Colors;
