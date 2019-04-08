import React, { Component } from 'react';
import { StyleSheet, View, Text, PanResponder } from 'react-native';
import PropTypes from 'prop-types';
import ReactNativeHapticFeedback from 'react-native-haptic-feedback';
import { height, width } from 'libs/dimensions';
import TextWithLetterSpacing from './TextWithLetterSpacing';

const scaleMultiplier = height / 15;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    outerViewContainer: {
        height: 2 * scaleMultiplier,
        overflow: 'hidden',
        zIndex: 1,
    },
    outerView: {
        alignItems: 'center',
        zIndex: 1,
    },
    innerViewContainer: {
        height: scaleMultiplier,
        overflow: 'hidden',
        zIndex: 1,
    },
    innerView: {
        alignItems: 'center',
        zIndex: 1,
    },
    rowText: {
        fontFamily: 'SourceCodePro-Medium',
        fontSize: width / 17,
        zIndex: 1,
    },
    numberContainer: {
        width: scaleMultiplier * 0.5,
        height: scaleMultiplier,
        marginRight: width / 12,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberWrapper: {
        width: scaleMultiplier * 0.5,
        height: scaleMultiplier * 0.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    numberText: {
        fontFamily: 'SourceSansPro-Regular',
        fontSize: width / 26,
    },
    rowContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        height: scaleMultiplier,
    },
    outerOpacityView: {
        position: 'absolute',
        width,
        height: scaleMultiplier,
        zIndex: 1,
        opacity: 0.9,
    },
    innerOpacityView: {
        position: 'absolute',
        width,
        height: scaleMultiplier,
        zIndex: 1,
        opacity: 0.5,
    },
});

export default class SeedPicker extends Component {
    static propTypes = {
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** Callback for value change event */
        onValueChange: PropTypes.func,
        /** @ignore */
        theme: PropTypes.object.isRequired,
    };

