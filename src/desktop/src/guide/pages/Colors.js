import React from 'react';
import classNames from 'classnames';

import css from './colors.css';

const colors = ['primary', 'secondary', 'positive', 'negative', 'highlight', 'extra'];

const Colors = () => {
    return (
        <div>
            <h1>Colors</h1>
            <hr />
            {colors.map((color, key) => {
                return (
                    <div key={key} className={css.color}>
                        <strong className={css[color]}>{color}</strong>
                        <strong className={classNames(css[color], css.hover)}>{color}.hover</strong>
                    </div>
                );
            })}
            <div className={css.color}>
                <strong className={css.bg}>body.bg</strong>
                <strong className={css.bgHover}>body.hover</strong>
                <strong className={css.bgSecondary}>body.alt</strong>
                <strong className={css.bar}>bar</strong>
            </div>
            <div className={css.color}>
                <strong className={css.label}>label</strong>
                <strong className={css.input}>input</strong>
                <strong className={css.inputSecondary}>input.alt</strong>
                <strong className={css.inputOptional}>inputOptional.color</strong>
            </div>
            <div className={css.color}>
                <strong className={css.chart}>Chart line</strong>
            </div>
        </div>
    );
};

export default Colors;
