import React from 'react';
import Logo from 'components/UI/Logo';
import css from './Loading.css';

export default class Loading extends React.PureComponent {
    render() {
        return (
            <div className={css.wrapper}>
                <div>
                    <div className={css.animation}>
                        <Logo />
                    </div>
                </div>
            </div>
        );
    }
}
