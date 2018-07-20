/* global Electron */
import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';

import { updateTheme } from 'actions/settings';
import themes from 'themes/themes';

class Theming extends React.PureComponent {
    static propTypes = {
        location: PropTypes.object,
        updateTheme: PropTypes.func.isRequired,
    };

    state = {
        themeIndex: 0,
    };

    componentDidMount() {
        if (Electron.mode === 'dev') {
            this.onKey = this.onKeyDown.bind(this);
            window.addEventListener('keydown', this.onKey);
        }
    }

    componentWillUnmount() {
        if (Electron.mode === 'dev') {
            window.removeEventListener('keydown', this.onKey);
        }
    }

    onKeyDown(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
            this.setState({
                themeIndex: 0,
            });
            this.takeShot();
        }
    }

    takeShot() {
        const { themeIndex } = this.state;

        const themeNames = Object.keys(themes);

        if (themeIndex >= themeNames.length) {
            return;
        }

        const themeName = themeNames[themeIndex];
        const fileName = `wallet${this.props.location.pathname.replace(/\//g, '-')}_${themeName
            .replace(/ /g, '_')
            .toLowerCase()}`;

        this.setState({
            themeIndex: themeIndex + 1,
        });

        this.props.updateTheme(themes[themeName], themeName);

        console.log(fileName);

        setTimeout(() => {
            Electron.screenshot(fileName);
        }, 100);

        setTimeout(this.takeShot.bind(this), 400);
    }

    render() {
        return null;
    }
}

const mapDispatchToProps = {
    updateTheme,
};
export default connect(
    (state) => state,
    mapDispatchToProps,
)(Theming);
