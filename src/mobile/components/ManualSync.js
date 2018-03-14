import React from 'react';
import PropTypes from 'prop-types';
import { View, Text, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { width, height } from '../utils/dimensions';
import { Icon } from '../theme/icons.js';
import CtaButton from '../components/CtaButton';
import InfoBox from '../components/InfoBox';

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
        justifyContent: 'flex-end',
    },
    titleText: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 23,
        backgroundColor: 'transparent',
        marginLeft: width / 20,
    },
    syncButtonContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    infoText: {
        fontFamily: 'Lato-Light',
        fontSize: width / 27.6,
        textAlign: 'justify',
        backgroundColor: 'transparent',
    },
    activityIndicator: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: height / 40,
    },
});

const ManualSync = (props) => (
    <View style={styles.container}>
        <View style={styles.topContainer}>
            <View style={{ flex: 0.8 }} />
            {!props.isSyncing && (
                <View style={styles.innerContainer}>
                    <InfoBox
                        body={props.body}
                        text={
                            <View>
                                <Text style={[styles.infoText, props.textColor]}>
                                    {props.t('manualSync:outOfSync')}
                                </Text>
                                <Text style={[styles.infoText, props.textColor, { paddingTop: height / 50 }]}>
                                    {props.t('manualSync:pressToSync')}
                                </Text>
                            </View>
                        }
                    />
                    <View style={styles.syncButtonContainer}>
                        <CtaButton
                            ctaColor={props.primary.color}
                            secondaryCtaColor={props.primary.body}
                            text={props.t('manualSync:syncAccount')}
                            onPress={() => props.onManualSyncPress()}
                            ctaWidth={width / 2}
                            ctaHeight={height / 16}
                        />
                    </View>
                </View>
            )}
            {props.isSyncing && (
                <View style={styles.innerContainer}>
                    <InfoBox
                        body={props.body}
                        text={
                            <View>
                                <Text style={[styles.infoText, props.textColor]}>
                                    {props.t('manualSync:syncingYourAccount')}
                                </Text>
                                <Text style={[styles.infoText, props.textColor, { paddingTop: height / 50 }]}>
                                    {props.t('manualSync:thisMayTake')}
                                </Text>
                                <Text style={[styles.infoText, props.textColor, { paddingTop: height / 50 }]}>
                                    {props.t('manualSync:doNotClose')}
                                </Text>
                            </View>
                        }
                    />
                    <ActivityIndicator
                        animating={props.isSyncing}
                        style={styles.activityIndicator}
                        size="large"
                        color={props.negative.color}
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
                        <Icon name="chevronLeft" size={width / 28} color={props.body.color} />
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
    textColor: PropTypes.object.isRequired,
    negative: PropTypes.object.isRequired,
    primary: PropTypes.object.isRequired,
    body: PropTypes.object.isRequired,
};

export default ManualSync;
