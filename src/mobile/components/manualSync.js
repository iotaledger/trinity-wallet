import React from 'react';
import PropTypes from 'prop-types';
import { Image, View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import GENERAL from '../theme/general';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'space-between',
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
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
    },
    syncButtonText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
    infoText: {
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
    <View style={styles.container}>
        <View style={styles.topContainer}>
            <View style={{ flex: 0.8 }} />
            {!props.isSyncing && (
                <View style={styles.innerContainer}>
                    <Text style={[styles.infoText, props.textColor]}>{props.t('manualSync:pressToSync')}</Text>
                    <Text style={[styles.infoText, props.textColor]}>{props.t('manualSync:thisMayTake')}</Text>
                    <Text style={[styles.infoText, props.textColor]}>{props.t('manualSync:youMayNotice')}</Text>
                    <View style={styles.syncButtonContainer}>
                        <TouchableOpacity
                            onPress={() => {
                                props.onManualSyncPress();
                            }}
                        >
                            <View style={[styles.syncButton, props.borderColor]}>
                                <Text style={[styles.syncButtonText, props.textColor]}>
                                    {props.t('manualSync:syncAccount')}
                                </Text>
                            </View>
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            {props.isSyncing && (
                <View style={styles.innerContainer}>
                    <Text style={[styles.infoText, props.textColor]}>{props.t('manualSync:syncingYourAccount')}</Text>
                    <Text style={[styles.infoText, props.textColor]}>{props.t('manualSync:thisMayTake')}</Text>
                    <Text style={[styles.infoText, props.textColor]}>{props.t('manualSync:youMayNotice')}</Text>
                    <ActivityIndicator
                        animating={props.isSyncing}
                        style={styles.activityIndicator}
                        size="large"
                        color={props.negativeColor}
                    />
                </View>
            )}
        </View>
        <View style={styles.bottomContainer}>
            {!props.isSyncing && (
                <TouchableOpacity
                    onPress={() => props.backPress()}
                    hitSlop={{ top: height / 55, bottom: height / 55, left: width / 55, right: width / 55 }}
                >
                    <View style={styles.item}>
                        <Image source={props.arrowLeftImagePath} style={styles.icon} />
                        <Text style={[styles.titleText, props.textColor]}>{props.t('global:backLowercase')}</Text>
                    </View>
                </TouchableOpacity>
            )}
        </View>
    </View>
);

ManualSync.propTypes = {
    isSyncing: PropTypes.bool.isRequired,
    backPress: PropTypes.func.isRequired,
    onManualSyncPress: PropTypes.func.isRequired,
    t: PropTypes.func.isRequired,
    textColor: PropTypes.string.isRequired,
    arrowLeftImagePath: PropTypes.number.isRequired,
    negativeColor: PropTypes.object.isRequired,
    borderColor: PropTypes.object.isRequired,
};

export default ManualSync;
