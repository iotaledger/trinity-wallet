import React from 'react';
import classNames from 'classnames';

import css from './Colors.css';

const colors = ['positive', 'negative', 'highlight', 'extra'];

const Colors = () => {
    return (
        <div>
            {colors.map((color, key) => {
                return (
                    <div key={key} className={css.color}>
                        {css[`${color}Body`] ? <strong className={css[`${color}Body`]}>{`${color}Body`}</strong> : null}
                        <strong className={css[color]}>{color}</strong>
                        <strong className={classNames(css[color], css.hover)}>{color} hover</strong>
                    </div>
                );
            })}
            <div className={css.color}>
                <strong className={css.bg}>bg</strong>
                <strong className={css.bgBar}>bgBar</strong>
                <strong className={css.bgSecondary}>bgSecondary</strong>
            </div>
            <div className={css.color}>
                <strong className={css.body}>body</strong>
                <strong className={css.input}>input</strong>
                <strong className={css.border}>border</strong>
            </div>
        </div>
    );
};

export default Colors;
