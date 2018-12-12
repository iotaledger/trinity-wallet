import merge from 'lodash/merge';
import debounce from 'lodash/debounce';
import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { connect } from 'react-redux';
import { StyleSheet, View } from 'react-native';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { width } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { isIPhoneX } from 'libs/device';
import Button from './Button';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'row',
    },
});

/** SingleFooterButton component */
class SingleFooterButton extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Id for automated screenshots */
        buttonTestID: PropTypes.string,
        /** Child content */
        buttonText: PropTypes.string.isRequired,
        /** Press event callback function */
        onButtonPress: PropTypes.func.isRequired,
        /** Optional styles to override the default ones */
        buttonStyle: PropTypes.object,
        /** Timeframe to debounce button presses */
        debounceTime: PropTypes.number,
    };

    static defaultProps = {
        buttonStyle: {},
        rightButtonStyle: {},
        debounceTime: 300,
    };

    constructor(props) {
        super(props);
        this.debounce = debounce(props.onButtonPress, props.debounceTime, { leading: true, trailing: false });
    }

    render() {
        const { theme: { primary }, buttonText, buttonTestID, buttonStyle } = this.props;

        return (
            <View style={[styles.container]}>
                <Button
                    onPress={() => this.debounce()}
                    style={merge(
                        {},
                        {
                            wrapper: {
                                backgroundColor: primary.color,
                                width: isIPhoneX ? Styling.contentWidth : width,
                                borderColor: primary.border,
                                borderWidth: 1,
                                borderRadius: isIPhoneX ? Styling.borderRadiusExtraLarge : 0,
                            },
                            children: {
                                color: primary.body,
                            },
                        },
                        buttonStyle,
                    )}
                    testID={buttonTestID}
                >
                    {buttonText}
                </Button>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
});

export default connect(mapStateToProps)(SingleFooterButton);
