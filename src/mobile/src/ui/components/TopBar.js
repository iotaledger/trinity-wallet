import map from 'lodash/map';
import filter from 'lodash/filter';
import size from 'lodash/size';
import get from 'lodash/get';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { withNamespaces } from 'react-i18next';
import { toggleTopBarDisplay } from 'shared-modules/actions/home';
import { setSeedIndex } from 'shared-modules/actions/wallet';
import { clearLog } from 'shared-modules/actions/alerts';
import { toggleModalActivity } from 'shared-modules/actions/ui';
import {
    getBalanceForSelectedAccount,
    getAccountNamesFromState,
    selectAccountInfo,
} from 'shared-modules/selectors/accounts';
import {
    StatusBar,
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
import { setPollFor } from 'shared-modules/actions/polling';
import { roundDown } from 'shared-modules/libs/utils';
import { formatValue, formatUnit } from 'shared-modules/libs/iota/utils';
import { Icon } from 'ui/theme/icons';
import { isAndroid, isIPhoneX } from 'libs/device';
import { Styling } from 'ui/theme/general';

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
        fontSize: Styling.fontSize4,
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
});

class TopBar extends Component {
    static propTypes = {
        /** Balance for selected account */
        balance: PropTypes.number.isRequired,
        /** @ignore */
        accountNames: PropTypes.array.isRequired,
        /** @ignore */
        accountInfo: PropTypes.object.isRequired,
        /** @ignore */
        seedIndex: PropTypes.number.isRequired,
        /** @ignore */
        currentSetting: PropTypes.string.isRequired,
        /** @ignore */
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        /** @ignore */
        isSendingTransfer: PropTypes.bool.isRequired,
        /** @ignore */
        isSyncing: PropTypes.bool.isRequired,
        /** @ignore */
        childRoute: PropTypes.string.isRequired,
        /** @ignore */
        isTopBarActive: PropTypes.bool.isRequired,
        /** @ignore */
        toggleTopBarDisplay: PropTypes.func.isRequired,
        /** @ignore */
        setSeedIndex: PropTypes.func.isRequired,
        /** Selected account information */
        selectedAccount: PropTypes.object.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        setPollFor: PropTypes.func.isRequired,
        /** @ignore */
        notificationLog: PropTypes.array.isRequired,
        /** @ignore */
        clearLog: PropTypes.func.isRequired,
        /** Top bar height */
        topBarHeight: PropTypes.oneOfType([PropTypes.number, PropTypes.object]),
        /** Determines if on screen keyboard is active */
        isKeyboardActive: PropTypes.bool.isRequired,
        /** @ignore */
        isTransitioning: PropTypes.bool.isRequired,
        /** @ignore */
        mode: PropTypes.oneOf(['Advanced', 'Standard']).isRequired,
        /** @ignore */
        minimised: PropTypes.bool.isRequired,
        /** @ignore */
        isFetchingLatestAccountInfo: PropTypes.bool.isRequired,
        /** @ignore */
        currentRoute: PropTypes.string.isRequired,
        /** @ignore */
        toggleModalActivity: PropTypes.func.isRequired,
    };

    static filterSeedTitles(accountNames, currentSeedIndex) {
        return filter(accountNames, (t, i) => i !== currentSeedIndex);
    }

    /**
     * Formats balance for selected account
     *
     * @method humanizeBalance
     * @param {number} balance
     * @returns {string}
     */
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
            scrollable: false,
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

    /**
     * Sets account info as the next item to poll for
     *
     * @method onChange
     * @param {number} newSeedIdx
     */
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

    /**
     * Determines when to disable topbar press events
     *
     * @method shouldDisable
     * @returns {boolean}
     */
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
        const { isTransitioning, theme: { bar }, notificationLog } = this.props;
        if (!isTransitioning) {
            this.props.toggleModalActivity('notificationLog', {
                backgroundColor: bar.bg,
                hideModal: () => this.hideModal(),
                textColor: { color: bar.color },
                borderColor: { borderColor: bar.color },
                barColor: bar.color,
                notificationLog,
                clearLog: this.props.clearLog,
            });
        }
    }

    hideModal() {
        this.props.toggleModalActivity();
    }

    renderTitles() {
        const {
            isTopBarActive,
            accountNames,
            balance,
            accountInfo,
            seedIndex,
            theme: { bar, primary },
            topBarHeight,
            isKeyboardActive,
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
                    {(!isKeyboardActive &&
                        !minimised && (
                            <View
                                style={{
                                    width,
                                    flexDirection: 'row',
                                    alignItems: 'center',
                                    justifyContent: 'space-between',
                                    marginTop: isAndroid ? StatusBar.currentHeight : 0,
                                    paddingBottom: isAndroid ? height / 60 : 0,
                                }}
                            >
                                {hasNotifications && !isKeyboardActive && mode === 'Advanced' ? (
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
                                        style={[
                                            isAndroid ? null : { marginTop: height / 55 },
                                            shouldDisable
                                                ? StyleSheet.flatten([
                                                      styles.mainTitle,
                                                      styles.disabled,
                                                      { color: bar.color },
                                                  ])
                                                : [
                                                      styles.mainTitle,
                                                      { color: bar.color },
                                                      isAndroid ? null : { marginTop: height / 55 },
                                                  ],
                                        ]}
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
                            { backgroundColor: isSelected ? bar.hover : bar.bg },
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
                    style={{ maxHeight: isIPhoneX ? height - height / 8.8 - 34 : height - height / 8.8 }}
                >
                    {restContent}
                </ScrollView>
            </View>
        );
    }

    render() {
        const { accountNames, theme: { bar } } = this.props;
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
                                backgroundColor: bar.alt,
                            },
                        ]}
                    >
                        <View scrollEnabled={false} style={styles.scrollViewContainer}>
                            {children}
                        </View>
                    </View>
                    <View style={{ flex: 1 }} />
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const mapStateToProps = (state) => ({
    balance: getBalanceForSelectedAccount(state),
    accountNames: getAccountNamesFromState(state),
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
    theme: state.settings.theme,
    notificationLog: state.alerts.notificationLog,
    isFetchingLatestAccountInfo: state.ui.isFetchingAccountInfo,
    currentRoute: state.home.childRoute,
});

const mapDispatchToProps = {
    toggleTopBarDisplay,
    toggleModalActivity,
    setSeedIndex,
    setPollFor,
    clearLog,
};

export default withNamespaces('global')(connect(mapStateToProps, mapDispatchToProps)(TopBar));
