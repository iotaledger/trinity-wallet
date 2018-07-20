/* global Electron */
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { updateTheme } from 'actions/settings';
import themes from 'themes/themes';

/**
 * Theming style provider component
 * @ignore
 */
class Theme extends PureComponent {
    static propTypes = {
        location: PropTypes.object,
        theme: PropTypes.object.isRequired,
        themeName: PropTypes.string.isRequired,
        updateTheme: PropTypes.func.isRequired,
    };

    state = {
        themeIndex: 0,
        originalTheme: 'Default',
    };

    componentDidMount() {
        this.updateTheme(this.props.theme);

        if (Electron.mode === 'dev') {
            this.onKey = this.onKeyDown.bind(this);
            window.addEventListener('keydown', this.onKey);
        }
        if (Electron.mode === 'puppeteer') {
            this.timeout = setTimeout(this.takeShot.bind(this), 4000);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.themeName !== nextProps.themeName) {
            this.updateTheme(nextProps.theme);
        }
    }

    componentWillUnmount() {
        if (Electron.mode === 'dev') {
            window.removeEventListener('keydown', this.onKey);
        }
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    onKeyDown(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
            this.setState({
                themeIndex: 0,
                originalTheme: this.props.themeName,
            });
            this.takeShot();
        }
    }

    takeShot() {
        const { originalTheme, themeIndex } = this.state;

        const themeNames = Object.keys(themes);

        if (themeIndex >= themeNames.length) {
            this.props.updateTheme(themes[originalTheme], originalTheme);
            Electron.screenshotsDone();
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

        setTimeout(() => {
            Electron.screenshot(fileName);
        }, 300);

        setTimeout(this.takeShot.bind(this), 900);
    }

    updateTheme(theme) {
        Object.keys(theme).forEach((colorsName) => {
            const colorSet = theme[colorsName];

            Object.keys(colorSet).forEach((colorName) => {
                if (colorName === 'color') {
                    document.documentElement.style.setProperty(`--${colorsName}`, colorSet.color);
                } else {
                    document.documentElement.style.setProperty(`--${colorsName}-${colorName}`, colorSet[colorName]);
                }
            });
        });

        document.body.style.background = theme.body.bg;
    }

    render() {
        return null;
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    updateTheme,
};

export default connect(
    mapStateToProps,
    mapDispatchToProps,
)(Theme);
