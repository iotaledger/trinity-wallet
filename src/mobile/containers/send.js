import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  TouchableWithoutFeedback,
  LayoutAnimation,
  ListView,
  ScrollView,
  Dimensions,
} from 'react-native';
import { TextField } from 'react-native-material-textfield';
import Triangle from 'react-native-triangle';
import TransactionRow from '../components/transactionRow.js';

const { height, width } = Dimensions.get('window');
const CustomLayoutSpring = {
  duration: 100,
  create: {
    type: LayoutAnimation.Types.spring,
    property: LayoutAnimation.Properties.scaleXY,
    springDamping: 0.7,
  },
  update: {
    type: LayoutAnimation.Types.spring,
    springDamping: 0.7,
  },
};

class Send extends React.Component {

  constructor(props) {
    super(props);
    const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

    this.state = {
      triangleDirection: 'down',
      dropdownHeight: 0,
      dropdownSelected: 'Mi',
      amount: '',
      address: '',
      dataSource: ds.cloneWithRows([
      ]),
    };
  }

  clickDenomination() {
    LayoutAnimation.configureNext(CustomLayoutSpring);
    switch (this.state.triangleDirection) {
      case ('down'):
        this.setState({
          triangleDirection: 'up',
          dropdownHeight: 100,
        });
        break;
      case ('up'):
        this.setState({
          triangleDirection: 'down',
          dropdownHeight: 0,
        });
        break;
    }
  }

  clickDropdownItem(item) {
    this.setState({
      dropdownHeight: 0,
      triangleDirection: 'down',
      dropdownSelected: item,
    });
  }

  onQRClick() {

  }

  render() {
    let { amount, address } = this.state;
    return (
      <ScrollView scrollEnabled={false} style={styles.container}>
        <View style={styles.topContainer}>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={styles.textFieldContainer}>
              <TextField
                keyboardType = {'numeric'}
                style={styles.textField}
                labelTextStyle={{ fontFamily: 'Lato-Regular' }}
                labelFontSize={height / 55}
                height={height / 40}
                fontSize={height / 45}
                labelHeight={height / 50}
                baseColor='white'
                enablesReturnKeyAutomatically={true}
                label='ADDRESS'
                autoCorrect={false}
                value={address}
                onChangeText={ (address) => this.setState({ address }) }
              />
            </View>
            <View style={styles.qrContainer}>
              <TouchableWithoutFeedback onPress={this.onQRClick()}>
                <View style={styles.qrButton}>
                  <Image source={require('../../shared/images/camera.png')} style={styles.qrImage} />
                    <Text style={styles.qrText} > QR </Text>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
          <View style={{ flexDirection: 'row', flex: 1 }}>
            <View style={styles.textFieldContainer}>
              <TextField
                keyboardType = {'numeric'}
                style={styles.textField}
                labelTextStyle={{ fontFamily: 'Lato-Regular' }}
                labelFontSize={height / 55}
                height={height / 40}
                fontSize={height / 45}
                labelHeight={height / 50}
                baseColor='white'
                enablesReturnKeyAutomatically={true}
                label='AMOUNT'
                autoCorrect={false}
                value={amount}
                onChangeText={ (amount) => this.setState({ amount }) }
              />
            </View>
            <View style={styles.dropdownButtonContainer}>
              <TouchableWithoutFeedback onPress={event => this.clickDenomination()}>
                <View style={styles.dropdownButton} >
                  <Text style={styles.denomination} > {this.state.dropdownSelected} </Text>
                  <Triangle
                    width={10}
                    height={10}
                    color={'white'}
                    direction={this.state.triangleDirection}
                    style={{ marginBottom: 8 }}
                  />
                </View>
              </TouchableWithoutFeedback>
            </View>
          </View>
        </View>
        <View style={styles.dropdownContainer}>
          <View style={{ height: this.state.dropdownHeight, overflow: 'hidden', width: 30, backgroundColor: 'transparent' }}>
            <Text style={styles.dropdownItem} onPress={event => this.clickDropdownItem('i')}> i </Text>
            <Text style={styles.dropdownItem} onPress={event => this.clickDropdownItem('Ki')}> Ki </Text>
            <Text style={styles.dropdownItem} onPress={event => this.clickDropdownItem('Mi')}> Mi </Text>
            <Text style={styles.dropdownItem} onPress={event => this.clickDropdownItem('Gi')}> Gi </Text>
            <Text style={styles.dropdownItem} onPress={event => this.clickDropdownItem('Ti')}> Ti </Text>
          </View>
        </View>
        <View style={styles.sendIOTAButton}>
          <Image style={styles.sendIOTAImage} source={require('../../shared/images/sendIota.png')} />
          <Text style={styles.sendIOTAText}>SEND IOTA</Text>
        </View>
        {/* }<ListView
                style={{position: 'absolute', top: 250, left: 0, right: 0, bottom: 0}}
                dataSource={this.state.dataSource}
                renderRow={(data) => <TransactionRow rowData={data}/>}
                renderSeparator={(sectionId, rowId) => <View key={rowId} style={styles.separator} />}
              /> */}
      </ScrollView>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: height / 10
  },
  topContainer: {
    paddingHorizontal: width / 10,
    zIndex: 1,
    flex: 1
  },
  textFieldContainer: {
    flex: 8,
    paddingRight: width / 20
  },
  textField: {
    color:'white',
    fontFamily: 'Lato-Light'
  },
  qrButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderColor: 'white',
    borderWidth: 1,
    borderRadius: 8,
    width: width / 7,
    height: height / 20,
  },
  qrText: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 36.8,
    backgroundColor: 'transparent',
    paddingLeft: 3
  },
  denomination: {
    color: 'white',
    fontFamily: 'Lato-Regular',
    fontSize: width / 23.8,
    backgroundColor: 'transparent',
    paddingBottom: 3,
    paddingRight: 3,
  },
  dropdownButton: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'center',
    borderBottomColor: 'white',
    borderBottomWidth: 1.2,
    width: width / 7,
  },
  dropdownButtonContainer: {
    flex: 1,
    justifyContent: 'flex-end',
    paddingBottom: 8,
    paddingRight: width / 20
  },
  dropdownContainer: {
    alignItems: 'flex-end',
    paddingRight: width / 10,
    zIndex: 1
  },
  qrImage: {
    height: width / 28,
    width: width / 28,
  },
  qrContainer: {
    flex: 1,
    justifyContent: 'center',
    paddingRight: width / 20
  },
  dropdownItem: {
    color: 'white',
    fontSize: width / 23.8,
    fontFamily: 'Lato-Regular',
    backgroundColor: 'transparent',
    textAlign: 'right',
  },
  sendIOTAButton: {
    flexDirection: 'row',
    borderColor: 'rgba(255, 255, 255, 0.6)',
    borderWidth: 1.5,
    borderRadius: 8,
    width: width / 3,
    height: height / 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#009f3f',
    position:'absolute',
    left: width / 3,
    top: height / 4
  },
  sendIOTAText: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 40.5,
    backgroundColor: 'transparent',
    paddingLeft: 10,
  },
  sendIOTAImage: {
    height: width / 35,
    width: width / 35,
  },
  separator: {
    flex: 1,
    height: 15,
  },
});

module.exports = Send;
