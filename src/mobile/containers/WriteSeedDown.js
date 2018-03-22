import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { MAX_SEED_LENGTH } from 'iota-wallet-shared-modules/libs/util';
import { getChecksum } from 'iota-wallet-shared-modules/libs/iota/utils';
import Seedbox from '../components/SeedBox';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { Icon } from '../theme/icons.js';
import InfoBox from '../components/infoBox';

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
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 27.6,
        textAlign: 'justify',
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
        borderWidth: 1,
        justifyContent: 'center',
        alignItems: 'center',
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
        primary: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        seed: PropTypes.string.isRequired,
    };

    onDonePress() {
        this.props.navigator.pop({
            animated: false,
        });
    }

    render() {
        const { t, primary, body, seed } = this.props;
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
                    <View style={{ flex: 1 }} />
                    <InfoBox
                        body={body}
                        text={
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
                        }
                    />
                    <View style={{ flex: 0.5 }} />
                    <Seedbox bodyColor={body.color} borderColor={borderColor} textColor={textColor} seed={seed} />
                    <View style={{ flex: 0.5 }} />
                    <View style={[styles.checksum, borderColor]}>
                        <Text style={[styles.checksumText, textColor]}>{checksum}</Text>
                    </View>
                    <View style={{ flex: 1 }} />
                </View>
                <View style={styles.bottomContainer}>
                    <TouchableOpacity onPress={() => this.onDonePress()}>
                        <View style={[styles.doneButton, { borderColor: primary.color }]}>
                            <Text style={[styles.doneText, { color: primary.color }]}>{t('global:done')}</Text>
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
    primary: state.settings.theme.primary,
});

export default translate(['writeSeedDown', 'global'])(connect(mapStateToProps)(WriteSeedDown));
