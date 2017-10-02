import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableWithoutFeedback,
  Image,
  ImageBackground,
} from 'react-native';
import { connect } from 'react-redux';
import { setLoggedIn } from '../../shared/actions/accountActions';
import { randomiseSeed } from '../../shared/actions/iotaActions';

const { height, width } = Dimensions.get('window');

class Welcome extends React.Component {
  constructor(props) {
    super(props);
  }

  componentDidMount(){
    this.props.randomiseSeed()
  }

  onYesClick() {
    this.props.navigator.push({
      screen: 'enterSeed',
      navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png', screenBackgroundColor: '#102e36' },
      animated: false,
    });
  }
  onNoClick() {
    this.props.navigator.push({
      screen: 'newSeedSetup',
      navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png', screenBackgroundColor: '#102e36' },
      animated: false,
    });
  }

  render() {
    return (
      <ImageBackground source={require('../../shared/images/bg-green.png')} style={styles.container}>
        <View style={styles.topContainer}>
          <Image source={require('../../shared/images/iota-glow.png')} style={styles.iotaLogo} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>
                                WELCOME
                           </Text>
          </View>
        </View>
        <View style={styles.midContainer}>
          <Text style={styles.greetingText}>
                          Okay. Lets set up your wallet!
                       </Text>
          <Text style={styles.questionText}>
                          Do you already have a seed that you would like to use?
                       </Text>
          <Text style={styles.infoText}>
                          A seed is like a master password to your account. You can use this to access your funds from any wallet.
                       </Text>
        </View>
        <View style={styles.bottomContainer}>
          <View style={{ alignItems: 'center', paddingBottom: height / 30 }}>
            <TouchableWithoutFeedback onPress={event => this.onYesClick()}>
              <View style={styles.yesButton} >
                <Text style={styles.yesText}>YES - I have seed</Text>
              </View>
            </TouchableWithoutFeedback>
          </View>
          <View style={{ alignItems: 'center' }}>
            <TouchableWithoutFeedback onPress={event => this.onNoClick()}>
              <View style={styles.noButton} >
                <Text style={styles.noText}>NO - I need a new seed</Text>
              </View>
            </TouchableWithoutFeedback>
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
    flex: 1.8,
    alignItems: 'center',
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
    paddingLeft: width / 7,
    paddingRight: width / 7,
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
  yesButton: {
    borderColor: '#9DFFAF',
    borderWidth: 1.5,
    borderRadius: 10,
    width: width * 0.6,
    height: height * 0.06,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  noButton: {
    borderColor: '#F7D002',
    borderWidth: 1.5,
    borderRadius: 10,
    width: width * 0.6,
    height: height * 0.06,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  yesText: {
    color: '#9DFFAF',
    fontFamily: 'Lato-Light',
    fontSize: width / 25.3,
    backgroundColor: 'transparent',
  },
  noText: {
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
  account: state.account,
});

const mapDispatchToProps = dispatch => ({
  setLoggedIn: (boolean) => {
    dispatch(setLoggedIn(boolean));
  },
  randomiseSeed: () => {
    dispatch(randomiseSeed());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Welcome);
