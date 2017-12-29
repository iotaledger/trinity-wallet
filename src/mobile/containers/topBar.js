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
import { getAccountInfo } from 'iota-wallet-shared-modules/actions/account';
import { calculateBalance } from 'iota-wallet-shared-modules/libs/accountUtils';
import { setSeedIndex, setReceiveAddress } from 'iota-wallet-shared-modules/actions/tempAccount';
import { getBalanceForSelectedAccountViaSeedIndex } from '../../shared/selectors/account';
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
import { roundDown, formatValue, formatUnit } from 'iota-wallet-shared-modules/libs/util';
import THEMES from '../theme/themes';
import chevronUpImagePath from 'iota-wallet-shared-modules/images/chevron-up.png';
import chevronDownImagePath from 'iota-wallet-shared-modules/images/chevron-down.png';
import { getSelectedAccountViaSeedIndex } from 'iota-wallet-shared-modules/selectors/account';

const { height, width } = Dimensions.get('window');

class TopBar extends Component {
    static getIconPath(isActive) {
        if (isActive) {
            return {
                source: chevronUpImagePath,
            };
        }

        return {
            source: chevronDownImagePath,
        };
    }

    static propTypes = {
        balance: PropTypes.number.isRequired,
        seedNames: PropTypes.array.isRequired,
        accountInfo: PropTypes.object.isRequired,
        seedIndex: PropTypes.number.isRequired,
        currentSetting: PropTypes.string.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isGettingTransfers: PropTypes.bool.isRequired,
        isSyncing: PropTypes.bool.isRequired,
        childRoute: PropTypes.string.isRequired,
        isTopBarActive: PropTypes.bool.isRequired,
        toggleTopBarDisplay: PropTypes.func.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        setSeedIndex: PropTypes.func.isRequired,
        setReceiveAddress: PropTypes.func.isRequired,
        selectedAccount: PropTypes.object.isRequired,
        barColor: PropTypes.object.isRequired,
    };

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

    shouldDisable() {
        return this.props.isGeneratingReceiveAddress || this.props.isSendingTransfer || this.props.isSyncing;
    }

    filterSeedTitles(seedNames, currentSeedIndex) {
        return filter(seedNames, (t, i) => i !== currentSeedIndex);
    }

