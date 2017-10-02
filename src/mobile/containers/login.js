import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  TouchableOpacity,
  Image,
  ImageBackground,
  ScrollView,
} from 'react-native';
import { connect } from 'react-redux';
import { setPassword, getAccountInfo } from '../../shared/actions/iotaActions';
import { getFromKeychain } from '../../shared/libs/cryptography';
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from 'react-native-dropdownalert';
import {Keyboard} from 'react-native'

const { height, width } = Dimensions.get('window');

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
    };
  }
  onDoneClick(props) {
    this.props.setPassword(this.state.password);
    getFromKeychain(this.state.password, (value) => {
      if (typeof value !== 'undefined') {
        login(value);
      } else {
        error();
      }
    });
    function login(value) {
     props.getAccountInfo(value);
     props.navigator.push({
        screen: 'loading',
        navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png', screenBackgroundColor: '#102e36' },
        animated: false,
      });
   }
    function error() {
     this.dropdown.alertWithType('error', 'Unrecognised password', 'The password was not recognised. Please try again.');
   }
  }

  onNewSeedClick(props) {
    this.props.navigator.push({
      screen: 'walletSetup',
      navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png', screenBackgroundColor: '#102e36' },
      animated: false,
    });
  }

  render() {
    let { password } = this.state;
    return (
      <ImageBackground source={require('../images/bg-green.png')} style={styles.container}>
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <View>
              <View style={styles.topContainer}>
                <Image source={require('../images/iota-glow.png')} style={styles.iotaLogo} />
                <View style={styles.textContainer}>
                  <Text style={styles.title}>
                                      LOGIN
                                 </Text>
                </View>
              </View>
              <View style={styles.midContainer}>
                <Text style={styles.greetingText}>
                                  Please enter your password.
                               </Text>
                <TextField
                   style={{ color: 'white', fontFamily: 'Lato-Light', fontSize: height / 38.6 }}
                   labelTextStyle={{ fontFamily: 'Lato-Light' }}
                   labelFontSize={height / 55}
                   height={height / 40}
                   fontSize={height / 45}
                   labelHeight={height / 50}
                   baseColor="white"
                   label="PASSWORD"
                   tintColor="#F7D002"
                   labelPadding={3}
                   value={password}
                   autoCorrect={false}
                   autoCapitalize={'none'}
                   enablesReturnKeyAutomatically
                   onChangeText={password => this.setState({ password })}
                   containerStyle={{ width: width / 1.65 }}
                   secureTextEntry
                 />
              </View>
              <View style={styles.bottomContainer}>
                <View style={styles.buttonsContainer}>
                  <TouchableOpacity onPress={event => this.onDoneClick(this.props)}>
                    <View style={styles.doneButton} >
                      <Text style={styles.doneText}>DONE</Text>
                    </View>
                  </TouchableOpacity>
                </View>
                <View style={{ alignItems: 'center' }}>
                  <TouchableOpacity onPress={event => this.onNewSeedClick()}>
                    <View style={styles.newSeedButton} >
                      <Text style={styles.newSeedText}>ADD NEW WALLET</Text>
                    </View>
                  </TouchableOpacity>
                </View>
              </View>
              </View>
          </TouchableWithoutFeedback>

        <DropdownAlert
            ref={ref => dropdown = ref}
          />

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
    paddingTop: height / 22,
  },
  midContainer: {
    flex: 2,
    justifyContent: 'flex-start',
    paddingTop: height / 10,
    alignItems: 'center'
  },
  bottomContainer: {
    flex: 2,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: height / 14,
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: height / 8,
    paddingTop: height / 35,
  },
  title: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 23,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  infoText: {
    color: 'white',
    fontFamily: 'Lato-Light',
    fontSize: width / 33.75,
    textAlign: 'center',
    paddingRight: width / 4,
    paddingLeft: width / 4,
    paddingTop: height / 30,
    backgroundColor: 'transparent',
  },
  greetingText: {
    color: 'white',
    fontFamily: 'Lato-Regular',
    fontSize: width / 20.25,
    textAlign: 'center',
    paddingHorizontal: width / 7,
    paddingBottom: height / 10,
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
  buttonsContainer: {
    alignItems: 'center',
    paddingBottom: height / 30
  },
  doneButton: {
    borderColor: '#9DFFAF',
    borderWidth: 1.2,
    borderRadius: 10,
    width: width / 1.65,
    height: height / 17,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  newSeedButton: {
    borderColor: '#F7D002',
    borderWidth: 1.2,
    borderRadius: 10,
    width: width / 1.65,
    height: height / 17,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  doneText: {
    color: '#9DFFAF',
    fontFamily: 'Lato-Light',
    fontSize: width / 25.3,
    backgroundColor: 'transparent',
  },
  newSeedText: {
    color: '#F7D002',
    fontFamily: 'Lato-Light',
    fontSize: width / 25.3,
    backgroundColor: 'transparent',
  },
  iotaLogo: {
    height: width / 5,
    width: width / 5,
  },

});

const mapStateToProps = state => ({
  iota: state.iota,
});

const mapDispatchToProps = dispatch => ({
  setPassword: (password) => {
    dispatch(setPassword(password));
  },
  getAccountInfo: (seed) => {
    dispatch(getAccountInfo(seed));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
