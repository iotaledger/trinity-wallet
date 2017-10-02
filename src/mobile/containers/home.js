import React from 'react';
import {
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  Image,
  Dimensions,
  View,
  ImageBackground
} from 'react-native';
import Balance from './balance';
import Send from './send';
import Receive from './receive';
import History from './history';
import Tools from './tools';

const { height, width } = Dimensions.get('window');


class Home extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      tabChoice: 'Balance',
      tabContent: <Balance />,
      balanceOpacity: 1,
      sendOpacity: 0.6,
      receiveOpacity: 0.6,
      historyOpacity: 0.6,
      toolsOpacity: 0.6,
      bannerText: 'BALANCE',
      mode: 'STANDARD',
    };
  }

  setTab(tabChoice) {
    let tabContent;
    switch (tabChoice) {
      case 'balance':
        tabContent = <Balance type={tabChoice} />;
        break;
      case 'send':
        tabContent = <Send type={tabChoice} />;
        break;
      case 'receive':
        tabContent = <Receive type={tabChoice} />;
        break;
      case 'history':
        tabContent = <History type={tabChoice} />;
        break;
      case 'tools':
        tabContent = <Tools type={tabChoice} />;
        break;
      default:
        break;
    }
    this.setState({
      tabChoice,
      tabContent,
    });
  }

  clickBalance() {
    this.setTab('balance');
    this.setState({
      balanceOpacity: 1,
      sendOpacity: 0.6,
      receiveOpacity: 0.6,
      historyOpacity: 0.6,
      toolsOpacity: 0.6,
      bannerText: 'BALANCE',
    });
  }
  clickSend() {
    this.setTab('send');
    this.setState({
      balanceOpacity: 0.6,
      sendOpacity: 1,
      receiveOpacity: 0.6,
      historyOpacity: 0.6,
      toolsOpacity: 0.6,
      bannerText: 'SEND',
    });
  }
  clickReceive() {
    this.setTab('receive');
    this.setState({
      balanceOpacity: 0.6,
      sendOpacity: 0.6,
      receiveOpacity: 1,
      historyOpacity: 0.6,
      toolsOpacity: 0.6,
      bannerText: 'RECEIVE',
    });
  }
  clickHistory() {
    this.setTab('history');
    this.setState({
      balanceOpacity: 0.6,
      sendOpacity: 0.6,
      receiveOpacity: 0.6,
      historyOpacity: 1,
      toolsOpacity: 0.6,
      bannerText: 'HISTORY',
    });
  }
  clickTools() {
    this.setTab('tools');
    this.setState({
      balanceOpacity: 0.6,
      sendOpacity: 0.6,
      receiveOpacity: 0.6,
      historyOpacity: 0.6,
      toolsOpacity: 1,
      bannerText: 'TOOLS',
    });
  }

  render() {
    return (
      <ImageBackground source={require('../../shared/images/bg-green.png')} style={{flex: 1}}>
          <View style={styles.titleContainer}>
            <View style={styles.banner}>
              <Image style={styles.logo} source={require('../../shared/images/iota.png')} />
              <Text style={styles.mode}>{this.state.mode}</Text>
              <Text style={styles.title}>{this.state.bannerText}</Text>
            </View>
            <View style={{ flex: 6 }}>
              {this.state.tabContent}
            </View>
          </View>
          <View style={styles.tabBar}>
            <TouchableWithoutFeedback onPress={event => this.clickBalance()}>
              <View style={styles.button}>
                <Image style={[styles.icon, { opacity: this.state.balanceOpacity }]} source={require('../../shared/images/balance.png')} />
                <Text style={[styles.iconTitle, { opacity: this.state.balanceOpacity }]}>BALANCE</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={event => this.clickSend()}>
              <View style={styles.button}>
                <Image style={[styles.icon, { opacity: this.state.sendOpacity }]} source={require('../../shared/images/send.png')} />
                <Text style={[styles.iconTitle, { opacity: this.state.sendOpacity }]}>SEND</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={event => this.clickReceive()}>
              <View style={styles.button}>
                <Image style={[styles.icon, { opacity: this.state.receiveOpacity }]} source={require('../../shared/images/receive.png')} />
                <Text style={[styles.iconTitle, { opacity: this.state.receiveOpacity }]}>RECEIVE</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={event => this.clickHistory()}>
              <View style={styles.button}>
                <Image style={[styles.icon, { opacity: this.state.historyOpacity }]} source={require('../../shared/images/history.png')} />
                <Text style={[styles.iconTitle, { opacity: this.state.historyOpacity }]}>HISTORY</Text>
              </View>
            </TouchableWithoutFeedback>
            <TouchableWithoutFeedback onPress={event => this.clickTools()}>
              <View style={styles.button}>
                <Image style={[styles.icon, { opacity: this.state.toolsOpacity }]} source={require('../../shared/images/tools.png')} />
                <Text style={[styles.iconTitle, { opacity: this.state.toolsOpacity }]}>TOOLS</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
      </ImageBackground>
    );
  }
      }

const styles = StyleSheet.create({
  titleContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'stretch',
  },
  banner: {
    alignItems: 'center',
    paddingTop: 20,
    flex: 1,
  },
  logo: {
    height: width / 10,
    width: width / 10,
  },
  tabBar: {
    flex: 0.12,
    flexDirection: 'row',
    backgroundColor: 'transparent',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 5
  },
  button: {
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  icon: {
    height: width / 12,
    width: width / 12,
  },
  iconTitle: {
    color: 'white',
    fontWeight: 'bold',
    textAlign: 'center',
    paddingTop: height / 60,
    fontFamily: 'Lato-Regular',
    fontSize: width / 40.5,
  },
  title: {
    color: 'white',
    textAlign: 'center',
    paddingTop: 8,
    backgroundColor: 'transparent',
    fontFamily: 'Lato-Regular',
    fontSize: width / 14.5,
  },
  mode: {
    color: 'white',
    backgroundColor: 'transparent',
    fontFamily: 'Lato-Regular',
    fontSize: width / 50.6,
    paddingTop: 5,
  },
});

module.exports = Home;
