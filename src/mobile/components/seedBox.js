import React from 'react';
import { View, Image, StyleSheet } from 'react-native';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { TextWithLetterSpacing } from './textWithLetterSpacing';
import whiteArrowImagePath from 'iota-wallet-shared-modules/images/arrow-white.png';
import blackArrowImagePath from 'iota-wallet-shared-modules/images/arrow-black.png';

import GENERAL from '../theme/general';

import { width, height } from '../util/dimensions';

class SeedBox extends React.Component {
    render() {
        const { textColor, secondaryBackgroundColor } = this.props;
        const arrowImagePath = secondaryBackgroundColor === 'white' ? whiteArrowImagePath : blackArrowImagePath;

        return (
            <View style={[styles.seedBox, this.props.borderColor]}>
                <Image source={arrowImagePath} style={styles.arrow} />
                <View style={styles.seedBoxTextContainer}>
                    <View style={{ marginRight: width / 30 }}>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(0, 3)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(12, 15)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(24, 27)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(36, 39)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(48, 51)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(60, 63)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(72, 75)}
                        </TextWithLetterSpacing>
                    </View>
                    <View style={{ marginRight: width / 30 }}>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(3, 6)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(15, 18)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(27, 30)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(39, 42)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(51, 54)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(63, 66)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(75, 78)}
                        </TextWithLetterSpacing>
                    </View>
                    <View style={{ marginRight: width / 30 }}>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(6, 9)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(18, 21)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(30, 33)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(42, 45)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(54, 57)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(66, 69)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextLeft, textColor]}>
                            {this.props.seed.substring(78, MAX_SEED_LENGTH)}
                        </TextWithLetterSpacing>
                    </View>
                    <View style={{ marginRight: width / 30 }}>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextRight, textColor]}>
                            {this.props.seed.substring(9, 12)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextRight, textColor]}>
                            {this.props.seed.substring(21, 24)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextRight, textColor]}>
                            {this.props.seed.substring(33, 36)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextRight, textColor]}>
                            {this.props.seed.substring(45, 48)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextRight, textColor]}>
                            {this.props.seed.substring(57, 60)}
                        </TextWithLetterSpacing>
                        <TextWithLetterSpacing spacing={8} textStyle={[styles.seedBoxTextRight, textColor]}>
                            {this.props.seed.substring(69, 72)}
                        </TextWithLetterSpacing>
                    </View>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    seedBox: {
        borderWidth: 1,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.65,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height / 80,
        marginTop: height / 60,
    },
    seedBoxTextContainer: {
        width: width / 1.65,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: height / 160,
        paddingLeft: width / 30,
    },
    seedBoxTextLeft: {
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 25,
        textAlign: 'justify',
        backgroundColor: 'transparent',
        paddingVertical: 2,
    },
    seedBoxTextRight: {
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 25,
        textAlign: 'justify',
        backgroundColor: 'transparent',
        paddingVertical: 2,
    },
    arrow: {
        width: width / 1.9,
        height: height / 80,
    },
});

module.exports = SeedBox;
