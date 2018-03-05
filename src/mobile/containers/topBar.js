import map from 'lodash/map';
import filter from 'lodash/filter';
import size from 'lodash/size';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';
import { setSeedIndex, setReceiveAddress } from 'iota-wallet-shared-modules/actions/tempAccount';
import { clearLog } from 'iota-wallet-shared-modules/actions/alerts';
import {
    getBalanceForSelectedAccountViaSeedIndex,
    getSelectedAccountViaSeedIndex,
} from 'iota-wallet-shared-modules/selectors/account';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native';
import tinycolor from 'tinycolor2';
import { setPollFor } from 'iota-wallet-shared-modules/actions/polling';
import { roundDown, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import Modal from 'react-native-modal';
import NotificationLog from '../components/notificationLog';
import { Icon } from '../theme/icons.js';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width,
        elevation: 7,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 25,
        paddingBottom: height / 50,
        opacity: 0.98,
        flex: 1,
    },
    titleWrapper: {
        paddingHorizontal: width / 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainTitle: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 24.4,
        paddingBottom: height / 170,
        paddingHorizontal: width / 9,
    },
    subtitle: {
        textAlign: 'center',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        paddingHorizontal: width / 9,
    },
    centralView: {
        alignItems: 'center',
    },
    chevronWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 120,
        paddingRight: width / 18,
    },
    notificationContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        paddingLeft: width / 18,
        paddingTop: height / 120,
    },
    disabled: {
        color: '#a9a9a9',
    },
    disabledImage: {
        tintColor: '#a9a9a9',
    },
    separator: {
        width: width / 2,
        marginVertical: height / 60,
        height: 1,
        borderBottomWidth: height / 3000,
    },
    topSeparator: {
        width,
        marginVertical: height / 60,
        height: 1,
        borderBottomWidth: height / 3000,
    },
    scrollViewContainer: {
        maxHeight: height,
    },
    emptyNotification: {
        height: width / 17,
        width: width / 17,
    },
});

class TopBar extends Component {
    static propTypes = {
        balance: PropTypes.number.isRequired,
        seedNames: PropTypes.array.isRequired,
        accountInfo: PropTypes.object.isRequired,
        seedIndex: PropTypes.number.isRequired,
        currentSetting: PropTypes.string.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        childRoute: PropTypes.string.isRequired,
        isTopBarActive: PropTypes.bool.isRequired,
        toggleTopBarDisplay: PropTypes.func.isRequired,
        setSeedIndex: PropTypes.func.isRequired,
        setReceiveAddress: PropTypes.func.isRequired,
        selectedAccount: PropTypes.object.isRequired,
        bar: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        setPollFor: PropTypes.func.isRequired,
        notificationLog: PropTypes.array.isRequired,
        clearLog: PropTypes.func.isRequired,
    };

    static filterSeedTitles(seedNames, currentSeedIndex) {
        return filter(seedNames, (t, i) => i !== currentSeedIndex);
    }

    static humanizeBalance(balance) {
        const decimalPlaces = (n) => {
            const s = ` +${n}`;
            const match = /(?:\.(\d+))?(?:[eE]([+-]?\d+))?$/.exec(s);
            if (!match) {
                return 0;
            }

            return Math.max(0, (match[1] === '0' ? 0 : (match[1] || '').length) - (match[2] || 0));
        };

        const formatted = formatValue(balance);
        const former = roundDown(formatted, 1);
        const latter = balance < 1000 || decimalPlaces(formatted) <= 1 ? '' : '+';

        return `${former + latter} ${formatUnit(balance)}`;
    }

    constructor() {
        super();
        this.state = {
            isModalVisible: false,
        };
    }

