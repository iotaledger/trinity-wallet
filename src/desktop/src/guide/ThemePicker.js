import React from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { updateTheme } from 'actions/settings';
import { themes } from 'themes/themes';

import Select from 'components/UI/Select';

class ThemePicker extends React.PureComponent {
    static propTypes = {
        updateTheme: PropTypes.func.isRequired,
    };

    state = {};

    render() {
        return (
            <div>
                <Select
                    defaultValue="en"
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

const mapStateToProps = () => ({});

const mapDispatchToProps = {
    updateTheme,
};

export default connect(mapStateToProps, mapDispatchToProps)(ThemePicker);
