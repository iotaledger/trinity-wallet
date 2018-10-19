import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, TouchableOpacity, Text, ListView } from 'react-native';
import { formatTimeAs } from 'shared-modules/libs/date';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { locale, timezone } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const styles = StyleSheet.create({
    modalContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        width,
    },
    modalContent: {
        borderRadius: Styling.borderRadius,
        borderWidth: 2,
        paddingVertical: height / 30,
        paddingHorizontal: width / 30,
        width: Styling.contentWidth,
        alignItems: 'center',
        justifyContent: 'center',
        maxHeight: height / 1.25,
    },
    titleText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize3,
    },
    itemText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize1,
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
    clearButton: {
        borderWidth: 1.5,
        borderRadius: Styling.borderRadius,
        width: width / 2.7,
        height: height / 17,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'transparent',
        marginTop: height / 70,
    },
    clearText: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize1,
        backgroundColor: 'transparent',
    },
});

export class NotificationLogModal extends PureComponent {
    static propTypes = {
        /** Content background color */
        backgroundColor: PropTypes.string.isRequired,
        /** Content border color */
        borderColor: PropTypes.object.isRequired,
        /** Content text color */
        textColor: PropTypes.object.isRequired,
        /** Bar color */
        barColor: PropTypes.string.isRequired,
        /** Hide active modal */
        hideModal: PropTypes.func.isRequired,
        /** @ignore */
        notificationLog: PropTypes.array.isRequired,
        /** @ignore */
        clearLog: PropTypes.func.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    componentDidMount() {
        leaveNavigationBreadcrumb('NotificationLog');
    }

    clearNotificationLog() {
        this.props.hideModal();
        this.props.clearLog();
    }

    render() {
        const { t, backgroundColor, textColor, borderColor, barColor, notificationLog } = this.props;
        const lineBorder = { borderBottomColor: barColor };
        const trimmedLog = notificationLog.reverse().slice(0, 10);

        return (
            <View style={[styles.modalContent, { backgroundColor }, borderColor]}>
                <Text style={[styles.titleText, textColor]}>{t('notificationLog:errorLog')}</Text>
                <View style={[styles.line, lineBorder]} />
                <ListView
                    dataSource={ds.cloneWithRows(trimmedLog)}
                    renderRow={(dataSource) => (
                        <View>
                            <Text style={[styles.itemText, textColor]}>
                                {formatTimeAs.hoursMinutesSecondsDayMonthYear(locale, timezone, dataSource.time)} -{' '}
                                {dataSource.error}
                            </Text>
                        </View>
                    )}
                    scrollEnabled
                    renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                    enableEmptySections
                />
                <TouchableOpacity onPress={() => this.clearNotificationLog()}>
                    <View style={[styles.clearButton, borderColor]}>
                        <Text style={[styles.clearText, textColor]}>{t('clear').toUpperCase()}</Text>
                    </View>
                </TouchableOpacity>
            </View>
        );
    }
}

export default withNamespaces(['global, notificationLog'])(NotificationLogModal);