    componentDidMount() {
        if (this.props.isTopBarActive) {
            this.props.toggleTopBarDisplay(); // Close dropdown in case its opened
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.childRoute !== newProps.childRoute) {
            // Detects if navigating across screens
            if (this.props.isTopBarActive) {
                // In case the dropdown is active
                this.props.toggleTopBarDisplay();
            }
        }

        if (this.props.currentSetting !== newProps.currentSetting) {
            // Detects if navigating across screens
            if (this.props.isTopBarActive) {
                // In case the dropdown is active
                this.props.toggleTopBarDisplay();
            }
        }
    }

    onChange(newSeedIdx) {
        const { isGeneratingReceiveAddress } = this.props;
        const hasAddresses = Object.keys(this.props.selectedAccount.addresses).length > 0;

        // TODO: Not sure why we are checking for address generation on change
        if (!isGeneratingReceiveAddress) {
            this.props.setSeedIndex(newSeedIdx);
            this.props.setReceiveAddress(' ');

            if (hasAddresses) {
                this.props.setPollFor('accountInfo'); // Override poll queue
            }
        }
    }

    shouldDisable() {
        return this.props.isGeneratingReceiveAddress || this.props.isSendingTransfer || this.props.isSyncing;
    }

    hideModal() {
        this.setState({ isModalVisible: false });
    }

    renderTitles() {
        const { isTopBarActive, seedNames, balance, accountInfo, seedIndex, bar, body } = this.props;
        const borderBottomColor = { borderBottomColor: bar.color };
        const selectedTitle = get(seedNames, `[${seedIndex}]`) || ''; // fallback
        const selectedSubtitle = TopBar.humanizeBalance(balance);
        const subtitleColor = tinycolor(bar.color).isDark() ? '#262626' : '#d3d3d3';

        const getBalance = (currentIdx) => {
            const seedStrings = Object.keys(accountInfo);
            const data = accountInfo[seedStrings[currentIdx]].addresses;
            const balances = Object.values(data).map((x) => x.balance);

            if (isEmpty(data)) {
                return TopBar.humanizeBalance(0); // no addresses
            }

            const calc = (res, value) => {
                const result = res + value;
                return result;
            };

            const bal = reduce(balances, calc, 0);
            return TopBar.humanizeBalance(bal);
        };

        const withSubtitles = (title, index) => ({ title, subtitle: getBalance(index), index });
        const titles = map(seedNames, withSubtitles);
        const disableWhen = this.shouldDisable();

        const baseContent = (
            <View style={styles.titleWrapper}>
                <TouchableWithoutFeedback
                    onPress={() => {
                        if (!disableWhen) {
                            this.props.toggleTopBarDisplay();
                        }
                    }}
                >
                    <View>
                        <Text
                            numberOfLines={1}
                            style={
                                disableWhen
                                    ? StyleSheet.flatten([styles.mainTitle, styles.disabled, { color: body.color }])
                                    : [styles.mainTitle, { color: body.color }]
                            }
                        >
                            {selectedTitle}
                        </Text>
                        <Text
                            style={
                                disableWhen
                                    ? StyleSheet.flatten([styles.subtitle, styles.disabled, { color: subtitleColor }])
                                    : [styles.subtitle, { color: subtitleColor }]
                            }
                        >
                            {selectedSubtitle}
                        </Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );

        if (!isTopBarActive) {
            return baseContent;
        }

        const withoutSelectedTitle = TopBar.filterSeedTitles(titles, seedIndex);
        const restContent = map(withoutSelectedTitle, (t, idx) => {
            const isLast = idx === size(withoutSelectedTitle) - 1;
            const children = (
                <TouchableOpacity
                    onPress={() => {
                        if (!disableWhen) {
                            this.props.toggleTopBarDisplay(); // Close
                            this.onChange(t.index);
                        }
                    }}
                    key={idx}
                    style={{ width, alignItems: 'center' }}
                >
                    <Text
                        numberOfLines={1}
                        style={
                            disableWhen
                                ? StyleSheet.flatten([styles.mainTitle, styles.disabled, { color: body.color }])
                                : [styles.mainTitle, { color: body.color }]
                        }
                    >
                        {t.title}
                    </Text>
                    <Text
                        style={
                            disableWhen
                                ? StyleSheet.flatten([styles.subtitle, styles.disabled, { color: subtitleColor }])
                                : [styles.subtitle, { color: subtitleColor }]
                        }
                    >
                        {t.subtitle}
                    </Text>
                </TouchableOpacity>
            );

            if (isLast) {
                return children;
            }

            return (
                <View key={idx} style={styles.centralView}>
                    {children}
                    <View style={[styles.separator, borderBottomColor]} />
                </View>
            );
        });

        return (
            <View style={styles.titleWrapper}>
                {baseContent}
                {size(withoutSelectedTitle) ? <View style={[styles.topSeparator, borderBottomColor]} /> : null}
                {restContent}
            </View>
        );
    }

