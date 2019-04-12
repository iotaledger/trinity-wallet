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
import { toggleModalActivity } from 'shared-modules/actions/ui';
import {
    getBalanceForSelectedAccount,
    getAccountNamesFromState,
    selectAccountInfo,
} from 'shared-modules/selectors/accounts';
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
import { setPollFor } from 'shared-modules/actions/polling';
import { getThemeFromState } from 'shared-modules/selectors/global';
import { roundDown } from 'shared-modules/libs/utils';
import { formatValue, formatUnit } from 'shared-modules/libs/iota/utils';
import { accumulateBalance } from 'shared-modules/libs/iota/addresses';
import { Icon } from 'ui/theme/icons';
import { isAndroid, isIPhoneX } from 'libs/device';
import { Styling } from 'ui/theme/general';
import NotificationButtonComponent from 'ui/components/NotificationButton';

const { height, width } = Dimensions.get('window');

const styles = StyleSheet.create({
    container: {
        width,
        flexDirection: 'row',
        justifyContent: 'flex-start',
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
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingHorizontal: width / 27,
    },
    centralView: {
        alignItems: 'center',
    },
    barWrapper: {
        width,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        height: Styling.topBarHeight - Styling.statusBarHeight,
    },
    balanceWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width - width / 4.5,
    },
    iconWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
        width: width / 9,
        flex: 1,
    },
    disabled: {
        color: '#a9a9a9',
    },
    scrollViewContainer: {
        maxHeight: height,
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
        /** @ignore */
        isModalActive: PropTypes.bool.isRequired,
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
        this.topBarHeight = new Animated.Value(Styling.topBarHeight - Styling.statusBarHeight);
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
        // Minimises topBar if keyboard is open
        if (!this.props.isKeyboardActive && newProps.isKeyboardActive && !this.props.isModalActive) {
            Animated.timing(this.topBarHeight, {
                duration: isAndroid ? 50 : 250,
                toValue: isIPhoneX ? 0 : 20,
            }).start();
        }
        // Maximises topBar if keyboard is closed
        if (this.props.isKeyboardActive && !newProps.isKeyboardActive) {
            Animated.timing(this.topBarHeight, {
                duration: isAndroid ? 50 : 250,
                toValue: Styling.topBarHeight - Styling.statusBarHeight,
            }).start();
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
        const hasAddresses = Object.keys(this.props.selectedAccount.addressData).length > 0;

        // TODO: Not sure why we are checking for address generation on change
        if (!isGeneratingReceiveAddress) {
            this.props.setSeedIndex(newSeedIdx);

            if (hasAddresses) {
                this.props.setPollFor('accountInfo'); // Override poll queue
            }
        }
    }

    /**
     * Makes dropdown scrollable when it exceeds max length
     *
     * @method setScrollable
     * @returns {any}
     */
    setScrollable(y) {
        if (
            y >=
            (isIPhoneX
                ? height - Styling.topBarHeight - Styling.iPhoneXBottomInsetHeight
                : height - Styling.topBarHeight)
        ) {
            return this.setState({ scrollable: true });
        }
        this.setState({ scrollable: false });
    }

    /**
     * Determines when to disable topBar press events
     *
     * @method shouldDisable
     * @returns {boolean}
     */
    shouldDisable() {
        return (
            this.props.isGeneratingReceiveAddress ||
            this.props.isSendingTransfer ||
            this.props.isSyncing ||
            this.props.isTransitioning ||
            this.props.isFetchingLatestAccountInfo ||
            this.props.isModalActive
        );
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
            isKeyboardActive,
            mode,
            minimised,
            currentRoute,
            isModalActive,
        } = this.props;

        const selectedTitle = get(accountNames, `[${seedIndex}]`) || ''; // fallback
        const selectedSubtitle = TopBar.humanizeBalance(balance);
        const subtitleColor = tinycolor(bar.color).isDark() ? '#262626' : '#d3d3d3';

        /* Hide balance when displaying receive address QR */
        const balanceOpacity = currentRoute === 'receive' ? 0 : 1;

        const getBalance = (currentIdx) => {
            const account = accountInfo[accountNames[currentIdx]];

            return TopBar.humanizeBalance(
                accumulateBalance(map(account.addressData, (addressObject) => addressObject.balance)),
            );
        };

        const withSubtitles = (title, index) => ({ title, subtitle: getBalance(index), index });
        const titles = map(accountNames, withSubtitles);
        const hasMultipleSeeds = size(TopBar.filterSeedTitles(accountNames, seedIndex));
        const shouldDisable = this.shouldDisable();

        const baseContent = (
            <Animated.View
                style={[
                    styles.titleWrapper,
                    !isIPhoneX && { marginTop: Styling.statusBarHeight },
                    { height: this.topBarHeight },
                ]}
            >
                <TouchableWithoutFeedback
                    onPress={() => {
                        if (!shouldDisable) {
                            if (accountNames.length > 1 && !isKeyboardActive) {
                                this.props.toggleTopBarDisplay();
                            }
                        }
                    }}
                >
                    {(!isKeyboardActive &&
                        !minimised && (
                            <View style={styles.barWrapper}>
                                <Animated.View style={[styles.iconWrapper, { paddingLeft: width / 18 }]}>
                                    {(!isKeyboardActive && mode === 'Advanced' && <NotificationButtonComponent />) || (
                                        <View />
                                    )}
                                </Animated.View>
                                <Animated.View style={styles.balanceWrapper}>
                                    <Text
                                        numberOfLines={1}
                                        style={[
                                            shouldDisable
                                                ? StyleSheet.flatten([
                                                      styles.mainTitle,
                                                      styles.disabled,
                                                      { color: bar.color },
                                                  ])
                                                : [styles.mainTitle, { color: bar.color }],
                                            isModalActive && { opacity: 0.5 },
                                        ]}
                                    >
                                        {selectedTitle}
                                    </Text>
                                    <View style={{ opacity: balanceOpacity }}>
                                        <Text
                                            style={[
                                                shouldDisable
                                                    ? StyleSheet.flatten([
                                                          styles.subtitle,
                                                          styles.disabled,
                                                          { color: subtitleColor },
                                                      ])
                                                    : [styles.subtitle, { color: subtitleColor }],
                                                isModalActive && { opacity: 0.5 },
                                            ]}
                                        >
                                            {selectedSubtitle}
                                        </Text>
                                    </View>
                                </Animated.View>
                                <Animated.View style={[styles.iconWrapper, { paddingRight: width / 18 }]}>
                                    {(hasMultipleSeeds && (
                                        <Icon
                                            name={isTopBarActive ? 'chevronUp' : 'chevronDown'}
                                            size={width / 22}
                                            color={bar.color}
                                            style={[shouldDisable && styles.disabled && { opacity: 0.5 }]}
                                        />
                                    )) || <View />}
                                </Animated.View>
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
                            isSelected && activeHighlight,
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
                    style={{
                        maxHeight: isIPhoneX
                            ? height - Styling.topBarHeight - Styling.iPhoneXBottomInsetHeight
                            : height - Styling.topBarHeight,
                    }}
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
                                backgroundColor: bar.bg,
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
    theme: getThemeFromState(state),
    isFetchingLatestAccountInfo: state.ui.isFetchingAccountInfo,
    currentRoute: state.home.childRoute,
    isKeyboardActive: state.ui.isKeyboardActive,
    isModalActive: state.ui.isModalActive,
});

const mapDispatchToProps = {
    toggleTopBarDisplay,
    toggleModalActivity,
    setSeedIndex,
    setPollFor,
};

export default withNamespaces('global')(connect(mapStateToProps, mapDispatchToProps)(TopBar));
