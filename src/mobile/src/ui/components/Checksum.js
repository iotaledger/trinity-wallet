import size from 'lodash/size';
import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { MAX_SEED_TRITS, getChecksum } from 'shared-modules/libs/iota/utils';
import { tritsToChars } from 'shared-modules/libs/iota/converter';
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
        seed: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
        /** Show checksum modal */
        showModal: PropTypes.func.isRequired,
    };

    /**
     * Gets the checksum of a seed
     *
     * @method getValue
     *
     * @param {array} input
     *
     * @return {string} Checksum or symbol to be shown
     */
    static getValue(input) {
        const sizeOfInput = size(input);

        if (sizeOfInput !== 0 && sizeOfInput < MAX_SEED_TRITS) {
            return '< 81';
        }

        if (sizeOfInput > MAX_SEED_TRITS) {
            return '> 81';
        } else if (sizeOfInput === MAX_SEED_TRITS) {
            return tritsToChars(getChecksum(input));
        }

        return '...';
    }

    /**
     * Gets the color of the checksum
     *
     * @method getStyle
     *
     * @param {object} theme
     * @param {array} seed
     *
     * @return {object}
     */
    static getStyle(theme, seed) {
        if (size(seed) === MAX_SEED_TRITS) {
            return { color: theme.primary.color };
        }

        return { color: theme.body.color };
    }

    render() {
        const { t, theme, seed } = this.props;

        return (
            <TouchableOpacity
                onPress={() => this.props.showModal()}
                hitSlop={{ top: width / 30, bottom: width / 30, left: width / 30, right: width / 30 }}
            >
                <View style={styles.checksumContainer}>
                    <Icon name="info" size={width / 22} color={theme.body.color} />
                    <Text style={[styles.checksumText, { color: theme.body.color }]}>{t('checksum')}:</Text>
                    <Text style={[styles.checksum, Checksum.getStyle(theme, seed)]}>{Checksum.getValue(seed)}</Text>
                </View>
            </TouchableOpacity>
        );
    }
}

export default withNamespaces(['enterSeed', 'global'])(Checksum);
