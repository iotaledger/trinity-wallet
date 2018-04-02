import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Text, ListView } from 'react-native';
import { formatTimeAs } from 'iota-wallet-shared-modules/libs/date';
import { width, height } from '../utils/dimensions';
import GENERAL from '../theme/general';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    modalContent: {
        borderRadius: GENERAL.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 30,
        paddingHorizontal: width / 30,
        width: width / 1.15,
        alignItems: 'center',
        justifyContent: 'center',
        maxHeight: height / 1.05,
    },
    titleText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 25.9,
    },
    itemText: {
        backgroundColor: 'transparent',
        fontFamily: 'Lato-Regular',
        fontSize: width / 34.5,
    },
    line: {
        borderBottomWidth: height / 1000,
        width: width / 1.3,
        marginVertical: height / 30,
    },
    separator: {
        flex: 1,
        height: height / 60,
    },
    listView: {
        maxHeight: height / 1.1,
    },
    clearButton: {
        borderWidth: 1.5,
        borderRadius: GENERAL.borderRadius,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginTop: height / 70,
    },
    clearText: {
        fontFamily: 'Lato-Bold',
        fontSize: width / 34.5,
        backgroundColor: 'transparent',
    },
});

class NotificationLog extends PureComponent {
    static propTypes = {
        /** Content background color */
        backgroundColor: PropTypes.string.isRequired,
        /** Content border color */
        borderColor: PropTypes.object.isRequired,
        /** Content text color */
        textColor: PropTypes.object.isRequired,
        /** Content border bottom color */
        barColor: PropTypes.string.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** List of notifications */
        notificationLog: PropTypes.array.isRequired,
        /** Clears all notifications */
        clearLog: PropTypes.func.isRequired,
    };

    clearNotificationLog() {
        this.props.hideModal();
        this.props.clearLog();
    }

    render() {
        const { backgroundColor, textColor, borderColor, barColor, notificationLog, hideModal } = this.props;
        const lineBorder = { borderBottomColor: barColor };
        const trimmedLog = notificationLog.reverse().slice(0, 10);

        return (
            <TouchableOpacity style={styles.modalContainer} onPress={() => hideModal()}>
                <View style={[styles.modalContent, { backgroundColor }, borderColor]}>
                    <Text style={[styles.titleText, textColor]}>ERROR LOG</Text>
                    <View style={[styles.line, lineBorder]} />
                    <ListView
                        dataSource={ds.cloneWithRows(trimmedLog)}
                        renderRow={(dataSource) => (
                            <View>
                                <Text style={[styles.itemText, textColor]}>
                                    {formatTimeAs.hoursMinutesSecondsDayMonthYear(dataSource.time)} - {dataSource.error}
                                </Text>
                            </View>
                        )}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                        enableEmptySections
                    />
                    <TouchableOpacity onPress={() => this.clearNotificationLog()}>
                        <View style={[styles.clearButton, borderColor]}>
                            <Text style={[styles.clearText, textColor]}>CLEAR</Text>
                        </View>
                    </TouchableOpacity>
                </View>
            </TouchableOpacity>
        );
    }
}

export default NotificationLog;
