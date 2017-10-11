import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { translate } from 'react-i18next';
import Header from './Header';

class Template extends PureComponent {
    static propTypes = {
        t: PropTypes.func.isRequired,
        header: PropTypes.string.isRequired,
        subHeader: PropTypes.node.isRequired,
        main: PropTypes.node.isRequired,
        footer: PropTypes.node.isRequired,
    };

    render() {
        const { t, main, header, subHeader, footer } = this.props;
        return (
            <form onSubmit={e => e.preventDefault()}>
                <Header headline={t(header)} />
                {subHeader}
                <main
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignSelf: 'center',
                        justifyContent: 'space-between',
                    }}
                >
                    {main}
                </main>
                <footer>{footer}</footer>
            </form>
        );
    }
}

export default translate('welcome1')(Template);
