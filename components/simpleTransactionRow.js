import React, { Component } from 'react';
import { View, Text, StyleSheet, Image, Dimensions } from 'react-native';
import { formatTime, round, formatValue, formatUnit } from '../libs/util';

const { height, width } = Dimensions.get('window');

class SimpleTransactionRow extends React.Component {

  constructor(props) {
    super(props);
  }

  render() {
    const icon = this.props.rowData[0].transactionValue < 0 ? require('../images/send.png') : require('../images/receive.png');
    const sign = this.props.rowData[0].transactionValue < 0 ? '-' : '+';
    const titleColour = this.props.rowData[0].transactionValue < 0 ? '#F7D002' : '#72BBE8';

    return (
      <View style={styles.container}>
        <View style={{ flex: 1 }}>
          <Image source={icon} style={styles.icon} />
        </View>
        <View style={{ flex: 3, alignItems: 'flex-start' }}>
          <Text style={{color: titleColour, backgroundColor: 'transparent', padding: 5, fontFamily: 'Lato-Bold', fontSize: width / 32.5}}>
            {formatTime(this.props.rowData[0].timestamp)}
          </Text>
        </View>
        <View style={{ flex: 2, alignItems: 'flex-start' }}>
          <Text style={{color: titleColour, backgroundColor: 'transparent', fontFamily: 'Lato-Bold', fontSize: width / 32.5 }}>
            {this.props.rowData[0].transactionValue < 0 ? 'Sent' : 'Received'}
          </Text>
        </View>
        <View style={{ flex: 2, alignItems: 'flex-end'}}>
          <Text style={{color: titleColour, backgroundColor: 'transparent', fontFamily: 'Lato-Bold', fontSize: width / 32.5 }}>
            {sign} {round(formatValue(this.props.rowData[0].value), 1)} {formatUnit(this.props.rowData[0].value)}
          </Text>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    flexDirection: 'row',
    height: height / 40,
    width: width / 1.6,
    alignItems: 'center',
  },
  icon: {
    width: width / 30,
    height: width / 30,
  },

});

module.exports = SimpleTransactionRow;
