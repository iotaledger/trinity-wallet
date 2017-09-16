import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableHighlight,
  TouchableWithoutFeedback,
  Image,
  ScrollView,
  ImageBackground,
} from 'react-native';
import { connect } from 'react-redux';
import { TextField } from 'react-native-material-textfield';
import DropdownAlert from 'react-native-dropdownalert';
import { setSeed } from '../actions/iotaActions';
import { setLoggedIn } from '../actions/accountActions';
import { getMarketData, getChartData, getPrice } from '../actions/marketDataActions';
import {Keyboard} from 'react-native'

const { height, width } = Dimensions.get('window');

class EnterSeed extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      seed: '',
    };
  }
  onDoneClick() {
    if (this.state.seed.length > 59) {
      this.props.setSeed(this.state.seed);
      this.props.navigator.push({
        screen: 'setPassword',
        navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png' },
        animated: false,
      });
    } else {
      this.dropdown.alertWithType('error', 'Seed is too short', 'Seeds must be at least 60 characters long. Please try again.');
    }
  }
  onBackClick() {
    this.props.navigator.pop({
      animated: false,
    });
  }

  render() {
    const { seed } = this.state;
    return (
      <ImageBackground source={require('../images/bg-green.png')} style={styles.container}>
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.container}>
          <View style={styles.topContainer}>
            <View style={styles.logoContainer}>
              <Image source={require('../images/iota-glow.png')} style={styles.iotaLogo} />
            </View>
            <View style={styles.textContainer}>
              <Text style={styles.title}>
                                ENTER YOUR SEED
                           </Text>
            </View>
            <TextField
              style={{ color: 'white', fontFamily: 'Lato-Light' }}
              labelTextStyle={{ fontFamily: 'Lato-Light' }}
              labelFontSize={height / 55}
              fontSize={height / 45}
              baseColor="white"
              label="SEED"
              value={seed}
              multiline
              autoCorrect={false}
              autoCapitalize={'characters'}
              enablesReturnKeyAutomatically
              maxLength={81}
              onChangeText={seed => this.setState({ seed })}
              containerStyle={{ paddingHorizontal: width / 8 }}
              secureTextEntry
            />
          </View>
        <View style={styles.midContainer}>
          <Text style={styles.infoText}>
                          Seeds should be 81 characters long, and should contain capital letters A-Z, or the number 9.
                          You cannot use seeds longer than 81 characters.
            </Text>
          <Text style={styles.warningText}>
                          NEVER SHARE YOUR SEED WITH ANYONE
            </Text>
        </View>
        <View style={styles.bottomContainer}>
          <View style={{ alignItems: 'center' }}>
            <TouchableHighlight onPress={event => this.onDoneClick()} style={{ paddingBottom: height / 30 }}>
              <View style={styles.doneButton} >
                <Text style={styles.doneText}>DONE</Text>
              </View>
            </TouchableHighlight>
          </View>
          <View style={{ alignItems: 'center' }}>
            <TouchableHighlight onPress={event => this.onBackClick()}>
              <View style={styles.backButton} >
                <Text style={styles.backText}>GO BACK</Text>
              </View>
            </TouchableHighlight>
          </View>
        </View>
        <DropdownAlert
          ref={ref => this.dropdown = ref}
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
  },
  topContainer: {
    flex: 1,
    paddingTop: height / 30,
  },
  midContainer: {
    flex: 1,
    alignItems: 'center',
    position: 'absolute',
  },
  bottomContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-end',
    paddingBottom: height / 7,
  },
  logoContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: height / 8,
    paddingTop: height / 35,
    paddingBottom: height / 20,
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
    paddingRight: width / 5,
    paddingLeft: width / 5,
    paddingTop: width / 20,
    backgroundColor: 'transparent',
  },
  warningText: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 33.75,
    textAlign: 'center',
    paddingTop: 7,
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
  marketData: state.marketData,
  iota: state.iota,
  account: state.account,
});

const mapDispatchToProps = dispatch => ({
  setSeed: (seed) => {
    dispatch(setSeed(seed));
  },
  getMarketData: () => {
    dispatch(getMarketData());
  },
  getPrice: (currency) => {
    dispatch(getPrice(currency));
  },
  getChartData: (currency, timeFrame) => {
    dispatch(getChartData(currency, timeFrame));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(EnterSeed);
