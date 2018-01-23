import React from 'react';

import Icon from 'components/UI/Icon';
import { icons } from 'icons/icons';

import css from './icons.css';

const Colors = () => {
    return (
        <div className={css.icons}>
            {Object.keys(icons).map((icon, key) => {
                return (
                    <div key={key}>
                        <Icon icon={icon} size={64} />
                        <Icon icon={icon} size={32} />
                        <Icon icon={icon} size={16} />
                        <p>{icon}</p>
                    </div>
                );
            })}
        </div>
    );
};

export default Colors;
