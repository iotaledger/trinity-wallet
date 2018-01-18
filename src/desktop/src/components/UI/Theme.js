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
        //TODO: Normalize color naming together with mobile
        document.documentElement.style.setProperty('--color-body', theme.secondaryBarColor);
        document.documentElement.style.setProperty('--color-bg', this.hslToCSS(theme.backgroundColor));
        document.documentElement.style.setProperty('--color-bg-secondary', this.hslToCSS(theme.barColor));

        document.documentElement.style.setProperty('--color-positive', this.hslToCSS(theme.ctaColor));
        document.documentElement.style.setProperty('--color-negative', theme.pendingColor);
        document.documentElement.style.setProperty('--color-highlight', this.hslToCSS(theme.negativeColor));
        document.documentElement.style.setProperty('--color-extra', this.hslToCSS(theme.extraColor));

        document.documentElement.style.setProperty('--color-chart', theme.chartLineColor);
        document.documentElement.style.setProperty('--color-input', '#2a4a51');
        document.documentElement.style.setProperty('--color-box', '#234046');
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