    render() {
        const { seedIndex, seedNames, isTopBarActive, bar, body, notificationLog } = this.props;

        const children = this.renderTitles();
        const hasMultipleSeeds = size(TopBar.filterSeedTitles(seedNames, seedIndex));
        const shouldDisable = this.shouldDisable();
        const hasNotifications = notificationLog.length > 0;

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (!shouldDisable) {
                        this.props.toggleTopBarDisplay();
                        this.setState({ isModalVisible: false });
                    }
                }}
            >
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: bar.bg,
                        },
                    ]}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        {hasNotifications ? (
                            <TouchableOpacity
                                style={styles.notificationContainer}
                                onPress={() => this.setState({ isModalVisible: true })}
                            >
                                <Icon name="eye" size={width / 17} color={body.color} />
                            </TouchableOpacity>
                        ) : (
                            <View style={styles.notificationContainer}>
                                <View style={styles.emptyNotification} />
                            </View>
                        )}
                        <ScrollView style={styles.scrollViewContainer}>{children}</ScrollView>
                        <View style={styles.chevronWrapper}>
                            {hasMultipleSeeds ? (
                                <Icon
                                    name={isTopBarActive ? 'chevronUp' : 'chevronDown'}
                                    size={width / 17}
                                    color={body.color}
                                    style={
                                        shouldDisable
                                            ? StyleSheet.flatten([styles.chevron, styles.disabledImage])
                                            : styles.chevron
                                    }
                                />
                            ) : (
                                <View style={styles.chevron} />
                            )}
                        </View>
                    </View>
                    <Modal
                        animationIn="bounceInUp"
                        animationOut="bounceOut"
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor={body.bg}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={this.state.isModalVisible}
                        onBackButtonPress={() => this.hideModal()}
                        onBackdropPress={() => this.hideModal()}
                        useNativeDriver
                        hideModalContentWhileAnimating
                    >
                        <NotificationLog
                            backgroundColor={bar.bg}
                            hideModal={() => this.hideModal()}
                            textColor={{ color: bar.color }}
                            borderColor={{ borderColor: bar.color }}
                            secondaryBarColor={bar.color}
                            notificationLog={notificationLog}
                            clearLog={this.props.clearLog}
                        />
                    </Modal>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    balance: getBalanceForSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    seedNames: state.account.seedNames,
    accountInfo: state.account.accountInfo,
    currentSetting: state.tempAccount.currentSetting,
    seedIndex: state.tempAccount.seedIndex,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isSyncing: state.tempAccount.isSyncing,
    childRoute: state.home.childRoute,
    isTopBarActive: state.home.isTopBarActive,
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    bar: state.settings.theme.bar,
    body: state.settings.theme.body,
    notificationLog: state.alerts.notificationLog,
});

const mapDispatchToProps = {
    toggleTopBarDisplay,
    setSeedIndex,
    setReceiveAddress,
    setPollFor,
    clearLog,
};

export default translate('global')(connect(mapStateToProps, mapDispatchToProps)(TopBar));
