import React from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import arrowLeftImagePath from 'iota-wallet-shared-modules/images/arrow-left.png';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';
import { translate } from 'react-i18next';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    textFieldContainer: {
        flex: 1,
        alignItems: 'center',
        paddingTop: height / 10,
    },
    bottomContainer: {
        flex: 1,
        width,
        paddingHorizontal: width / 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    topContainer: {
        flex: 9,
        justifyContent: 'center',
    },
    innerContainer: {
        flex: 4,
        justifyContent: 'center',
    },
    item: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: height / 50,
        justifyContent: 'flex-end',
    },
    icon: {
        width: width / 28,
        height: width / 28,
        marginRight: width / 20,
    },
    titleText: {
        color: 'white',
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
    },
    syncButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    syncButton: {
        borderColor: 'rgba(255, 255, 255, 0.6)',
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    syncButtonText: {
        color: 'white',
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    infoText: {
        color: 'white',
        fontFamily: 'Lato-Light',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        paddingTop: height / 30,
        textAlign: 'center',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 40,
    },
});

const ManualSync = props => (
    (t = props.t),
    (
        <View style={styles.container}>
            <View style={styles.topContainer}>
                <View style={{ flex: 0.5 }} />
                {!props.isSyncing && (
                    <View style={styles.innerContainer}>
                        <Text style={styles.infoText}>{t('pressToSync')}</Text>
                        <Text style={styles.infoText}>{t('thisMayTake')}</Text>
                        <Text style={styles.infoText}>{t('youMayNotice')}</Text>
                        <View style={styles.syncButtonContainer}>
                            <TouchableOpacity
                                onPress={() => {
                                    props.onManualSyncPress();
                                }}
                            >
                                <View style={styles.syncButton}>
                                    <Text style={styles.syncButtonText}>{t('syncAccount')}</Text>
                                </View>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {props.isSyncing && (
                    <View style={styles.innerContainer}>
                        <Text style={styles.infoText}>{t('syncingYourAccount')}</Text>
                        <Text style={styles.infoText}>{t('thisMayTake')}</Text>
                        <Text style={styles.infoText}>{t('youMayNotice')}</Text>
                        <ActivityIndicator
                            animating={props.isSyncing}
                            style={styles.activityIndicator}
                            size="large"
                            color="#F7D002"
                        />
                    </View>
                )}
            </View>
            <View style={styles.bottomContainer}>
                {!props.isSyncing && (
                    <TouchableOpacity onPress={() => props.backPress()}>
                        <View style={styles.item}>
                            <Image source={arrowLeftImagePath} style={styles.icon} />
                            <Text style={styles.titleText}>{t('global:backLowercase')}</Text>
                        </View>
                    </TouchableOpacity>
                )}
            </View>
        </View>
    )
);

ManualSync.propTypes = {
    isSyncing: PropTypes.bool.isRequired,
    backPress: PropTypes.func.isRequired,
    onManualSyncPress: PropTypes.func.isRequired,
};

export default ManualSync;
