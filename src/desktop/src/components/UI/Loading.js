import React from 'react';
import Logo from 'components/UI/Logo';
import css from './Loading.css';

export default class Loading extends React.PureComponent {
    render() {
        return (
            <div className={css.loading}>
                <Logo width={168} className="animated" />
            </div>
        );
    }
}