    static defaultProps = {
        onValueChange: () => {},
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            selectedIndex: 0,
            rows: this.getRows(),
            aboveMidOnMove: false,
        };
    }

    componentWillMount() {
        this.panResponder = PanResponder.create({
            onStartShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponder: () => true,
            onMoveShouldSetPanResponderCapture: () => true,
            onPanResponderRelease: this.handlePanResponderRelease.bind(this),
            onPanResponderMove: this.handlePanResponderMove.bind(this),
        });
        this.isMoving = false;
        this.index = this.state.selectedIndex;
    }

    getRows() {
        const { seed } = this.props;
        const seedRows = [];
        let row = '';
        for (let i = 0; i < 81; i += 9) {
            row = seed.substring(i, i + 9);
            seedRows.push(row);
        }
        return seedRows;
    }

    move(dy) {
        const { selectedIndex } = this.state;
        this.middleHeight = Math.abs(-selectedIndex * scaleMultiplier + dy);
        this.top.setNativeProps({
            style: {
                marginTop: (2 - selectedIndex) * scaleMultiplier + dy,
            },
        });
        this.middle.setNativeProps({
            style: {
                marginTop: -selectedIndex * scaleMultiplier + dy,
            },
        });
        this.bottom.setNativeProps({
            style: {
                marginTop: (-selectedIndex - 1) * scaleMultiplier + dy,
            },
        });
    }

    handlePanResponderMove(evt, gestureState) {
        let dy = gestureState.dy;
        dy = dy / 2;
        const { rows, aboveMidOnMove } = this.state;
        if (this.isMoving) {
            return;
        }
        if (dy > 0) {
            this.move(dy > this.index * scaleMultiplier ? this.index * scaleMultiplier : dy);
        } else {
            this.move(
                dy < (this.index - rows.length + 1) * scaleMultiplier
                    ? (this.index - rows.length + 1) * scaleMultiplier
                    : dy,
            );
        }
        if (this.middleHeight % scaleMultiplier >= scaleMultiplier / 2 && !aboveMidOnMove) {
            this.setState({ aboveMidOnMove: true });
            ReactNativeHapticFeedback.trigger('selection', false);
        }
        if (this.middleHeight % scaleMultiplier <= scaleMultiplier / 2) {
            this.setState({ aboveMidOnMove: false });
        }
    }

    handlePanResponderRelease() {
        const middleHeight = this.middleHeight;
        this.index =
            middleHeight % scaleMultiplier >= scaleMultiplier / 2
                ? Math.ceil(middleHeight / scaleMultiplier)
                : Math.floor(middleHeight / scaleMultiplier);

        // Tapping seed rows (on Android) sometimes sets this.index to NaN and messes up the seed rows.
        // https://github.com/iotaledger/trinity-wallet/issues/848
        if (!isNaN(this.index)) {
            this.move(0);
            this.setState({ selectedIndex: this.index });
            this.props.onValueChange(this.index);
        }
    }

    renderRows(items) {
        const { theme: { primary, secondary, body } } = this.props;
        const { selectedIndex } = this.state;
        const rows = [];

        items.forEach((item, index) => {
            const textColor = index === selectedIndex ? primary.color : secondary.color;
            rows[index] = (
                <View style={styles.rowContainer} key={index}>
                    <View style={styles.numberContainer}>
                        <View style={[styles.numberWrapper, { backgroundColor: textColor }]}>
                            <Text style={[styles.numberText, { color: body.bg }]}>{index + 1}</Text>
                        </View>
                    </View>
                    <TextWithLetterSpacing spacing={height / 50} textStyle={[styles.rowText, { color: textColor }]}>
                        {item.substring(0, 3)}
                    </TextWithLetterSpacing>
                    <View style={{ marginHorizontal: width / 12 }}>
                        <TextWithLetterSpacing spacing={height / 50} textStyle={[styles.rowText, { color: textColor }]}>
                            {item.substring(3, 6)}
                        </TextWithLetterSpacing>
                    </View>
                    <TextWithLetterSpacing spacing={height / 50} textStyle={[styles.rowText, { color: textColor }]}>
                        {item.substring(6, 9)}
                    </TextWithLetterSpacing>
                </View>
            );
        });
        return rows;
    }

    render() {
        const { theme: { body } } = this.props;
        const { rows, selectedIndex } = this.state;
        const length = rows.length;
        const rowComponents = this.renderRows(rows);

        const topViewStyle = {
            marginTop: (2 - selectedIndex) * scaleMultiplier,
            height: length * scaleMultiplier,
        };
        const middleViewStyle = {
            marginTop: -selectedIndex * scaleMultiplier,
        };
        const bottomViewStyle = {
            marginTop: (-selectedIndex - 1) * scaleMultiplier,
            height: length * scaleMultiplier,
        };
        return (
            <View style={[styles.container]} {...this.panResponder.panHandlers}>
                <View style={styles.outerViewContainer}>
                    <View
                        style={[styles.outerView, topViewStyle]}
                        ref={(top) => {
                            this.top = top;
                        }}
                    >
                        {rowComponents}
                    </View>
                    <View style={[styles.innerOpacityView, { top: scaleMultiplier, backgroundColor: body.bg }]} />
                    <View style={[styles.outerOpacityView, { top: 0, backgroundColor: body.bg }]} />
                </View>
                <View style={styles.innerViewContainer}>
                    <View
                        style={[styles.innerView, middleViewStyle]}
                        ref={(middle) => {
                            this.middle = middle;
                        }}
                    >
                        {rowComponents}
                    </View>
                </View>
                <View style={styles.outerViewContainer}>
                    <View
                        style={[styles.outerView, bottomViewStyle]}
                        ref={(bottom) => {
                            this.bottom = bottom;
                        }}
                    >
                        {rowComponents}
                    </View>
                    <View style={[styles.innerOpacityView, { bottom: scaleMultiplier, backgroundColor: body.bg }]} />
                    <View style={[styles.outerOpacityView, { bottom: 0, backgroundColor: body.bg }]} />
                </View>
            </View>
        );
    }
}
