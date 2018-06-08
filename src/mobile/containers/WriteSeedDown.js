import React, { Component } from 'react';
import { translate, Trans } from 'react-i18next';
import { StyleSheet, View, Text } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { getChecksum } from 'iota-wallet-shared-modules/libs/iota/utils';
import FlagSecure from 'react-native-flag-secure-android';
import SeedPicker from '../components/SeedPicker';
import WithUserActivity from '../components/UserActivity';
import Button from '../components/Button';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';
import DynamicStatusBar from '../components/DynamicStatusBar';
import { Icon } from '../theme/icons.js';
import { isAndroid } from '../utils/device';
import Header from '../components/Header';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
        justifyContent: 'center',
    },
    bottomContainer: {
        flex: 0.5,
        justifyContent: 'flex-end',
    },
    textContainer: {
        width: width / 1.155,
        alignItems: 'center',
    },
    optionButtonText: {
        color: '#8BD4FF',
        fontFamily: 'SourceSansPro-Light',
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
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: GENERAL.fontSize3,
        textAlign: 'center',
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
        fontSize: GENERAL.fontSize2,
        color: 'white',
        fontFamily: 'SourceSansPro-Regular',
    },
});

/** Write Seed Down component */
class WriteSeedDown extends Component {
    static propTypes = {
        /** Navigation object */
        navigator: PropTypes.object.isRequired,
        /** Translation helper
         * @param {string} translationString - locale string identifier to be translated
         */
        t: PropTypes.func.isRequired,
        /** Theme settings */
        theme: PropTypes.object.isRequired,
        /** Seed value */
        seed: PropTypes.string.isRequired,
        /** Determines if the application is minimised */
        minimised: PropTypes.bool.isRequired,
    };

    constructor(props) {
        super(props);
        this.state = {
            currentSeedRow: 0,
        };
    }

    componentDidMount() {
        if (isAndroid) {
            FlagSecure.activate();
        }
    }

    componentWillUnmount() {
        if (isAndroid) {
            FlagSecure.deactivate();
        }
    }

    onDonePress() {
        this.props.navigator.pop({ animated: false });
    }

    render() {
        const { t, theme, seed, minimised } = this.props;
        const checksum = getChecksum(seed);
        const textColor = { color: theme.body.color };
        const borderColor = { borderColor: theme.body.color };

        return (
            <View style={[styles.container, { backgroundColor: theme.body.bg }]}>
                {!minimised && (
                    <View>
                        <DynamicStatusBar backgroundColor={theme.body.bg} />
                        <View style={styles.topContainer}>
                            <Icon name="iota" size={width / 8} color={theme.body.color} />
                            <View style={{ flex: 0.7 }} />
                            <Header textColor={theme.body.color}>{t('manualCopy')}</Header>
                        </View>
                        <View style={styles.midContainer}>
                            <View style={styles.textContainer}>
                                <Text style={[styles.infoText, textColor, { paddingTop: height / 40 }]}>
                                    <Trans i18nKey="writeDownYourSeed">
                                        <Text style={styles.infoTextNormal}>
                                            Write down your seed and checksum and{' '}
                                        </Text>
                                        <Text style={styles.infoTextBold}>triple check</Text>
                                        <Text style={styles.infoTextNormal}> that they are correct.</Text>
                                    </Trans>
                                </Text>
                            </View>
                            <View style={{ flex: 0.5 }} />
                            <SeedPicker
                                seed={seed}
                                theme={theme}
                                onValueChange={(index) => this.setState({ currentSeedRow: index })}
                            />
                            <View style={{ flex: 0.5 }} />
                            <View style={[styles.checksum, borderColor]}>
                                <Text style={[styles.checksumText, textColor]}>{checksum}</Text>
                            </View>
                            <View style={{ flex: 0.2 }} />
                        </View>
                        <View style={styles.bottomContainer}>
                            <Button
                                onPress={() => this.onDonePress()}
                                style={{
                                    wrapper: {
                                        backgroundColor: theme.primary.color,
                                        opacity: this.state.currentSeedRow === 8 ? 1 : 0.2,
                                    },
                                    children: { color: theme.primary.body },
                                }}
                            >
                                {t('global:doneLowercase')}
                            </Button>
                        </View>
                    </View>
                )}
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    seed: state.wallet.seed,
    theme: state.settings.theme,
    minimised: state.ui.minimised,
});

export default WithUserActivity()(translate(['writeSeedDown', 'global'])(connect(mapStateToProps)(WriteSeedDown)));
