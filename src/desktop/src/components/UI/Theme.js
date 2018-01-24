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

    updateTheme(theme) {
        Object.keys(theme).map((colorName) => {
            const color = theme[colorName];
            if (!color.color) {
                return;
            }
            document.documentElement.style.setProperty(`--${colorName}`, color.color);
            document.documentElement.style.setProperty(`--${colorName}-bg`, color.background || color.color);
            document.documentElement.style.setProperty(
                `--${colorName}-border`,
                color.border || color.background || color.color,
            );
            document.documentElement.style.setProperty(`--${colorName}-secondary`, color.secondary || color.color);
            document.documentElement.style.setProperty(`--${colorName}-body`, color.body || theme.body.color);
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