    renderTitles() {
        const { isTopBarActive, seedNames, balance, accountInfo, seedIndex } = this.props;

        const selectedTitle = get(seedNames, `[${seedIndex}]`) || ''; // fallback
        const selectedSubtitle = this.humanizeBalance(balance);

        const getBalance = currentIdx => {
            const seedStrings = Object.keys(accountInfo);
            const data = accountInfo[seedStrings[currentIdx]].addresses;
            const balances = Object.values(data).map(x => x.balance);

            if (isEmpty(data)) {
                return this.humanizeBalance(0); // no addresses
            }

            const calc = (res, value) => {
                res += value;
                return res;
            };

            const balance = reduce(balances, calc, 0);
            return this.humanizeBalance(balance);
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
                                disableWhen ? StyleSheet.flatten([styles.mainTitle, styles.disabled]) : styles.mainTitle
                            }
                        >
                            {selectedTitle}
                        </Text>
                        <Text
                            style={
                                disableWhen ? StyleSheet.flatten([styles.subtitle, styles.disabled]) : styles.subtitle
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

        const withoutSelectedTitle = this.filterSeedTitles(titles, seedIndex);
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
                    style={{ width: width, alignItems: 'center' }}
                >
                    <Text
                        numberOfLines={1}
                        style={disableWhen ? StyleSheet.flatten([styles.mainTitle, styles.disabled]) : styles.mainTitle}
                    >
                        {t.title}
                    </Text>
                    <Text
                        style={disableWhen ? StyleSheet.flatten([styles.subtitle, styles.disabled]) : styles.subtitle}
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
                    <View style={styles.separator} />
                </View>
            );
        });

        return (
            <View style={styles.titleWrapper}>
                {baseContent}
                {size(withoutSelectedTitle) ? <View style={styles.topSeparator} /> : null}
                {restContent}
            </View>
        );
    }

    onChange(newSeedIdx) {
        const {
            isGeneratingReceiveAddress,
            isSendingTransfer,
            isGettingTransfers,
            seedNames,
            selectedAccount,
        } = this.props;
        const hasAddresses = Object.keys(this.props.selectedAccount.addresses).length > 0;

        // TODO: Not sure why we are checking for address generation on change
        if (!isGeneratingReceiveAddress) {
            const seedName = seedNames[newSeedIdx];

            this.props.setSeedIndex(newSeedIdx);
            this.props.setReceiveAddress(' ');

            // Get new account info if not sending or getting transfers
            if (!isSendingTransfer && !isGettingTransfers && hasAddresses) {
                this.props.getAccountInfo(seedName); // TODO: There might be no need to fetch account information at this point
            }
        }
    }

    humanizeBalance(balance) {
        const decimalPlaces = n => {
            const s = '' + +n;
            const match = /(?:\.(\d+))?(?:[eE]([+\-]?\d+))?$/.exec(s);
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

    render() {
        const { seedIndex, seedNames, isTopBarActive } = this.props;
        const iconProps = TopBar.getIconPath(isTopBarActive);
        const children = this.renderTitles();
        const hasMultipleSeeds = size(this.filterSeedTitles(seedNames, seedIndex));
        const shouldDisable = this.shouldDisable();

        return (
            <TouchableWithoutFeedback
                onPress={() => {
                    if (!shouldDisable) {
                        this.props.toggleTopBarDisplay();
                    }
                }}
            >
                <View
                    style={[
                        styles.container,
                        {
                            backgroundColor: THEMES.getHSL(this.props.barColor),
                            shadowColor: THEMES.getHSL(this.props.barColor),
                        },
                    ]}
                >
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
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
                                <View />
                            )}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

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
        shadowOffset: {
            width: 0,
            height: -1,
        },
        shadowRadius: 4,
        shadowOpacity: 1.0,
    },
    titleWrapper: {
        paddingHorizontal: width / 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainTitle: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 24.4,
        color: '#ffffff',
        paddingBottom: height / 170,
        paddingHorizontal: width / 9,
    },
    subtitle: {
        textAlign: 'center',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        color: '#d3d3d3',
        paddingHorizontal: width / 9,
    },
    centralView: {
        alignItems: 'center',
    },
    chevronWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevron: {
        height: width / 20,
        width: width / 20,
        position: 'absolute',
        top: 0,
        right: width / 20,
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
        borderBottomColor: 'white',
    },
    topSeparator: {
        width: width,
        marginVertical: height / 60,
        height: 1,
        borderBottomWidth: height / 3000,
        borderBottomColor: 'white',
    },
    scrollViewContainer: {
        maxHeight: height,
    },
});

const mapStateToProps = state => ({
    balance: getBalanceForSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    seedNames: state.account.seedNames,
    accountInfo: state.account.accountInfo,
    currentSetting: state.tempAccount.currentSetting,
    seedIndex: state.tempAccount.seedIndex,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isGettingTransfers: state.tempAccount.isGettingTransfers,
    isSyncing: state.tempAccount.isSyncing,
    childRoute: state.home.childRoute,
    isTopBarActive: state.home.isTopBarActive,
    selectedAccount: getSelectedAccountViaSeedIndex(state.tempAccount.seedIndex, state.account.accountInfo),
    barColor: state.settings.theme.barColor,
});

const mapDispatchToProps = {
    toggleTopBarDisplay,
    getAccountInfo,
    setSeedIndex,
    setReceiveAddress,
};

export default translate('global')(connect(mapStateToProps, mapDispatchToProps)(TopBar));
