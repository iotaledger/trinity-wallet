import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableHighlight,
  Image,
  ImageBackground,
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { setLoggedIn } from '../actions/accountActions';
import { storeInKeychain } from '../libs/cryptography'
import { TextField } from 'react-native-material-textfield';

const { height, width } = Dimensions.get('window');

class SetPassword extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
      reentry: ''
    };
  }

  onDoneClick() {
    if (this.state.password.length > 6){
        storeInKeychain(this.state.password, this.props.iota.seed);
    }
    this.props.navigator.push({
      screen: 'login',
      navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png', screenBackgroundColor: '#102e36' },
      animated: false,
    });
  }
  onBackClick() {
    this.props.navigator.pop({
      animated: false,
    });
  }

  render() {
    let { password, reentry } = this.state;
    return (
      <ImageBackground source={require('../images/bg-green.png')} style={styles.container}>
        <ScrollView scrollEnabled={false}>
        <View style={styles.topContainer}>
          <Image source={require('../images/iota-glow.png')} style={styles.iotaLogo} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>
                                PASSWORD SETUP
                           </Text>
          </View>
        </View>
        <View style={styles.midContainer}>
          <Text style={styles.greetingText}>
                          Okay, now we need to set up a password.
                       </Text>
          <Text style={styles.infoText}>
            An encrypted copy of your seed will be stored in your keychain. You will then only need to type in your password to access your wallet.
          </Text>
          <Text style={styles.warningText}>
            Ensure you use a strong password.
          </Text>
          <TextField
            style={{color:'white', fontFamily: 'Lato-Light' }}
            labelTextStyle={{ fontFamily: 'Lato-Light' }}
            baseColor='white'
            label='PASSWORD'
            autoCapitalize={'none'}
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
            value={password}
            onChangeText={ (password) => this.setState({ password }) }
            containerStyle={{ paddingHorizontal: width / 6 }}
          />
          <TextField
            style={{color:'white', fontFamily: 'Lato-Light' }}
            labelTextStyle={{ fontFamily: 'Lato-Light' }}
            baseColor='white'
            label='RETYPE PASSWORD'
            autoCapitalize={'none'}
            autoCorrect={false}
            enablesReturnKeyAutomatically={true}
            value={reentry}
            onChangeText={ (reentry) => this.setState({ reentry }) }
            containerStyle={{ paddingHorizontal: width / 6 }}
          />
        </View>
        </ScrollView>
        <View style={styles.bottomContainer}>
          <View style={{ alignItems: 'center'}}>
            <TouchableHighlight onPress={event => this.onDoneClick()} style={{ paddingBottom: height / 30 }}>
              <View style={styles.doneButton} >
                <Text style={styles.doneText}>DONE</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={{ alignItems: 'center' }}>
            <TouchableHighlight onPress={event => this.onBackClick()}>
              <View style={styles.backButton} >
                <Text style={styles.backText}>BACK</Text>
              </View>
            </TouchableHighlight>
          </View>
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
    backgroundColor: '#102e36',
  },
  topContainer: {
    flex: 1.2,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height / 30,
  },
  midContainer: {
    flex: 3.5,
    justifyContent: 'flex-start',
    paddingTop: height / 10,
  },
  bottomContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: height / 7,
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width / 7,
    paddingTop: height / 35,
  },
  title: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 20.25,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  infoText: {
    color: 'white',
    fontFamily: 'Lato-Light',
    fontSize: width / 33.75,
    textAlign: 'center',
    paddingHorizontal: width / 6,
    backgroundColor: 'transparent',
  },
  warningText: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 33.75,
    textAlign: 'center',
    paddingHorizontal: width / 6,
    paddingTop: 5,
    backgroundColor: 'transparent',
  },
  greetingText: {
    color: 'white',
    fontFamily: 'Lato-Regular',
    fontSize: width / 20.25,
    textAlign: 'center',
    paddingHorizontal: width / 7,
    paddingBottom: height / 40,
    backgroundColor: 'transparent',
  },
  questionText: {
    color: 'white',
    fontFamily: 'Lato-Regular',
    fontSize: width / 20.25,
    textAlign: 'center',
    paddingLeft: width / 7,
    paddingRight: width / 7,
    paddingTop: height / 25,
    backgroundColor: 'transparent',
  },
  doneButton: {
    borderColor: '#9DFFAF',
    borderWidth: 1.5,
    borderRadius: 10,
    width: width * 0.6,
    height: height * 0.06,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  backButton: {
    borderColor: '#F7D002',
    borderWidth: 1.5,
    borderRadius: 10,
    width: width * 0.6,
    height: height * 0.06,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  doneText: {
    color: '#9DFFAF',
    fontFamily: 'Lato-Light',
    fontSize: width / 25.3,
    backgroundColor: 'transparent',
  },
  backText: {
    color: '#F7D002',
    fontFamily: 'Lato-Light',
    fontSize: width / 25.3,
    backgroundColor: 'transparent',
  },
  iotaLogo: {
    height: width / 6,
    width: width / 6,
  },

});

const mapStateToProps = state => ({
  iota: state.iota
});

const mapDispatchToProps = dispatch => ({
  setLoggedIn: (boolean) => {
    dispatch(setLoggedIn(boolean));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SetPassword);
