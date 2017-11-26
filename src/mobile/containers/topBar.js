import map from 'lodash/map';
import filter from 'lodash/filter';
import size from 'lodash/size';
import get from 'lodash/get';
import isEmpty from 'lodash/isEmpty';
import reduce from 'lodash/reduce';
import React, { Component } from 'react';
import { connect } from 'react-redux';
import { toggleTopBarDisplay } from '../../shared/actions/home';
import { getAccountInfo, setBalance } from '../../shared/actions/account';
import { setSeedIndex, setReceiveAddress } from '../../shared/actions/tempAccount';
import PropTypes from 'prop-types';
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
import DropdownHolder from '../components/dropdownHolder';
import { roundDown, formatValue, formatUnit } from '../../shared/libs/util';

const { height, width } = Dimensions.get('window');

class TopBar extends Component {
    static getIconPath(isActive) {
        if (isActive) {
            return {
                source: require('../../shared/images/chevron-up.png'),
            };
        }

        return {
            source: require('../../shared/images/chevron-down.png'),
        };
    }

    static propTypes = {
        seedNames: PropTypes.array.isRequired,
        accountInfo: PropTypes.object.isRequired,
        seedIndex: PropTypes.number.isRequired,
        isGeneratingReceiveAddress: PropTypes.bool.isRequired,
        isSendingTransfer: PropTypes.bool.isRequired,
        isGettingTransfers: PropTypes.bool.isRequired,
        childRoute: PropTypes.string.isRequired,
        isTopBarActive: PropTypes.bool.isRequired,
        toggleTopBarDisplay: PropTypes.func.isRequired,
        getAccountInfo: PropTypes.func.isRequired,
        setBalance: PropTypes.func.isRequired,
        setSeedIndex: PropTypes.func.isRequired,
        setReceiveAddress: PropTypes.func.isRequired,
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

            if (isEmpty(data)) {
                return this.humanizeBalance(0); // no addresses
            }

            const calc = (res, value) => {
                res += value;

                return res;
            };

            const balance = reduce(data, calc, 0);
            return this.humanizeBalance(balance);
        };

        const withSubtitles = (title, index) => ({ title, subtitle: getBalance(index), index });
        const titles = map(seedNames, withSubtitles);

        const baseContent = (
            <View style={styles.titleWrapper}>
                <TouchableWithoutFeedback onPress={() => this.props.toggleTopBarDisplay()}>
                    <View>
                        <Text style={styles.mainTitle}>{selectedTitle}</Text>
                        <Text style={styles.subtitle}>{selectedSubtitle}</Text>
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
                        this.props.toggleTopBarDisplay(); // Close
                        this.onChange(t.index);
                    }}
                    key={idx}
                    style={{ width: width, alignItems: 'center' }}
                >
                    <Text style={styles.mainTitle}>{t.title}</Text>
                    <Text style={styles.subtitle}>{t.subtitle}</Text>
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
            accountInfo,
            isSendingTransfer,
            isGettingTransfers,
            seedNames,
        } = this.props;

        if (!isGeneratingReceiveAddress) {
            const seedName = seedNames[newSeedIdx];

            this.props.setSeedIndex(newSeedIdx);
            const seedStrings = Object.keys(accountInfo);
            this.props.setBalance(accountInfo[seedStrings[newSeedIdx]].addresses); // Dangerous
            this.props.setReceiveAddress(' ');

            // Get new account info if not sending or getting transfers
            if (!isSendingTransfer && !isGettingTransfers) {
                this.props.getAccountInfo(seedName, newSeedIdx, accountInfo, error => {
                    if (error) {
                        this.onNodeError();
                    }
                });
            }
        }
    }

    onNodeError() {
        const dropdown = DropdownHolder.getDropdown();
        dropdown.alertWithType('error', 'Invalid response', `The node returned an invalid response.`);
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

        return (
            <TouchableWithoutFeedback onPress={this.props.toggleTopBarDisplay}>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <ScrollView style={styles.scrollViewContainer}>{children}</ScrollView>
                        <View style={styles.chevronWrapper}>
                            {hasMultipleSeeds ? (
                                <Image style={styles.chevron} {...iconProps} />
                            ) : (
                                <View style={styles.chevron} />
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
        backgroundColor: '#071f28',
        shadowColor: '#071f28',
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
    },
    subtitle: {
        textAlign: 'center',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        color: '#d3d3d3',
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
    separator: {
        width: width / 2,
        marginVertical: height / 60,
        height: 1,
        borderBottomWidth: 0.25,
        borderBottomColor: 'white',
    },
    topSeparator: {
        width: width,
        marginVertical: height / 60,
        height: 1,
        borderBottomWidth: 0.25,
        borderBottomColor: 'white',
    },
    scrollViewContainer: {
        maxHeight: height,
    },
});

const mapStateToProps = state => ({
    seedNames: state.account.seedNames,
    balance: state.account.balance,
    accountInfo: state.account.accountInfo,
    seedIndex: state.tempAccount.seedIndex,
    isGeneratingReceiveAddress: state.tempAccount.isGeneratingReceiveAddress,
    isSendingTransfer: state.tempAccount.isSendingTransfer,
    isGettingTransfers: state.tempAccount.isGettingTransfers,
    childRoute: state.home.childRoute,
    isTopBarActive: state.home.isTopBarActive,
});

const mapDispatchToProps = dispatch => ({
    toggleTopBarDisplay: () => dispatch(toggleTopBarDisplay()),
    getAccountInfo: (seedName, seedIndex, accountInfo, cb) =>
        dispatch(getAccountInfo(seedName, seedIndex, accountInfo, cb)),
    setBalance: addressesWithBalance => dispatch(setBalance(addressesWithBalance)),
    setSeedIndex: index => dispatch(setSeedIndex(index)),
    setReceiveAddress: string => dispatch(setReceiveAddress(string)),
});

export default connect(mapStateToProps, mapDispatchToProps)(TopBar);
