import React, { Component } from 'react';
import {
    Image,
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Keyboard,
    TouchableWithoutFeedback,
    ActivityIndicator,
} from 'react-native';
import Fonts from '../theme/Fonts';

import { width, height } from '../util/dimensions';

class ManualSync extends React.Component {
    render() {
        const { t } = this.props;

        return (
            <View style={styles.container}>
                <View style={styles.topContainer}>
                    <View style={{ flex: 0.5 }} />
                    {!this.props.isSyncing && (
                        <View style={styles.innerContainer}>
                            <Text style={styles.infoText}>Press the button below to sync your account.</Text>
                            <Text style={styles.infoText}>This may take a while.</Text>
                            <Text style={styles.infoText}>You may notice your device slowing down.</Text>
                            <View style={styles.syncButtonContainer}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.props.onManualSyncPress();
                                    }}
                                >
                                    <View style={styles.syncButton}>
                                        <Text style={styles.syncButtonText}>SYNC ACCOUNT</Text>
                                    </View>
                                </TouchableOpacity>
                            </View>
                        </View>
                    )}
                    {this.props.isSyncing && (
                        <View style={styles.innerContainer}>
                            <Text style={styles.infoText}>Syncing your account.</Text>
                            <Text style={styles.infoText}>This may take a while.</Text>
                            <Text style={styles.infoText}>You may notice your device slowing down.</Text>
                            <ActivityIndicator
                                animating={this.props.syncing}
                                style={styles.activityIndicator}
                                size="large"
                                color="#F7D002"
                            />
                        </View>
                    )}
                </View>
                <View style={styles.bottomContainer}>
                    {!this.props.isSyncing && (
                        <TouchableOpacity onPress={event => this.props.backPress()}>
                            <View style={styles.item}>
                                <Image
                                    source={require('iota-wallet-shared-modules/images/arrow-left.png')}
                                    style={styles.icon}
                                />
                                <Text style={styles.titleText}>Back</Text>
                            </View>
                        </TouchableOpacity>
                    )}
                </View>
            </View>
        );
    }
}

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
        width: width,
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
        width: width / 22,
        height: width / 22,
        marginRight: width / 25,
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
        borderRadius: 8,
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

export default ManualSync;
