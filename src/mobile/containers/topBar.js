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
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    TouchableWithoutFeedback,
} from 'react-native';
import { setPollFor } from 'iota-wallet-shared-modules/actions/polling';
import { roundDown, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import Modal from 'react-native-modal';
import blackChevronUpImagePath from 'iota-wallet-shared-modules/images/chevron-up-black.png';
import blackChevronDownImagePath from 'iota-wallet-shared-modules/images/chevron-down-black.png';
import whiteChevronUpImagePath from 'iota-wallet-shared-modules/images/chevron-up-white.png';
import whiteChevronDownImagePath from 'iota-wallet-shared-modules/images/chevron-down-white.png';
import whiteNotificationImagePath from 'iota-wallet-shared-modules/images/notification-white.png';
import blackNotificationImagePath from 'iota-wallet-shared-modules/images/notification-black.png';
import NotificationLog from '../components/notificationLog';

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
    chevron: {
        height: width / 17,
        width: width / 17,
    },
    notification: {
        height: width / 17,
        width: width / 17,
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
        barColor: PropTypes.string.isRequired,
        setPollFor: PropTypes.func.isRequired,
        secondaryBarColor: PropTypes.string.isRequired,
        notificationLog: PropTypes.array.isRequired,
        clearLog: PropTypes.func.isRequired,
        backgroundColor: PropTypes.string.isRequired,
    };

    static getIconPath(isActive, chevronUpImagePath, chevronDownImagePath) {
        if (isActive) {
            return {
                source: chevronDownImagePath,
            };
        }

        return {
            source: chevronUpImagePath,
        };
    }

    static filterSeedTitles(seedNames, currentSeedIndex) {
        return filter(seedNames, (t, i) => i !== currentSeedIndex);
    }

    static humanizeBalance(balance) {
        const decimalPlaces = (n) => {
            const s = ` ${+n}`;
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
        const { isTopBarActive, seedNames, balance, accountInfo, seedIndex, secondaryBarColor } = this.props;
        const borderBottomColor = { borderBottomColor: secondaryBarColor };
        const selectedTitle = get(seedNames, `[${seedIndex}]`) || ''; // fallback
        const selectedSubtitle = TopBar.humanizeBalance(balance);
        const subtitleColor = secondaryBarColor === 'white' ? '#d3d3d3' : '#262626';

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
                                    ? StyleSheet.flatten([
                                          styles.mainTitle,
                                          styles.disabled,
                                          { color: secondaryBarColor },
                                      ])
                                    : [styles.mainTitle, { color: secondaryBarColor }]
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
                                ? StyleSheet.flatten([styles.mainTitle, styles.disabled, { color: secondaryBarColor }])
                                : [styles.mainTitle, { color: secondaryBarColor }]
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
        const {
            seedIndex,
            seedNames,
            isTopBarActive,
            secondaryBarColor,
            backgroundColor,
            barColor,
            notificationLog,
        } = this.props;
        const isWhite = secondaryBarColor === 'white';
        const chevronUpImagePath = isWhite ? whiteChevronUpImagePath : blackChevronUpImagePath;
        const chevronDownImagePath = isWhite ? whiteChevronDownImagePath : blackChevronDownImagePath;
        const notificationImagePath = isWhite ? whiteNotificationImagePath : blackNotificationImagePath;

        const iconProps = TopBar.getIconPath(isTopBarActive, chevronDownImagePath, chevronUpImagePath);
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
                            backgroundColor: barColor,
                        },
                    ]}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        {(hasNotifications && (
                            <TouchableOpacity
                                style={styles.notificationContainer}
                                onPress={() => this.setState({ isModalVisible: true })}
                            >
                                <Image style={styles.notification} source={notificationImagePath} />
                            </TouchableOpacity>
                        )) || (
                            <View style={styles.notificationContainer}>
                                <View style={styles.notification} />
                            </View>
                        )}
                        <ScrollView style={styles.scrollViewContainer}>{children}</ScrollView>
                        <View style={styles.chevronWrapper}>
                            {hasMultipleSeeds ? (
                                <Image
                                    style={
                                        shouldDisable
                                            ? StyleSheet.flatten([styles.chevron, styles.disabledImage])
                                            : styles.chevron
                                    }
                                    {...iconProps}
                                />
                            ) : (
                                <View style={styles.chevron} />
                            )}
                        </View>
                    </View>
                    <Modal
                        animationIn={'bounceInUp'}
                        animationOut={'bounceOut'}
                        animationInTiming={1000}
                        animationOutTiming={200}
                        backdropTransitionInTiming={500}
                        backdropTransitionOutTiming={200}
                        backdropColor={backgroundColor}
                        style={{ alignItems: 'center', margin: 0 }}
                        isVisible={this.state.isModalVisible}
                        onBackButtonPress={() => this.hideModal()}
                        onBackdropPress={() => this.hideModal()}
                    >
                        <NotificationLog
                            backgroundColor={barColor}
                            hideModal={() => this.hideModal()}
                            textColor={{ color: secondaryBarColor }}
                            borderColor={{ borderColor: secondaryBarColor }}
                            secondaryBarColor={secondaryBarColor}
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
    barColor: state.settings.theme.barColor,
    secondaryBarColor: state.settings.theme.secondaryBarColor,
    backgroundColor: state.settings.theme.backgroundColor,
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
