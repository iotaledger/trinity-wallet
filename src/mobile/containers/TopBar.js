import map from 'lodash/map';
import filter from 'lodash/filter';
import size from 'lodash/size';
import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { translate } from 'react-i18next';
import { toggleTopBarDisplay } from 'iota-wallet-shared-modules/actions/home';
import { setSeedIndex } from 'iota-wallet-shared-modules/actions/wallet';
import { clearLog } from 'iota-wallet-shared-modules/actions/alerts';
import { getBalanceForSelectedAccount, selectAccountInfo } from 'iota-wallet-shared-modules/selectors/accounts';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    TouchableWithoutFeedback,
    Animated,
} from 'react-native';
import tinycolor from 'tinycolor2';
import { setPollFor } from 'iota-wallet-shared-modules/actions/polling';
import { roundDown } from 'iota-wallet-shared-modules/libs/utils';
import { formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/iota/utils';
import Modal from 'react-native-modal';
import NotificationLogComponent from '../components/NotificationLog';
import { Icon } from '../theme/icons.js';
import { isAndroid } from '../utils/device';
import GENERAL from '../theme/general';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        width,
        elevation: 7,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        flex: 1,
    },
    titleWrapper: {
        alignItems: 'center',
        justifyContent: 'center',
        width,
    },
    mainTitle: {
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: GENERAL.fontSize4,
        paddingBottom: height / 170,
        maxWidth: width / 1.35,
    },
    subtitle: {
        textAlign: 'center',
        fontFamily: 'SourceSansPro-SemiBold',
        fontSize: width / 28,
    },
    childView: {
        height: height / 14,
        width,
        paddingHorizontal: width / 18,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    centralView: {
        alignItems: 'center',
    },
    chevronWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: width / 18,
    },
    notificationContainer: {
        justifyContent: 'center',
        alignItems: 'center',
        marginLeft: width / 18,
    },
    disabled: {
        color: '#a9a9a9',
    },
    disabledImage: {
        color: '#a9a9a9',
    },
    scrollViewContainer: {
        maxHeight: height,
    },
    empty: {
        height: width / 18,
        width: width / 18,
    },
    modal: {
        height,
        width,
        justifyContent: 'center',
        alignItems: 'center',
        margin: 0,
    },
});

