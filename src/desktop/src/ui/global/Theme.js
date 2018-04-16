import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import DefaultWave from 'themes/waves/Default.png';
import MintWave from 'themes/waves/Mint.png';
import IonicWave from 'themes/waves/Ionic.png';
import ElectricWave from 'themes/waves/Electric.png';
import SteelBlueWave from 'themes/waves/SteelBlue.png';

/**
 * Theming style provider component
 * @ignore
 */
class Theme extends PureComponent {
    static propTypes = {
        /** Theme definitions object */
        theme: PropTypes.object.isRequired,
        /** Unique yheme name */
        themeName: PropTypes.string.isRequired,
    };

    componentDidMount() {
        this.updateTheme(this.props.theme);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.themeName !== nextProps.themeName) {
            this.updateTheme(nextProps.theme, nextProps.themeName);
        }
    }

    updateTheme(theme, themeName) {
        Object.keys(theme).map((colorsName) => {
            const colorSet = theme[colorsName];
            if (!colorSet.color) {
                return;
            }

            Object.keys(colorSet).map((colorName) => {
                if (colorName === 'color') {
                    document.documentElement.style.setProperty(`--${colorsName}`, colorSet.color);
                } else {
                    document.documentElement.style.setProperty(`--${colorsName}-${colorName}`, colorSet[colorName]);
                }
            });
        });

        let wave = IonicWave;

        switch (themeName) {
            case 'Ionic':
                wave = IonicWave;
                break;
            case 'Default':
                wave = DefaultWave;
                break;
            case 'Electric':
                wave = ElectricWave;
                break;
            case 'Mint':
                wave = MintWave;
                break;
            case 'SteelBlue':
                wave = SteelBlueWave;
                break;
            case 'Dark':
                wave = '';
                break;
            case 'Light':
                wave = '';
                break;
        }
        document.documentElement.style.setProperty('--wave-file', `url("${wave.replace('../dist', '')}")`);
    }

    render() {
        return null;
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
    themeName: state.settings.themeName,
});

export default connect(mapStateToProps)(Theme);
