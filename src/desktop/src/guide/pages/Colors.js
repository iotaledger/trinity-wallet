import React from 'react';
import classNames from 'classnames';

import css from './colors.css';

const colors = ['positive', 'secondary', 'negative', 'highlight', 'extra'];

const Colors = () => {
    return (
        <div>
            <h1>Colors</h1>
            <p />
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
                <strong className={css.bar}>bar</strong>
                <strong className={css.bgSecondary}>body-secondary</strong>
                <strong className={css.input}>input</strong>
            </div>
            <div className={css.color}>
                <strong className={css.chart}>chart</strong>
                <strong className={css.cta}>cta</strong>
                <strong className={css.input}>input</strong>
            </div>
        </div>
    );
};

export default Colors;
