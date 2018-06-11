import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { VALID_SEED_REGEX, getChecksum } from 'iota-wallet-shared-modules/libs/iota/utils';
import { translate } from 'react-i18next';
import { width } from '../utils/dimensions';
import GENERAL from '../theme/general';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    checksumContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    checksumText: {
        fontSize: GENERAL.fontSize3,
        fontFamily: 'SourceSansPro-Regular',
        marginLeft: width / 70,
    },
    checksum: {
        fontSize: GENERAL.fontSize3,
        fontFamily: 'SourceSansPro-Regular',
        marginLeft: width / 70,
        width: width / 10,
    },
});

class Checksum extends Component {
    static propTypes = {
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Show checksum modal */
        showModal: PropTypes.func.isRequired,
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

    getChecksumStyle() {
        const { theme, seed } = this.props;
        if (seed.length === 81 && seed.match(VALID_SEED_REGEX)) {
            return { color: theme.primary.color };
        }
        return { color: theme.body.color };
    }

    render() {
        const { t, theme } = this.props;

        return (
            <TouchableOpacity onPress={() => this.props.showModal()}>
                <View style={styles.checksumContainer}>
                    <Icon name="info" size={width / 22} color={theme.body.color} />
                    <Text style={[styles.checksumText, { color: theme.body.color }]}>{t('checksum')}:</Text>
                    <Text style={[styles.checksum, this.getChecksumStyle()]}>{this.getChecksumValue()}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export default translate(['enterSeed', 'global'])(Checksum);
