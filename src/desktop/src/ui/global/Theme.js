import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getThemeFromState } from 'selectors/global';
/**
 * Theming style provider component
 */
class Theme extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
    };

    componentDidMount() {
        this.updateTheme(this.props.theme);
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.themeName !== nextProps.themeName) {
            this.updateTheme(nextProps.theme);
        }
    }

    updateTheme(theme) {
        Object.keys(theme).forEach((colorsName) => {
            const colorSet = theme[colorsName];

            Object.keys(colorSet).forEach((colorName) => {
                if (colorName === 'color') {
                    document.documentElement.style.setProperty(`--${colorsName}`, colorSet.color);
                } else if (colorsName === 'animations') {
                    let color = colorSet[colorName];
                    if (color.indexOf('rgb') !== 0) {
                        const path = color.split('.');
                        color = theme[path[0]][path[1]];
                    }
                    document.documentElement.style.setProperty(`--animations-${colorName}`, color);
                } else {
                    document.documentElement.style.setProperty(`--${colorsName}-${colorName}`, colorSet[colorName]);
                }
            });
        });
    }

    render() {
        return null;
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    themeName: state.settings.themeName,
});

export default connect(mapStateToProps)(Theme);
