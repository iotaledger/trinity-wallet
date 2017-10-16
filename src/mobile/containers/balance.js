import React from 'react';
import { StyleSheet, View, Text, ListView, Dimensions } from 'react-native';

import { connect } from 'react-redux';
import { changeCurrency, changeTimeFrame } from '../../shared/actions/marketDataActions';
import { round, formatValue, formatUnit } from '../../shared/libs/util';
import SimpleTransactionRow from '../components/simpleTransactionRow';
import Chart from '../components/chart';

const { height, width } = Dimensions.get('window');
const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class Balance extends React.Component {
    constructor() {
        super();
        this.state = {
            balanceIsShort: true,
        };
    }

    onBalanceClick() {
        if (this.state.balanceIsShort) {
            this.setState({ balanceIsShort: false });
        } else {
            this.setState({ balanceIsShort: true });
        }
    }

    render() {
        const shortenedBalance =
            round(formatValue(this.props.iota.balance, 1)).toFixed(1) + (this.props.iota.balance < 1000 ? '' : '+');
        return (
            <View style={styles.container}>
                <View style={styles.balanceContainer}>
                    <Text style={styles.iotaBalance} onPress={event => this.onBalanceClick()}>
                        {this.state.balanceIsShort ? shortenedBalance : this.props.iota.balance}{' '}
                        {formatUnit(this.props.iota.balance)}
                    </Text>
                    <Text style={styles.fiatBalance}>
                        $ {round(this.props.iota.balance * this.props.marketData.usdPrice / 1000000, 2).toFixed(2)}{' '}
                    </Text>
                </View>
                <View style={styles.line} />
                <View style={styles.transactionsContainer}>
                    <ListView
                        dataSource={ds.cloneWithRows(this.props.iota.transactions.slice(0, 4))}
                        renderRow={dataSource => <SimpleTransactionRow rowData={dataSource} />}
                        renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
                        enableEmptySections
                        contentContainerStyle={styles.listView}
                        scrollEnabled={false}
                    />
                </View>
                <View style={styles.line} />
                <View style={{ flex: 52 }}>
                    <Chart
                        marketData={this.props.marketData}
                        changeCurrency={(currency, timeFrame) => this.props.changeCurrency(currency, timeFrame)}
                        changeTimeFrame={(currency, timeFrame) => this.props.changeTimeFrame(currency, timeFrame)}
                    />
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
    },
    balanceContainer: {
        flex: 8.5,
        alignItems: 'center',
        paddingTop: height / 50,
        paddingBottom: height / 15,
    },
    iotaBalance: {
        color: 'white',
        fontFamily: 'Lato-Heavy',
        fontSize: width / 9,
        backgroundColor: 'transparent',
    },
    fiatBalance: {
        color: 'white',
        paddingTop: 5,
        fontFamily: 'Lato-Regular',
        fontSize: width / 25,
        backgroundColor: 'transparent',
    },
    transactionsContainer: {
        flex: 16.5,
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: height / 40,
    },
    line: {
        borderBottomColor: 'white',
        borderBottomWidth: 0.25,
        width: width / 1.2,
    },
    separator: {
        flex: 1,
        height: 5,
    },
    listView: {
        flex: 1,
        justifyContent: 'center',
    },
});

const mapStateToProps = state => ({
    marketData: state.marketData,
    iota: state.iota,
    account: state.account,
});

const mapDispatchToProps = dispatch => ({
    changeCurrency: (currency, timeFrame) => {
        dispatch(changeCurrency(currency, timeFrame));
    },
    changeTimeFrame: (currency, timeFrame) => {
        dispatch(changeTimeFrame(currency, timeFrame));
    },
});

export default connect(mapStateToProps, mapDispatchToProps)(Balance);
