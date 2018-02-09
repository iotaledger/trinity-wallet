import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

/**
 * Theming style provider component
 * @ignore
 */
class Theme extends PureComponent {
    static propTypes = {
        /* Theme definitions object */
        theme: PropTypes.object.isRequired,
        /* Unique yheme name */
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