class TopBar extends Component {
    static propTypes = {
        balance: PropTypes.number.isRequired,
        accountNames: PropTypes.array.isRequired,
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
        selectedAccount: PropTypes.object.isRequired,
        body: PropTypes.object.isRequired,
        bar: PropTypes.object.isRequired,
        primary: PropTypes.object.isRequired,
        setPollFor: PropTypes.func.isRequired,
        notificationLog: PropTypes.array.isRequired,
        clearLog: PropTypes.func.isRequired,
        topBarHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.object]).isRequired,
        isIOSKeyboardActive: PropTypes.bool.isRequired,
        isTransitioning: PropTypes.bool.isRequired,
        /** Currently selected mode */
        mode: PropTypes.oneOf(['Expert', 'Standard']).isRequired,
        /** Determines if the application is minimised */
        minimised: PropTypes.bool.isRequired,
        /** Determines if there is already a network call going on for fetching latest acocunt info */
        isFetchingLatestAccountInfo: PropTypes.bool.isRequired,
        /** Currently selected home screen route */
        currentRoute: PropTypes.string.isRequired,
    };

    static filterSeedTitles(accountNames, currentSeedIndex) {
        return filter(accountNames, (t, i) => i !== currentSeedIndex);
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

            if (hasAddresses) {
                this.props.setPollFor('accountInfo'); // Override poll queue
            }
        }
    }

    setScrollable(y) {
        if (y >= height - height / 8.8) {
            return this.setState({ scrollable: true });
        }
        this.setState({ scrollable: false });
    }

    shouldDisable() {
        const {
            isGeneratingReceiveAddress,
            isSendingTransfer,
            isSyncing,
            isTransitioning,
            isFetchingLatestAccountInfo,
        } = this.props;
        return (
            isGeneratingReceiveAddress ||
            isSendingTransfer ||
            isSyncing ||
            isTransitioning ||
            isFetchingLatestAccountInfo
        );
    }

    showModal() {
        this.setState({ isModalVisible: true });
    }

    hideModal() {
        this.setState({ isModalVisible: false });
    }

    renderTitles() {
        const {
            isTopBarActive,
            accountNames,
            balance,
            accountInfo,
            seedIndex,
            bar,
            primary,
            topBarHeight,
            isIOSKeyboardActive,
            notificationLog,
            mode,
            minimised,
            currentRoute,
        } = this.props;
        const selectedTitle = get(accountNames, `[${seedIndex}]`) || ''; // fallback
        const selectedSubtitle = TopBar.humanizeBalance(balance);
        const subtitleColor = tinycolor(bar.color).isDark() ? '#262626' : '#d3d3d3';

        /* Hide balance when displaying receive address QR */
        const balanceOpacity = currentRoute === 'receive' ? 0 : 1;

        const getBalance = (currentIdx) => {
            const account = accountInfo[accountNames[currentIdx]];
            return TopBar.humanizeBalance(account.balance);
        };

        const withSubtitles = (title, index) => ({ title, subtitle: getBalance(index), index });
        const titles = map(accountNames, withSubtitles);
        const hasMultipleSeeds = size(TopBar.filterSeedTitles(accountNames, seedIndex));
        const hasNotifications = size(notificationLog) && notificationLog.length > 0;
        const shouldDisable = this.shouldDisable();

        const baseContent = (
            <Animated.View style={[styles.titleWrapper, { height: topBarHeight }]}>
                <TouchableWithoutFeedback
                    onPress={() => {
                        if (!shouldDisable) {
                            if (accountNames.length > 1) {
                                this.props.toggleTopBarDisplay();
                            }
                        }
                    }}
                >
                    {(!isIOSKeyboardActive &&
                        !minimised && (
                            <View
                                style={{
                                    width,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                }}
                            >
                                {hasNotifications && !isIOSKeyboardActive && mode === 'Expert' ? (
                                    <TouchableOpacity
                                        hitSlop={{ left: width / 18, right: width / 18, top: 0, bottom: 0 }}
                                        style={styles.notificationContainer}
                                        onPress={() => this.showModal()}
                                    >
                                        <Animated.View
                                            style={{
                                                height: topBarHeight,
                                                width: width / 18,
                                                justifyContent: 'center',
                                                paddingTop: isAndroid ? 0 : height / 170,
                                            }}
                                        >
                                            <Icon name="notification" size={width / 18} color={bar.color} />
                                        </Animated.View>
                                    </TouchableOpacity>
                                ) : (
                                    <View style={styles.notificationContainer}>
                                        <View style={styles.empty} />
                                    </View>
                                )}
                                <View>
                                    <Text
                                        numberOfLines={1}
                                        style={
                                            shouldDisable
                                                ? StyleSheet.flatten([
                                                      styles.mainTitle,
                                                      styles.disabled,
                                                      { color: bar.color, marginTop: height / 55 },
                                                  ])
                                                : [styles.mainTitle, { color: bar.color, marginTop: height / 55 }]
                                        }
                                    >
                                        {selectedTitle}
                                    </Text>
                                    <View style={{ opacity: balanceOpacity }}>
                                        <Text
                                            style={
                                                shouldDisable
                                                    ? StyleSheet.flatten([
                                                          styles.subtitle,
                                                          styles.disabled,
                                                          { color: subtitleColor },
                                                      ])
                                                    : [styles.subtitle, { color: subtitleColor }]
                                            }
                                        >
                                            {selectedSubtitle}
                                        </Text>
                                    </View>
                                </View>
                                <View style={styles.chevronWrapper}>
                                    {hasMultipleSeeds ? (
                                        <Animated.View
                                            style={{
                                                height: topBarHeight,
                                                justifyContent: 'center',
                                                paddingTop: isAndroid ? 0 : height / 170,
                                            }}
                                        >
                                            <Icon
                                                name={isTopBarActive ? 'chevronUp' : 'chevronDown'}
                                                size={width / 22}
                                                color={bar.color}
                                                style={[shouldDisable ? styles.disabledImage : null]}
                                            />
                                        </Animated.View>
                                    ) : (
                                        <View style={styles.empty} />
                                    )}
                                </View>
                            </View>
                        )) || <View />}
                </TouchableWithoutFeedback>
            </Animated.View>
        );

        if (!isTopBarActive) {
            return baseContent;
        }

        const restContent = map(titles, (t, idx) => {
            const isSelected = idx === seedIndex;
            const isLast = idx === size(titles) - 1;
            const activeHighlight = { borderLeftWidth: parseInt(width / 160), borderColor: primary.color };
            const children = (
                <TouchableOpacity
                    onPress={() => {
                        if (!shouldDisable) {
                            this.props.toggleTopBarDisplay(); // Close
                            this.onChange(t.index);
                        }
                    }}
                    key={idx}
                    style={{ width, alignItems: 'center' }}
                >
                    <View
                        style={[
                            styles.childView,
                            { backgroundColor: isSelected ? bar.alt : bar.bg },
                            isSelected ? activeHighlight : null,
                        ]}
                    >
                        <Text
                            numberOfLines={1}
                            style={
                                shouldDisable
                                    ? StyleSheet.flatten([styles.mainTitle, styles.disabled, { color: bar.color }])
                                    : [styles.mainTitle, { color: bar.color, opacity: idx === seedIndex ? 1 : 0.6 }]
                            }
                        >
                            {t.title}
                        </Text>
                        <Text
                            style={
                                shouldDisable
                                    ? StyleSheet.flatten([styles.subtitle, styles.disabled, { color: subtitleColor }])
                                    : [styles.subtitle, { color: subtitleColor, opacity: idx === seedIndex ? 1 : 0.6 }]
                            }
                        >
                            {t.subtitle}
                        </Text>
                    </View>
                </TouchableOpacity>
            );

            if (isLast) {
                return children;
            }

            return (
                <View key={idx} style={styles.centralView}>
                    {children}
                </View>
            );
        });

        const { scrollable } = this.state;
        return (
            <View style={styles.titleWrapper}>
                {baseContent}
                <ScrollView
                    scrollEnabled={scrollable}
                    showsVerticalScrollIndicator={scrollable}
                    ref={(c) => {
                        this.scrollView = c;
                    }}
                    onContentSizeChange={(x, y) => this.setScrollable(y)}
                    contentContainerView={{ height: height }}
                    style={{ maxHeight: height - height / 8.8 }}
                >
                    {restContent}
                </ScrollView>
            </View>
        );
    }

    render() {
        const { accountNames, body, bar, notificationLog } = this.props;
        const { isModalVisible } = this.state;
        const children = this.renderTitles();
        const shouldDisable = this.shouldDisable();

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (!shouldDisable) {
                        if (accountNames.length > 1) {
                            this.props.toggleTopBarDisplay();
                        }
                        this.hideModal();
                    }
                }}
            >
                <View style={{ flex: 1, position: 'absolute' }}>
                    <View
                        style={[
                            styles.container,
                            {
                                backgroundColor: bar.bg,
                            },
                        ]}
                    >
                        <View scrollEnabled={false} style={styles.scrollViewContainer}>
                            {children}
                        </View>
                        <Modal
                            animationIn={isAndroid ? 'bounceInUp' : 'zoomIn'}
                            animationOut={isAndroid ? 'bounceOut' : 'zoomOut'}
                            animationInTiming={isAndroid ? 1000 : 300}
                            animationOutTiming={200}
                            backdropTransitionInTiming={isAndroid ? 500 : 300}
                            backdropTransitionOutTiming={200}
                            backdropColor={body.bg}
                            style={styles.modal}
                            isVisible={isModalVisible}
                            onBackButtonPress={() => this.hideModal()}
                            onBackdropPress={() => this.hideModal()}
                            hideModalContentWhileAnimating
                            useNativeDriver={isAndroid ? true : false}
                        >
                            <NotificationLogComponent
                                backgroundColor={bar.bg}
                                hideModal={() => this.hideModal()}
                                textColor={{ color: bar.color }}
                                borderColor={{ borderColor: bar.color }}
                                barColor={bar.color}
                                barBg={bar.bg}
                                notificationLog={notificationLog}
                                clearLog={this.props.clearLog}
                            />
                        </Modal>
                    </View>
                    <View style={{ flex: 1 }} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    balance: getBalanceForSelectedAccount(state),
    accountNames: state.accounts.accountNames,
    accountInfo: state.accounts.accountInfo,
    currentSetting: state.wallet.currentSetting,
    seedIndex: state.wallet.seedIndex,
    mode: state.settings.mode,
    isGeneratingReceiveAddress: state.ui.isGeneratingReceiveAddress,
    isSendingTransfer: state.ui.isSendingTransfer,
    isTransitioning: state.ui.isTransitioning,
    isSyncing: state.ui.isSyncing,
    childRoute: state.home.childRoute,
    isTopBarActive: state.home.isTopBarActive,
    selectedAccount: selectAccountInfo(state),
    body: state.settings.theme.body,
    bar: state.settings.theme.bar,
    primary: state.settings.theme.primary,
    notificationLog: state.alerts.notificationLog,
    isFetchingLatestAccountInfo: state.ui.isFetchingLatestAccountInfoOnLogin,
    currentRoute: state.home.childRoute,
});

const mapDispatchToProps = {
    toggleTopBarDisplay,
    setSeedIndex,
    setPollFor,
    clearLog,
};

export default translate('global')(connect(mapStateToProps, mapDispatchToProps)(TopBar));
