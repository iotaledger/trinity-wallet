import map from 'lodash/map';
import React, { PureComponent } from 'react';
import { ScrollView, View } from 'react-native';
import PropTypes from 'prop-types';
import SettingsSeparator from 'ui/components/SettingsSeparator';
import SettingsRow from 'ui/components/SettingsRow';

class SettingsRowsContainer extends PureComponent {
    static propTypes = {
        /** Row content */
        rows: PropTypes.array.isRequired,
        /** Number of visible rows */
        visibleRows: PropTypes.number.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired
    };

    constructor() {
        super();
        this.state = {
            height: 1
        }
    }

    render() {
        const { theme, rows, visibleRows } = this.props;
        const { height } = this.state;

        return (
            <View
                style={{ flex: 1 }}
                onLayout={(event) => {
                    this.setState({ height: event.nativeEvent.layout.height })
                }}
            >
                <ScrollView
                    scrollEnabled={rows.length > visibleRows}
                    showsVerticalScrollIndicator={rows.length > visibleRows}
                    contentContainerStyle={{ justifyContent: 'flex-start' }}
                    style={{ maxHeight: height }}
                    onContentSizeChange={() => rows.length <= visibleRows && this.scrollView.scrollTo({ y: 0 })}
                    ref={(ref) => {
                        this.scrollView = ref;
                    }}
                >
                    {map(rows, (row, index) => {
                        if (row.name === 'separator') {
                            return (
                                <SettingsSeparator
                                    height={height / visibleRows}
                                    inactive={row.inactive}
                                    color={theme.body.color}
                                    key={index}
                                />
                            );
                        } else if (row.name !== 'back' && row.name !== 'dualFooter') {
                            return (
                                <SettingsRow
                                    height={height / visibleRows}
                                    theme={theme}
                                    name={row.name}
                                    inactive={row.inactive}
                                    onPress={row.function}
                                    currentSetting={row.currentSetting}
                                    icon={row.icon}
                                    toggle={row.toggle}
                                    dropdownOptions={row.dropdownOptions}
                                    key={index}
                                />
                            );
                        }
                    })}
                </ScrollView>
            </View>
        );
    }
}

export default SettingsRowsContainer;
