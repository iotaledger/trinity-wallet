import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet } from 'react-native';
import { MAX_SEED_LENGTH } from 'shared-modules/libs/iota/utils';
import { Styling } from 'ui/theme/general';
import { width, height } from 'libs/dimensions';
import TextWithLetterSpacing from './TextWithLetterSpacing';

const styles = StyleSheet.create({
    seedBox: {
        borderWidth: 1,
        borderRadius: Styling.borderRadiusLarge,
        alignItems: 'center',
        justifyContent: 'center',
    },
    seedBoxTextContainer: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
    },
    seedBoxTextLeft: {
        fontFamily: 'SourceCodePro-Medium',
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    seedBoxTextRight: {
        fontFamily: 'SourceCodePro-Medium',
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    triangleRight: {
        transform: [{ rotate: '90deg' }],
        width: 0,
        height: 0,
        backgroundColor: 'transparent',
        borderStyle: 'solid',
        borderLeftColor: 'transparent',
        borderRightColor: 'transparent',
    },
    arrow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
    },
});

class SeedBox extends PureComponent {
    static propTypes = {
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** SeedBox text color */
        textColor: PropTypes.object.isRequired,
        /** SeedBox body color */
        bodyColor: PropTypes.string.isRequired,
        /** SeedBox border color */
        borderColor: PropTypes.object.isRequired,
        scale: PropTypes.number,
    };

    static defaultProps = {
        scale: 1,
    };

    render() {
        const { textColor, bodyColor, seed, scale } = this.props;
        const fontSize = { fontSize: Styling.fontSize3 * scale };
        const textBoxPadding = { paddingVertical: height / 200 * scale };

        return (
            <View
                style={[
                    styles.seedBox,
                    this.props.borderColor,
                    { width: width / 1.65 * scale, paddingVertical: height / 45 * scale },
                ]}
            >
                <View style={styles.arrow}>
                    <View
                        style={{
                            width: width / 2.05 * scale,
                            borderBottomWidth: 2.5 * scale,
                            borderBottomColor: bodyColor,
                        }}
                    />
                    <View
                        style={[
                            styles.triangleRight,
                            {
                                borderLeftWidth: width / 70 * scale,
                                borderRightWidth: width / 70 * scale,
                                borderBottomWidth: width / 35 * scale,
                                borderBottomColor: bodyColor,
                            },
                        ]}
                    />
                </View>
                <View
                    style={[
                        styles.seedBoxTextContainer,
                        {
                            width: width / 1.65 * scale,
                            paddingTop: height / 150 * scale,
                            paddingLeft: width / 30 * scale,
                        },
                    ]}
                >
                    <View style={{ marginRight: width / 30 * scale }}>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(0, 3)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(12, 15)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(24, 27)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(36, 39)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(48, 51)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(60, 63)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(72, 75)}
                        </TextWithLetterSpacing>
                    </View>
                    <View style={{ marginRight: width / 30 * scale }}>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(3, 6)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(15, 18)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(27, 30)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(39, 42)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(51, 54)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(63, 66)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(75, 78)}
                        </TextWithLetterSpacing>
                    </View>
                    <View style={{ marginRight: width / 30 * scale }}>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(6, 9)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(18, 21)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(30, 33)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(42, 45)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(54, 57)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(66, 69)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextLeft, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(78, MAX_SEED_LENGTH)}
                        </TextWithLetterSpacing>
                    </View>
                    <View style={{ marginRight: width / 30 * scale }}>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextRight, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(9, 12)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextRight, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(21, 24)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextRight, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(33, 36)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextRight, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(45, 48)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextRight, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(57, 60)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing
                            spacing={8 * scale}
                            textStyle={[styles.seedBoxTextRight, textColor, fontSize, textBoxPadding]}
                        >
                            {seed.substring(69, 72)}
                        </TextWithLetterSpacing>
                    </View>
                </View>
            </View>
        );
    }
}

export default SeedBox;
