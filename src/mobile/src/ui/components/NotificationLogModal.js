import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text, ListView } from 'react-native';
import { formatTimeAs } from 'shared-modules/libs/date';
import { withNamespaces } from 'react-i18next';
import { width, height } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { locale, timezone } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import DualFooterButtons from './DualFooterButtons';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

const styles = StyleSheet.create({
    modalContainer: {
        alignItems: 'center',
        justifyContent: 'flex-end',
        width,
        height,
    },
    modalContent: {
        borderRadius: Styling.borderRadius,
        alignItems: 'center',
        justifyContent: 'space-between',
        height: height - Styling.topbarHeight,
        width,
    },
    textContainer: {
        width: width - width / 10,
        alignItems: 'center',
    },
    titleText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize4,
    },
    itemText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Regular',
        fontSize: Styling.fontSize1,
    },
    line: {
        borderBottomWidth: height / 1000,
        width: width - width / 10,
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
        /** @ignore */
        theme: PropTypes.object.isRequired,
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
        const { t, notificationLog, theme: { body } } = this.props;
        const lineBorder = { borderBottomColor: body.color };
        const trimmedLog = notificationLog.reverse().slice(0, 10);
        const textColor = { color: body.color };

        return (
            <View style={styles.modalContainer}>
                <View style={[styles.modalContent, { backgroundColor: body.bg }]}>
                    <View style={{ flex: 1 }} />
                    <View style={styles.textContainer}>
                        <Text style={[styles.titleText, textColor]}>{t('notificationLog:errorLog')}</Text>
                        <View style={[styles.line, lineBorder]} />
                        <ListView
                            dataSource={ds.cloneWithRows(trimmedLog)}
                            renderRow={(dataSource) => (
                                <View>
                                    <Text style={[styles.itemText, textColor]}>
                                        {formatTimeAs.hoursMinutesSecondsDayMonthYear(
                                            locale,
                                            timezone,
                                            dataSource.time,
                                        )}{' '}
                                        - {dataSource.error}
                                    </Text>
                                </View>
                            )}
                            scrollEnabled
                            renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                            enableEmptySections
                        />
                    </View>
                    <View style={{ flex: 2 }} />
                    <DualFooterButtons
                        onLeftButtonPress={() => this.clearNotificationLog()}
                        onRightButtonPress={() => this.props.hideModal()}
                        leftButtonText={t('clear').toUpperCase()}
                        rightButtonText={t('done').toUpperCase()}
                    />
                </View>
            </View>
        );
    }
}

export default withNamespaces(['global, notificationLog'])(NotificationLogModal);
