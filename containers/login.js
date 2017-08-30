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
import { setSeed } from '../actions/iotaActions';
import { getFromKeychain } from '../libs/cryptography'
import { TextField } from 'react-native-material-textfield';

const { height, width } = Dimensions.get('window');

class Login extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      password: '',
    };
  }


  onDoneClick(props) {
    getFromKeychain(this.state.password, function(value){
      if(typeof value !== 'undefined'){
         login(value);
      }
   })
   function login(value){
     props.setSeed(value);
      props.navigator.push({
        screen: 'loading',
        navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png', screenBackgroundColor: '#102e36' },
        animated: false,
      });
   }
  }

  onNewSeedClick(props) {
    this.props.navigator.push({
      screen: 'welcome',
      navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png', screenBackgroundColor: '#102e36' },
      animated: false,
    });
  }

  render() {
    let { password } = this.state;
    return (
      <ImageBackground source={require('../images/bg-green.png')} style={styles.container}>
        <ScrollView scrollEnabled={false}>
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
               style={{color:'white', fontFamily: 'Lato-Light'}}
               baseColor='white'
               label='PASSWORD'
               value={password}
               autoCorrect={false}
               autoCapitalize={'none'}
               enablesReturnKeyAutomatically={true}
               onChangeText={ (password) => this.setState({ password }) }
               containerStyle={{ paddingHorizontal: width / 6 }}
             />
          </View>
          </ScrollView>
          <View style={styles.bottomContainer}>
            <View style={{ alignItems: 'center'}}>
              <TouchableHighlight onPress={event => this.onDoneClick(this.props)} style={{ paddingBottom: height / 30 }}>
                <View style={styles.doneButton} >
                  <Text style={styles.doneText}>DONE</Text>
                </View>
              </TouchableHighlight>
            </View>
            <View style={{ alignItems: 'center' }}>
              <TouchableHighlight onPress={event => this.onNewSeedClick()}>
                <View style={styles.newSeedButton} >
                  <Text style={styles.newSeedText}>CHANGE WALLET</Text>
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
    flex: 2,
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
    paddingHorizontal: height / 8,
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
    paddingBottom: height / 20,
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
  newSeedButton: {
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
  newSeedText: {
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
  setSeed: (seed) => {
    dispatch(setSeed(seed));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Login);
