import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableOpacity,
  Image,
  ImageBackground,
} from 'react-native';
import { connect } from 'react-redux';
import QRCode from 'react-native-qrcode';

const { height, width } = Dimensions.get('window');

class PaperWallet extends React.Component {

  constructor(props) {
    super(props);
    this.state = {
      checkboxImage: require('../images/checkbox-checked.png'),
      showIotaLogo: true
    }
  }

  onDonePress() {
    this.props.navigator.pop({
      animated: false,
    });
  }

  onCheckboxPress() {
    if(this.state.checkboxImage == require('../images/checkbox-checked.png')) {
      this.setState({
        checkboxImage: require('../images/checkbox-unchecked.png'),
        showIotaLogo: false
      })
    } else {
      this.setState({
        checkboxImage: require('../images/checkbox-checked.png'),
        showIotaLogo: true
      })
    }
  }

  onPrintPress() {

  }

  _renderIotaLogo () {
        if (this.state.showIotaLogo) {
            return (
                <Image style={styles.paperWalletLogo} source={require('../images/iota-full.png')}/>
            );
        } else {
            return null;
        }
    }

  render() {
    return (

      <ImageBackground source={require('../images/bg-green.png')} style={styles.container}>
        <View style={styles.topContainer}>
          <Image source={require('../images/iota-glow.png')} style={styles.iotaLogo} />
          <View style={styles.titleContainer}>
            <Text style={styles.title}>
                                SAVE YOUR SEED
                           </Text>
          </View>
          <View style={styles.subtitlesContainer}>
            <View style={styles.subtitleContainer}>

              <Text style={styles.subtitle}>
                                  Manual Copy
                           </Text>
            </View>
            <View style={styles.lineContainer}>
              <Text style={styles.line}>
                            ────────
                           </Text>
            </View>
            <View style={styles.subtitleContainer}>
              <Text style={styles.currentSubtitle}>
                                   Paper Wallet
                           </Text>
            </View>
            <View style={styles.lineContainer}>
              <Text style={styles.line}>
                            ────────
                           </Text>
            </View>
            <View style={styles.subtitleContainer}>

              <Text style={styles.subtitle}>
                                  Copy To Clipboard
                             </Text>
            </View>
          </View>
          <Text style={styles.infoText}>
            <Text style={styles.infoTextNormal}>Click the button below to print a paper copy of your seed.</Text>
            <Text style={styles.infoTextBold}> Store it safely.</Text>
          </Text>
        </View>
        <View style={styles.midContainer}>
          <View style={styles.paperWalletContainer}>
          <View style={styles.seedBox}>
            <Image source={require('../images/arrow-black.png')} style={styles.arrow}/>
            <View style={styles.seedBoxTextContainer}>
              <View>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(0, 3)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(12, 15)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(24, 27)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(36, 39)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(48, 51)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(60, 63)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(72, 75)}</Text>
              </View>
              <View>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(3, 6)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(15, 18)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(27, 30)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(39, 42)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(51, 54)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(63, 66)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(75, 78)}</Text>
              </View>
              <View>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(6, 9)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(18, 21)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(30, 33)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(42, 45)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(54, 57)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(66, 69)}</Text>
                <Text style={styles.seedBoxTextLeft}>{this.props.iota.seed.substring(78, 81)}</Text>
              </View>
              <View>
                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(9, 12)}</Text>
                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(21, 24)}</Text>
                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(33, 36)}</Text>
                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(45, 48)}</Text>
                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(57, 60)}</Text>
                <Text style={styles.seedBoxTextRight}>{this.props.iota.seed.substring(69, 72)}</Text>
              </View>
            </View>
          </View>
            <View style={styles.paperWalletTextContainer}>
              {this._renderIotaLogo()}
              <Text style={styles.paperWalletText}>
                Your seed is 81 characters, read from left to right.
              </Text>
            </View>
            <QRCode
              value={this.props.iota.seed}
              size={width / 4}
              bgColor="#000"
              fgColor="#FFF"
            />
          </View>
          <TouchableOpacity style={styles.checkboxContainer} onPress={event => this.onCheckboxPress()}>
            <Image source={this.state.checkboxImage} style={styles.checkbox}/>
            <Text style={styles.checkboxText}>IOTA logo</Text>
          </TouchableOpacity>
          <View style={{paddingTop: height / 20}}>
          <TouchableOpacity onPress={event => this.onPrintPress()}>
            <View style={styles.printButton}>
              <Image style={styles.printImage} source={require('../images/plus.png')} />
              <Text style={styles.printText}>PRINT PAPER WALLET</Text>
            </View>
          </TouchableOpacity>
          </View>
        </View>
        <View style={ styles.bottomContainer }>
          <TouchableOpacity onPress={event => this.onDonePress()}>
              <View style={styles.doneButton} >
                <Text style={styles.doneText}>DONE</Text>
              </View>
            </TouchableOpacity>
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
    flex: 1,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height / 30,
    paddingHorizontal: width / 20
  },
  midContainer: {
    flex: 4,
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: height / 7,
  },
  bottomContainer: {
    justifyContent: 'center',
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: height / 30
  },
  optionButtonText: {
    color: '#8BD4FF',
    fontFamily: 'Lato-Light',
    fontSize: width / 25.3,
    textAlign: 'center',
    paddingHorizontal: width / 20,
    backgroundColor: 'transparent',
  },
  optionButton: {
    borderColor: '#8BD4FF',
    borderWidth: 1.5,
    borderRadius: 15,
    width: width / 1.6,
    height: height / 14,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  titleContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height / 35,
    paddingBottom: height / 30,
  },
  title: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 20.25,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  currentSubtitle: {
    color: 'white',
    fontFamily: 'Lato-Light',
    fontSize: width / 33,
    textAlign: 'center',
    backgroundColor: 'transparent',
    flexWrap: 'wrap',
  },
  subtitle: {
    color: 'white',
    fontFamily: 'Lato-Light',
    fontSize: width / 33,
    textAlign: 'center',
    backgroundColor: 'transparent',
    flexWrap: 'wrap',
    opacity: 0.5
  },
  subtitlesContainer: {
    flexDirection: 'row',
    flex: 1,
    paddingTop: height / 40
  },
  subtitleContainer: {
    paddingHorizontal: width / 75,
    flex : 1,
    justifyContent: 'center'
  },
  line: {
    color: 'white',
    fontFamily: 'Lato-Light',
    fontSize: width / 33,
    textAlign: 'center',
    backgroundColor: 'transparent',
    opacity: 0.5
  },
  lineContainer: {
    flex : 1.5,
    justifyContent: 'center'
  },
  infoText: {
    color: 'white',
    fontFamily: 'Lato-Light',
    fontSize: width / 29,
    textAlign: 'left',
    paddingTop: height / 11,
    paddingHorizontal: width / 8,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  infoTextNormal: {
    color: 'white',
    fontFamily: 'Lato-Light',
    fontSize: width / 29,
    textAlign: 'left',
    backgroundColor: 'transparent',
  },
  infoTextBold: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 29,
    textAlign: 'center',
    backgroundColor: 'transparent',
  },
  doneButton: {
    borderColor: '#9DFFAF',
    borderWidth: 1.5,
    borderRadius: 10,
    width: width / 3,
    height: height / 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  doneText: {
    color: '#9DFFAF',
    fontFamily: 'Lato-Light',
    fontSize: width / 25.3,
    backgroundColor: 'transparent',
  },
  backButton: {
    borderColor: '#F7D002',
    borderWidth: 1.5,
    borderRadius: 10,
    width: width / 3,
    height: height / 16,
    alignItems: 'center',
    justifyContent: 'space-around',
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
  printButton: {
    flexDirection: 'row',
    borderColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1.5,
    borderRadius: 8,
    width: width / 2,
    height: height / 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#009f3f',
  },
  printText: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 40.5,
    backgroundColor: 'transparent',
    paddingLeft: 6,
  },
  printImage: {
    height: width / 30,
    width: width / 30,
  },
  paperWalletContainer: {
    width: width / 1.1,
    height: height / 5,
    backgroundColor: 'white',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around'
  },
  seedBox: {
    borderColor: 'black',
    borderWidth: 1,
    borderRadius: 15,
    width: width / 3.4,
    height: height / 6.3,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height / 100,
  },
  seedBoxTextContainer: {
    width: width / 1.65,
    height: height / 3.5,
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'center',
    paddingTop: height / 200,
  },
  seedBoxTextLeft: {
    color: 'black',
    fontFamily: 'Inconsolata-Bold',
    fontSize: width / 40,
    textAlign: 'justify',
    letterSpacing: 2,
    backgroundColor: 'transparent',
    paddingRight: width / 70,
    paddingVertical: 1,
  },
  seedBoxTextRight: {
    color: 'black',
    fontFamily: 'Inconsolata-Bold',
    fontSize: width / 40,
    textAlign: 'justify',
    letterSpacing: 2,
    backgroundColor: 'transparent',
    paddingVertical: 1
  },
  arrow: {
    width: width / 4,
    height: height / 160
  },
  paperWalletTextContainer: {
    width: width / 5,
    height: height / 6.5,
    justifyContent: 'flex-start',
    alignItems: 'center',
    paddingBottom: height / 4,
  },
  paperWalletText: {
    color: 'black',
    fontSize: width / 40,
    fontFamily: 'Lato-Regular',
    textAlign: 'center',
    position: 'absolute',
    paddingTop: height / 10,
    backgroundColor: 'transparent'
  },
  paperWalletLogo: {
    resizeMode: 'contain',
    width: width / 7,
    height: height / 20,
    paddingBottom: height / 10
  },
  checkboxContainer: {
    height: height / 15,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: height / 50,
  },
  checkbox: {
    width: width / 30,
    height: width / 30,
  },
  checkboxText: {
    fontFamily: 'Lato-Light',
    fontSize: width / 30,
    color: 'white',
    backgroundColor: 'transparent',
    paddingLeft: 5
  }
});

const mapStateToProps = state => ({
  iota: state.iota,
});

export default connect(mapStateToProps)(PaperWallet);
