import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { getChecksum } from 'iota-wallet-shared-modules/libs/iota/utils';
import Seedbox from '../components/seedBox';
import { width, height } from '../util/dimensions';
import GENERAL from '../theme/general';
import DynamicStatusBar from '../components/dynamicStatusBar';
import { Icon } from '../theme/icons.js';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 4.5,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        justifyContent: 'flex-end',
        flexDirection: 'row',
        alignItems: 'flex-end',
    },
    optionButtonText: {
        color: '#8BD4FF',
        fontFamily: 'Lato-Light',
        fontSize: width / 25.3,
        textAlign: 'center',
        paddingHorizontal: width / 20,
        backgroundColor: 'transparent',
    },
    optionButton: {
        borderColor: '#8BD4FF',
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.6,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        paddingTop: height / 25,
        marginBottom: height / 30,
        paddingHorizontal: width / 7,
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    doneButton: {
        borderWidth: 1.2,
        borderRadius: GENERAL.borderRadius,
        width: width / 3,
        height: height / 14,
        alignItems: 'center',
        justifyContent: 'space-around',
        marginBottom: height / 20,
    },
    doneText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 24.4,
        backgroundColor: 'transparent',
    },
    seedBox: {
        borderColor: 'white',
        borderWidth: 1,
        borderRadius: GENERAL.borderRadiusLarge,
        width: width / 1.65,
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: height / 80,
    },
    seedBoxTextContainer: {
        width: width / 1.65,
        flexDirection: 'row',
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingTop: height / 160,
        paddingLeft: width / 70,
    },
    seedBoxTextLeft: {
        color: 'white',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 25,
        textAlign: 'justify',
        letterSpacing: 8,
        backgroundColor: 'transparent',
        paddingRight: width / 70,
        paddingVertical: 2,
    },
    seedBoxTextRight: {
        color: 'white',
        fontFamily: 'Inconsolata-Bold',
        fontSize: width / 25,
        textAlign: 'justify',
        letterSpacing: 8,
        backgroundColor: 'transparent',
        paddingVertical: 2,
    },
    arrow: {
        width: width / 2,
        height: height / 80,
    },
    checksum: {
        width: width / 8,
        height: height / 20,
        borderRadius: GENERAL.borderRadiusSmall,
        borderColor: 'white',
        borderWidth: height / 1000,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 30,
    },
    checksumText: {
        fontSize: width / 29.6,
        color: 'white',
        fontFamily: 'Lato-Regular',
    },
});

class WriteSeedDown extends Component {
    static propTypes = {
        navigator: PropTypes.object.isRequired,
        t: PropTypes.func.isRequired,
        positive: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        seed: PropTypes.string.isRequired,
    };

    onDonePress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    render() {
        const { t, positive, body, seed } = this.props;
        const checksum = getChecksum(seed);
        const textColor = { color: body.color };
        const borderColor = { borderColor: body.color };

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <DynamicStatusBar backgroundColor={body.bg} />
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                </View>
                <View style={styles.midContainer}>
                    <Text style={[styles.infoText, textColor]}>
                        <Text style={styles.infoTextNormal}>
                            {t('writeSeedDown:yourSeedIs', { maxSeedLength: MAX_SEED_LENGTH })}
                        </Text>
                        <Trans i18nKey="writeDownYourSeed">
                            <Text style={styles.infoTextNormal}> Write down your seed and checksum and </Text>
                            <Text style={styles.infoTextBold}>triple check</Text>
                            <Text style={styles.infoTextNormal}> that they are correct.</Text>
                        </Trans>
                    </Text>
                    <Seedbox
                        backgroundColor={body.bg}
                        borderColor={borderColor}
                        textColor={textColor}
                        seed={seed}
                    />
                    <View style={[styles.checksum, borderColor]}>
                        <Text style={[styles.checksumText, textColor]}>{checksum}</Text>
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onDonePress()}>
                        <View style={[styles.doneButton, { borderColor: positive.color }]}>
                            <Text style={[styles.doneText, { color: positive.color }]}>{t('global:done')}</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.tempAccount.seed,
    body: state.settings.theme.body,
    positive: state.settings.theme.positive,
});

export default translate(['writeSeedDown', 'global'])(connect(mapStateToProps)(WriteSeedDown));
