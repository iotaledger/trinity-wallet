import React, { PureComponent } from 'react';
import { StyleSheet, View, TouchableOpacity, Text, ActivityIndicator } from 'react-native';
import i18next from 'shared-modules/libs/i18next.js';
import PropTypes from 'prop-types';
import { Icon } from 'ui/theme/icons';
import { height, width } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';

const styles = StyleSheet.create({
    dualFooterContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        alignItems: 'center',
    },
    footerItemLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-start',
    },
    footerItemRight: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    footerTextLeft: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    footerTextRight: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
        backgroundColor: 'transparent',
        marginRight: width / 20,
    },
    activityIndicator: {
        justifyContent: 'center',
        alignItems: 'center',
    },
});

class SettingsDualFooter extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Hides action button */
        hideActionButton: PropTypes.bool,
        /** Triggered on back press */
        backFunction: PropTypes.func.isRequired,
        /** Action button title */
        actionName: PropTypes.string,
        /** Display activity indicator instead of action button */
        actionButtonLoading: PropTypes.bool,
        /** Triggered on action button press */
        actionFunction: PropTypes.func,
        /** Sets action button icon */
        actionIcon: PropTypes.string,
        /** Allows custom component in place of action button */
        customActionView: PropTypes.object
    };

    static defaultProps = {
        hideActionButton: false,
        actionButtonLoading: false,
        actionIcon: 'tick'
    };

    render() {
        const {
            theme: { body, primary },
            hideActionButton,
            backFunction,
            actionName,
            actionButtonLoading,
            actionFunction,
            actionIcon,
            customActionView
        } = this.props;

        return (
            <View style={[ styles.dualFooterContainer, { justifyContent: hideActionButton ? 'flex-start' : 'space-between'} ]}>
                <TouchableOpacity
                    onPress={backFunction}
                    hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                >
                    <View style={styles.footerItemLeft}>
                        <Icon name="chevronLeft" size={width / 28} color={body.color} />
                        <Text style={[styles.footerTextLeft, { color: body.color }]}>{i18next.t('global:back')}</Text>
                    </View>
                </TouchableOpacity>
                { !customActionView && hideActionButton === false && !actionButtonLoading &&
                <TouchableOpacity
                    onPress={actionFunction}
                    hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                >
                    <View style={styles.footerItemRight}>
                        <Text style={[styles.footerTextRight, { color: body.color }]}>{actionName}</Text>
                        <Icon name={actionIcon} size={width / 28} color={body.color} />
                    </View>
                </TouchableOpacity>
                }
                {actionButtonLoading &&
                <View style={styles.footerItemRight}>
                    <ActivityIndicator
                        animating
                        style={styles.activityIndicator}
                        size="small"
                        color={primary.color}
                    />
                </View>
                }
                {customActionView}
            </View>
        );
    }
}

export default SettingsDualFooter;
