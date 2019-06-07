import React, { PureComponent } from 'react';
import { View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import PropTypes from 'prop-types';
import i18next from 'shared-modules/libs/i18next.js';
import { height, width } from 'libs/dimensions';
import { Icon } from 'ui/theme/icons';
import { Styling } from 'ui/theme/general';

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
    backText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
});

class SettingsBackButton extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Triggered on back press */
        backFunction: PropTypes.func.isRequired,
        /** Disables back button */
        inactive: PropTypes.bool,
        /** Override title */
        name: PropTypes.string
    };

    static defaultProps = {
        inactive: false,
        name: i18next.t('global:back')
    };

    render() {
        const {
            theme: { body },
            inactive,
            backFunction,
            name
        } = this.props;

        return (
            <View style={[ styles.itemContainer, inactive && { opacity: 0.35 } ]}>
                <TouchableOpacity
                    onPress={backFunction}
                    hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                    disabled={inactive}
                >
                    <View style={styles.item}>
                        <Icon name="chevronLeft" size={width / 28} color={body.color} />
                        <Text style={[styles.backText, { color: body.color }]}>{name}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

export default SettingsBackButton;
