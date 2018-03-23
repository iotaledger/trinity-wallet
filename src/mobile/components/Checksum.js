import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { VALID_SEED_REGEX, getChecksum } from 'iota-wallet-shared-modules/libs/iota/utils';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';

const styles = StyleSheet.create({
    checksum: {
        width: width / 8,
        height: height / 20,
        borderRadius: GENERAL.borderRadiusSmall,
        justifyContent: 'center',
        alignItems: 'center',
    },
    checksumText: {
        fontSize: width / 29.6,
        fontFamily: 'Lato-Regular',
    },
});

class Checksum extends React.Component {
    static propTypes = {
        seed: PropTypes.string.isRequired,
        input: PropTypes.object.isRequired,
    };

    getChecksumValue() {
        const { seed } = this.props;
        let checksumValue = '...';

        if (seed.length !== 0 && !seed.match(VALID_SEED_REGEX)) {
            checksumValue = '!';
        } else if (seed.length !== 0 && seed.length < 81) {
            checksumValue = '< 81';
        } else if (seed.length === 81 && seed.match(VALID_SEED_REGEX)) {
            checksumValue = getChecksum(seed);
        }
        return checksumValue;
    }

    render() {
        const { input } = this.props;

        return (
            <View style={[styles.checksum, { backgroundColor: input.bg }]}>
                <Text style={[styles.checksumText, { color: input.color }]}>{this.getChecksumValue()}</Text>
            </View>
        );
    }
}

export default Checksum;
