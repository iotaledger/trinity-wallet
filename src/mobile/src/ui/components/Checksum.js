import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { VALID_SEED_REGEX, getChecksum } from 'shared-modules/libs/iota/utils';
import { withNamespaces } from 'react-i18next';
import { width } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';

const styles = StyleSheet.create({
    checksumContainer: {
        justifyContent: 'center',
        flexDirection: 'row',
        alignItems: 'center',
    },
    checksumText: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Regular',
        marginLeft: width / 70,
    },
    checksum: {
        fontSize: Styling.fontSize3,
        fontFamily: 'SourceSansPro-Regular',
        marginLeft: width / 70,
        width: width / 10,
    },
});

export class Checksum extends Component {
    static propTypes = {
        /** @ignore */
        seed: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Show checksum modal */
        showModal: PropTypes.func.isRequired,
    };

    /**
     * Gets the checksum of a seed
     * @return {string} Checksum or symbol to be shown
     */
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

    /**
     * Gets the color of the checksum
     * @return {Object}
     */
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
            <TouchableOpacity
                onPress={() => this.props.showModal()}
                hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
            >
                <View style={styles.checksumContainer}>
                    <Icon name="info" size={width / 22} color={theme.body.color} />
                    <Text style={[styles.checksumText, { color: theme.body.color }]}>{t('checksum')}:</Text>
                    <Text style={[styles.checksum, this.getChecksumStyle()]}>{this.getChecksumValue()}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export default withNamespaces(['enterSeed', 'global'])(Checksum);
