import React from 'react';
import css from './Loading.css';

export default class Loading extends React.PureComponent {

    render() {
        return (
            <div className={css.wrapper}>
                LOADING APPLICATION
            </div>
        );
    }

}
