import React, { Component } from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Image,
  ImageBackground,
  Text,
} from 'react-native';

import store from '../store';


const { height, width } = Dimensions.get('window');

class InitialLoading extends React.Component {


  componentDidMount() {
    this.timeout = setTimeout(this.onLoaded.bind(this), 100);
  }

  onLoaded() {
    const state = store.getState();
    if (!state.account.loggedIn) {
      this.props.navigator.push({
        screen: 'welcome',
        navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png' },
        animated: false,
      });
    } else {
      this.props.navigator.push({
        screen: 'loading',
        navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png' },
        animated: false,
      });
    }
  }

  render() {
    return (
      <ImageBackground source={require('../images/bg-green.png')} style={styles.container}>
        <View style={styles.logoContainer}>
          <Image source={require('../images/iota-white.png')} style={styles.logo} />
        </View>
        <View style={styles.textContainer}>
          <Text style={styles.text}>
                        IOTA Foundation © 2017
                    </Text>
        </View>
      </ImageBackground>
    );
  }
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  logoContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height / 15,
  },
  text: {
    backgroundColor: 'transparent',
    fontFamily: 'Lato-Regular',
    color: 'white',
  },
  textContainer: {
    justifyContent: 'flex-end',
    paddingBottom: height / 15,
  },
  logo: {
    width: width / 4,
    height: width / 4,
  },
});

module.exports = InitialLoading;
