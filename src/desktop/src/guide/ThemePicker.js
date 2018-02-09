import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateTheme } from 'actions/settings';
import { themes } from 'themes/themes';

import Select from 'ui/components/input/Select';

class ThemePicker extends React.PureComponent {
    static propTypes = {
        themeName: PropTypes.string.isRequired,
        updateTheme: PropTypes.func.isRequired,
    };
    state = {};

    render() {
        return (
            <div>
                <Select
                    value={this.props.themeName}
                    onChange={(e) => {
                        this.props.updateTheme(themes[e.target.value], e.target.value);
                    }}
                >
                    {Object.keys(themes).map((themeName) => (
                        <option key={themeName} value={themeName}>
                            {themeName}
                        </option>
                    ))}
                </Select>
            </div>
        );
    }
}

const mapStateToProps = (state) => ({
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    updateTheme,
};

export default connect(mapStateToProps, mapDispatchToProps)(ThemePicker);
