import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { connect } from 'react-redux';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import { isAndroid } from 'libs/device';
import DualFooterButtons from './DualFooterButtons';
import SingleFooterButton from './SingleFooterButton';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        width,
        justifyContent: 'flex-end',
        flex: 1,
    },
    modalContainer: {
        justifyContent: 'space-between',
        alignItems: 'center',
        width,
        height,
        flex: 1,
    },
    modalContent: {
        width,
        justifyContent: 'center',
        alignItems: 'center',
    },
});

export class ModalViewComponent extends PureComponent {
    static propTypes = {
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** Modal content */
        children: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
        /** Determines whether to display the topbar */
        displayTopBar: PropTypes.bool,
        /** Determines whether to display dual footer buttons */
        dualButtons: PropTypes.bool,
        /** Left button text for dual buttons */
        leftButtonText: PropTypes.string,
        /** Right button text for dual buttons */
        rightButtonText: PropTypes.string,
        /** Triggered on left button for press dual footer buttons */
        onLeftButtonPress: PropTypes.func,
        /** Triggered on right button press for dual footer buttons */
        onRightButtonPress: PropTypes.func,
        /** Button text for single footer button */
        buttonText: PropTypes.string,
        /** Triggered on button press for single footer button */
        onButtonPress: PropTypes.func,
        /** Determines whether right footer button should be disabled */
        disableRightButton: PropTypes.bool,
        /** Passes custom modal buttons */
        modalButtons: PropTypes.object,
    };

    static defaultProps = {
        displayTopBar: false,
        dualButtons: false,
        leftButtonText: '',
        rightButtonText: '',
        onLeftButtonPress: () => {},
        onRightButtonPress: () => {},
        onButtonPress: () => {},
        buttonText: '',
        disableRightButton: false,
    };

    /**
     *  Gets modal content layout styling, depending on Android/iOS and whether topBar should be displayed
     *
     *  @method getModalContentStyling
     *
     * @returns {object}
     */
    getModalContentStyling() {
        const { displayTopBar } = this.props;
        if (isAndroid) {
            return { flex: displayTopBar ? 1 - Styling.topbarHeightRatio : 1 };
        }
        return { height: displayTopBar ? height - Styling.topbarHeight : height };
    }

    render() {
        const {
            theme: { body },
            children,
            dualButtons,
            leftButtonText,
            rightButtonText,
            onLeftButtonPress,
            onRightButtonPress,
            buttonText,
            onButtonPress,
            disableRightButton,
            displayTopBar,
            modalButtons,
        } = this.props;

        return (
            <KeyboardAwareScrollView
                resetScrollToCoords={{ x: 0, y: 0 }}
                scrollEnabled={false}
                extraHeight={0}
                contentContainerStyle={styles.container}
            >
                {displayTopBar && (
                    <View style={isAndroid ? { flex: Styling.topbarHeightRatio } : { height: Styling.topbarHeight }} />
                )}
                <View style={[styles.modalContent, { backgroundColor: body.bg }, this.getModalContentStyling()]}>
                    {children}
                </View>
                <View style={{ position: 'absolute', bottom: 0 }}>
                    {modalButtons ||
                        ((dualButtons && (
                            <DualFooterButtons
                                onLeftButtonPress={() => onLeftButtonPress()}
                                onRightButtonPress={() => onRightButtonPress()}
                                leftButtonText={leftButtonText}
                                rightButtonText={rightButtonText}
                                disableRightButton={disableRightButton}
                            />
                        )) || <SingleFooterButton onButtonPress={() => onButtonPress()} buttonText={buttonText} />)}
                </View>
            </KeyboardAwareScrollView>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default connect(mapStateToProps)(ModalViewComponent);
