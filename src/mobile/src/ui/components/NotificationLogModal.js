import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { View, StyleSheet, Text, ListView } from 'react-native';
import { formatTimeAs } from 'shared-modules/libs/date';
import { withNamespaces } from 'react-i18next';
import { height, width } from 'libs/dimensions';
import { Styling } from 'ui/theme/general';
import { locale, timezone } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import ModalView from './ModalView';

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });
const maxScrollViewHeight = height / 2;

const styles = StyleSheet.create({
    titleText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize6,
        textAlign: 'center',
        paddingBottom: height / 20,
    },
    timeText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Bold',
        fontSize: Styling.fontSize3,
        textAlign: 'center',
        width: width / 1.2,
        paddingBottom: height / 60,
    },
    errorText: {
        backgroundColor: 'transparent',
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize3,
        width: Styling.contentWidth,
        textAlign: 'center',
    },
    separator: {
        height: height / 40,
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
        /** Deteremines whether to display the topBar */
        displayTopBar: PropTypes.bool,
    };

    static defaultProps = {
        displayTopBar: true,
    };

    constructor() {
        super();
        this.state = {
            scrollable: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('NotificationLog');
    }

    setScrollable(y) {
        if (y >= maxScrollViewHeight) {
            return this.setState({ scrollable: true });
        }
        this.setState({ scrollable: false });
    }

    clearNotificationLog() {
        this.props.hideModal();
        this.props.clearLog();
    }

    render() {
        const { t, notificationLog, theme: { body } } = this.props;
        const trimmedLog = notificationLog.reverse().slice(0, 10);
        const textColor = { color: body.color };

        return (
            <ModalView
                displayTopBar={this.props.displayTopBar}
                dualButtons
                onLeftButtonPress={() => this.clearNotificationLog()}
                onRightButtonPress={() => this.props.hideModal()}
                leftButtonText={t('clear')}
                rightButtonText={t('done')}
            >
                <View style={{ flex: 2 }} />
                <Text style={[styles.titleText, textColor]}>{t('notificationLog:errorLog')}</Text>
                <ListView
                    dataSource={ds.cloneWithRows(trimmedLog.reverse())}
                    renderRow={(dataSource) => (
                        <View style={{ alignItems: 'center' }}>
                            <Text style={[styles.timeText, textColor]}>
                                {formatTimeAs.hoursMinutesSecondsDayMonthYear(locale, timezone, dataSource.time)}
                            </Text>
                            <Text style={[styles.errorText, textColor]}>{dataSource.error}</Text>
                        </View>
                    )}
                    scrollEnabled={this.state.scrollable}
                    renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                    enableEmptySections
                    style={{
                        maxHeight: maxScrollViewHeight,
                        width: Styling.contentWidth,
                    }}
                    onContentSizeChange={(x, y) => this.setScrollable(y)}
                />
                <View style={{ flex: 2 }} />
            </ModalView>
        );
    }
}

export default withNamespaces(['global, notificationLog'])(NotificationLogModal);
