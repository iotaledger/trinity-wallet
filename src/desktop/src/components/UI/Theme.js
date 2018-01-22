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
        console.log('BANG');
        Object.keys(theme).map((colorName) => {
            document.documentElement.style.setProperty(`--color-${colorName}`, this.hslToCSS(theme[colorName]));
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
