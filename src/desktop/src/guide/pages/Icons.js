import React from 'react';

import Icon from 'ui/views/settings/';
import { icons } from 'icons/icons';

import css from './icons.css';

const Colors = () => {
    return (
        <div>
            <h1>Icons</h1>
            <p>Where possible, vector icons should be used. Preferred icon sizes - 16, 32, 64.</p>
            <hr />
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
        </div>
    );
};

export default Colors;
