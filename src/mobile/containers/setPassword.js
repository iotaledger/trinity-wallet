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
  ScrollView
} from 'react-native';
import { connect } from 'react-redux';
import { setFirstUse } from '../../shared/actions/accountActions';
import { setSeed } from '../../shared/actions/iotaActions';
import { storeInKeychain } from '../../shared/libs/cryptography'
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from 'react-native-dropdownalert'
import {Keyboard} from 'react-native'

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
    if (this.state.password.length > 11 && (this.state.password == this.state.reentry)){
      Promise.resolve(storeInKeychain(this.state.password, this.props.iota.seed)).then(setSeed(''));
      this.props.setFirstUse(false);
      this.props.navigator.push({
        screen: 'login',
        navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png', screenBackgroundColor: '#102e36' },
        animated: false,
      });
    } else {
      if(this.state.password.length < 8 || this.state.reentry.length < 8 ){
        this.dropdown.alertWithType('error', 'Password is too short', 'Your password must be at least 11 characters. Please try again.');
      } else if(!(this.state.password == this.state.reentry)){
        this.dropdown.alertWithType('error', 'Passwords do not match', 'The passwords you have entered do not match. Please try again.');
      }
    }
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
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
        <View>
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
                An encrypted copy of your seed will be stored on your device. You will then only need to type in your password to access your wallet.
              </Text>
              <Text style={styles.warningText}>
                Ensure you use a strong password.
              </Text>
              <TextField
                style={{color:'white', fontFamily: 'Lato-Light' }}
                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                labelFontSize={height / 55}
                height={height / 40}
                fontSize={height / 45}
                labelHeight={height / 50}
                baseColor='white'
                label='Password'
                tintColor="#F7D002"
                labelPadding={3}
                autoCapitalize={'none'}
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                value={password}
                onChangeText={ (password) => this.setState({ password }) }
                containerStyle={{ width: width / 1.65, paddingBottom: height / 60, paddingTop: height / 40 }}
                secureTextEntry={true}
              />
              <TextField
                style={{color:'white', fontFamily: 'Lato-Light' }}
                labelTextStyle={{ fontFamily: 'Lato-Light' }}
                labelFontSize={height / 55}
                height={height / 40}
                fontSize={height / 45}
                labelHeight={height / 50}
                baseColor='white'
                label='Retype Password'
                autoCapitalize={'none'}
                autoCorrect={false}
                enablesReturnKeyAutomatically={true}
                value={reentry}
                onChangeText={ (reentry) => this.setState({ reentry }) }
                containerStyle={{ width: width / 1.65 }}
                secureTextEntry={true}
              />
            </View>
            <View style={styles.bottomContainer}>
              <View style={styles.buttonsContainer}>
                <TouchableOpacity onPress={event => this.onDoneClick()}>
                  <View style={styles.doneButton} >
                    <Text style={styles.doneText}>DONE</Text>
                  </View>
                </TouchableOpacity>
              </View>
              <View style={{ alignItems: 'center' }}>
                <TouchableOpacity onPress={event => this.onBackClick()}>
                  <View style={styles.backButton} >
                    <Text style={styles.backText}>BACK</Text>
                  </View>
                </TouchableOpacity>
              </View>
            </View>
            <DropdownAlert
              ref={(ref) => this.dropdown = ref}
            />
          </View>
      </TouchableWithoutFeedback>
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
    flex: 3.5,
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
    paddingHorizontal: width / 7,
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
    fontSize: width / 22,
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
  backButton: {
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
  backText: {
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
  iota: state.iota
});

const mapDispatchToProps = dispatch => ({
  setFirstUse: (boolean) => {
    dispatch(setFirstUse(boolean));
  },
  storeInKeychain: (password) => {
    dispatch(storeInKeychain(password));
  },
  setSeed: (seed) => {
    dispatch(setSeed(seed));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(SetPassword);
