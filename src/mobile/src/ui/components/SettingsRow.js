import React, { PureComponent } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import Toggle from 'ui/components/Toggle';
import DropdownComponent from 'ui/components/Dropdown';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';
import { height, width } from 'libs/dimensions';

const styles = StyleSheet.create({
    itemContainer: {
        flex: 1,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
        width,
        paddingHorizontal: width / 15,
    },
    content: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center'
    },
    titleText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
    },
    settingText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: 5,
        flex: 1,
        textAlign: 'right',
    },
});

class SettingsRow extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Settings row title */
        name: PropTypes.string.isRequired,
        /** Triggered when pressing row */
        onPress: PropTypes.func.isRequired,
        /** Determines whether to disable settings row */
        inactive: PropTypes.bool,
        /** Currently selected setting */
        currentSetting: PropTypes.string,
        /** Determines whether to render a toggle */
        toggle: PropTypes.bool,
        /** Icon name */
        icon: PropTypes.string,
        /** List of dropdown options */
        dropdownOptions: PropTypes.array,
    };

    static defaultProps = {
        inactive: false,
    };

    renderSettingsRow() {
      const {
          theme: { body, primary },
          name,
          inactive,
          onPress,
          icon,
          currentSetting,
          toggle
      } = this.props;

      return (
          <TouchableOpacity
              onPress={onPress}
              hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
              disabled={inactive}
          >
              <View style={styles.item}>
                  {icon && <Icon name={icon} size={width / 22} color={body.color} />}
                  <View style={styles.content}>
                      <Text style={[ styles.titleText, { color: body.color }, icon && { marginLeft: width / 25 } ]}>{name}</Text>
                      {currentSetting &&
                          <Text numberOfLines={1} style={[ styles.settingText, { color: body.color } ]}>
                              {currentSetting}
                          </Text>
                      }
                      {toggle !== undefined &&
                          <Toggle
                              active={toggle}
                              bodyColor={body.color}
                              primaryColor={primary.color}
                              scale={1}
                          />
                      }
                  </View>
              </View>
          </TouchableOpacity>
      );
    }

    render() {
        const { currentSetting, inactive, dropdownOptions, onPress } = this.props;
        return (
            <View style={[ styles.itemContainer, inactive && { opacity: 0.35 } ]}>
                {dropdownOptions &&
                <DropdownComponent
                    value={currentSetting}
                    options={dropdownOptions}
                    saveSelection={(item) => onPress(item)}
                    customView={this.renderSettingsRow()}
                    disableWhen={inactive}
                    dropdownWidth={{width}}
                />
                ||
                this.renderSettingsRow()}
            </View>
        );
    }
}

export default SettingsRow;
