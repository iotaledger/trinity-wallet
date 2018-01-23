import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

class Theme extends PureComponent {
    static propTypes = {
        theme: PropTypes.object.isRequired,
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

    hslToCSS(hsla) {
        return `hsla(${Math.round(hsla.h)},${Math.round(hsla.s * 100)}%,${Math.round(hsla.l * 100)}%,${hsla.a})`;
    }

    updateTheme(theme) {
        Object.keys(theme).map((colorName) => {
            const color = theme[colorName];
            if (!color.color) {
                return;
            }
            document.documentElement.style.setProperty(`--${colorName}`, this.hslToCSS(color.color));
            document.documentElement.style.setProperty(
                `--${colorName}-bg`,
                this.hslToCSS(color.background || color.color),
            );
            document.documentElement.style.setProperty(
                `--${colorName}-border`,
                this.hslToCSS(color.border || color.background || color.color),
            );
            document.documentElement.style.setProperty(
                `--${colorName}-secondary`,
                this.hslToCSS(color.secondary || color.color),
            );
            document.documentElement.style.setProperty(
                `--${colorName}-body`,
                this.hslToCSS(color.body || theme.body.color),
            );
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
