import React, { Component } from 'react';
import { StyleSheet, View, Text, PanResponder } from 'react-native';
import PropTypes from 'prop-types';
import { height, width } from '../utils/dimensions';
import TextWithLetterSpacing from '../components/TextWithLetterSpacing';

const scaleMultiplier = height / 15;

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    rowContainer: {
        height: scaleMultiplier,
        overflow: 'hidden',
        zIndex: 1,
    },
    rowWrapper: {
        alignItems: 'center',
        zIndex: 1,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
        height: scaleMultiplier,
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
        backgroundColor: 'transparent',
    },
});

export default class SeedPicker extends Component {
    static propTypes = {
        seed: PropTypes.string.isRequired,
        onValueChange: PropTypes.func.isRequired,
        theme: PropTypes.object.isRequired,
    };

    constructor(props, context) {
        super(props, context);
        this.state = {
            selectedIndex: 0,
            rows: this.getRows(),
        };
    }

    componentWillMount() {
        this.panResponder = PanResponder.create({
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
        this.outerTop.setNativeProps({
            style: {
                marginTop: (2 - selectedIndex) * scaleMultiplier + dy,
            },
        });
        this.innerTop.setNativeProps({
            style: {
                marginTop: (1 - selectedIndex) * scaleMultiplier + dy,
            },
        });
        this.middle.setNativeProps({
            style: {
                marginTop: -selectedIndex * scaleMultiplier + dy,
            },
        });
        this.innerBottom.setNativeProps({
            style: {
                marginTop: (-selectedIndex - 1) * scaleMultiplier + dy,
            },
        });
        this.outerBottom.setNativeProps({
            style: {
                marginTop: (-selectedIndex - 2) * scaleMultiplier + dy,
            },
        });
    }

    handlePanResponderMove(evt, gestureState) {
        const dy = gestureState.dy;
        const { rows } = this.state;

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
    }

    handlePanResponderRelease() {
        const middleHeight = this.middleHeight;
        this.index =
            middleHeight % scaleMultiplier >= scaleMultiplier / 2
                ? Math.ceil(middleHeight / scaleMultiplier)
                : Math.floor(middleHeight / scaleMultiplier);
        this.move(0);
        this.setState({ selectedIndex: this.index });
        this.props.onValueChange(this.index);
    }

    renderRows(items) {
        const { theme: { primary, secondary, body } } = this.props;
        const { selectedIndex } = this.state;
        const rows = [];
        items.forEach((item, index) => {
            const textColor = index === selectedIndex ? primary.color : secondary.color;
            rows[index] = (
                <View style={styles.row} key={index}>
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
        const { rows, selectedIndex } = this.state;
        const rowComponents = this.renderRows(rows);

        const outerTopRowStyle = {
            marginTop: (2 - selectedIndex) * scaleMultiplier,
            height: scaleMultiplier,
            opacity: 0.3,
        };
        const innerTopRowStyle = {
            marginTop: (1 - selectedIndex) * scaleMultiplier,
            height: scaleMultiplier,
            opacity: 0.6,
        };
        const middleRowStyle = {
            marginTop: -selectedIndex * scaleMultiplier,
        };
        const innerBottomRowStyle = {
            marginTop: (-selectedIndex - 1) * scaleMultiplier,
            height: scaleMultiplier,
            opacity: 0.6,
        };
        const outerBottomRowStyle = {
            marginTop: (-selectedIndex - 2) * scaleMultiplier,
            height: scaleMultiplier,
            opacity: 0.3,
        };

        return (
            <View style={[styles.container]} {...this.panResponder.panHandlers}>
                <View style={styles.rowContainer}>
                    <View
                        style={[styles.rowWrapper, outerTopRowStyle]}
                        ref={(outerTop) => {
                            this.outerTop = outerTop;
                        }}
                    >
                        {rowComponents}
                    </View>
                </View>
                <View style={styles.rowContainer}>
                    <View
                        style={[styles.rowWrapper, innerTopRowStyle]}
                        ref={(innerTop) => {
                            this.innerTop = innerTop;
                        }}
                    >
                        {rowComponents}
                    </View>
                </View>
                <View style={styles.rowContainer}>
                    <View
                        style={[styles.rowWrapper, middleRowStyle]}
                        ref={(middle) => {
                            this.middle = middle;
                        }}
                    >
                        {rowComponents}
                    </View>
                </View>
                <View style={styles.rowContainer}>
                    <View
                        style={[styles.rowWrapper, innerBottomRowStyle]}
                        ref={(innerBottom) => {
                            this.innerBottom = innerBottom;
                        }}
                    >
                        {rowComponents}
                    </View>
                </View>
                <View style={styles.rowContainer}>
                    <View
                        style={[styles.rowWrapper, outerBottomRowStyle]}
                        ref={(outerBottom) => {
                            this.outerBottom = outerBottom;
                        }}
                    >
                        {rowComponents}
                    </View>
                </View>
            </View>
        );
    }
}
