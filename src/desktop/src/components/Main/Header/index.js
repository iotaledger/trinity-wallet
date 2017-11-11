import React from 'react';
import Logo from 'components/UI/Logo';

export default class Header extends React.PureComponent {
    render() {
        return (
            <header>
                <Logo width={48} />
                {/* Seeds */}
            </header>
        );
    }
}
