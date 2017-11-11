import React from 'react';
import Logo from 'components/UI/Logo';
import css from 'components/Layout/Main.css';

export default class Header extends React.PureComponent {
    render() {
        return (
            <header>
                <div className={css.logo}>
                    <Logo width={48} />
                </div>
                <div className={css.seedsList}>
                    {/* Seeds */}
                    <ul>
                        <li>
                            <h1>My main wallet</h1>
                            <h2>326 Ti</h2>
                        </li>
                        <li>
                            <h1>Small change</h1>
                            <h2>16 Mi</h2>
                        </li>
                        <li>
                            <h1>For bad times</h1>
                            <h2>18 Gi</h2>
                        </li>
                    </ul>
                </div>
            </header>
        );
    }
}
