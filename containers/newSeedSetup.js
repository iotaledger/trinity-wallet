import React from 'react';
import {
  StyleSheet,
  View,
  Dimensions,
  Text,
  TouchableHighlight,
  ImageBackground,
  ListView,
  TouchableOpacity,
  TouchableWithoutFeedback,
  Image,
} from 'react-native';
import { connect } from 'react-redux';
import { setSeed, randomiseSeed } from '../actions/iotaActions';
import { randomBytes } from 'react-native-randombytes'


const { height, width } = Dimensions.get('window');

{ /* import sjcl from "sjcl";

const randArray = length => {
  return sjcl.random.randomWords(length, 10);
}; */ }

const ds = new ListView.DataSource({ rowHasChanged: (r1, r2) => r1 !== r2 });

class NewSeedSetup extends React.Component {

  constructor(props) {
    super(props);
  }

  onNextClick() {
    this.props.navigator.push({
      screen: 'saveYourSeed',
      navigatorStyle: { navBarHidden: true, screenBackgroundImageName: 'bg-green.png' },
      animated: false,
    });
  }

  onBackClick() {
    this.props.navigator.pop({
      animated: false,
    });
  }

  onItemClick(sectionID) {
    console.log(width)
    console.log(height)
    const charset = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ9';
      randomBytes(5, (error, bytes) => {
        if(!error) {
          var i = 0;
          let seed = this.props.iota.seed
          Object.keys(bytes).map(function(key, index) {
            if(bytes[key] < 243 && i < 1){
              let randomNumber = bytes[key] % 27;
              let randomLetter = charset.charAt(randomNumber);
              let substr1 = seed.substr(0, sectionID);
              sectionID++;
              let substr2 = seed.substr(sectionID, 80);
              seed = substr1 + randomLetter + substr2;
              i++;
            }
          });
          this.props.setSeed(seed)
        } else {
          console.log(error);
        }
      });
  }

  render() {
    return (
      <ImageBackground source={require('../images/bg-green.png')} style={styles.container}>
        <View style={styles.topContainer}>
          <Image source={require('../images/iota-glow.png')} style={styles.iotaLogo} />
          <View style={styles.textContainer}>
            <Text style={styles.title}>
                                GENERATE A NEW SEED
                           </Text>
          </View>
          <TouchableOpacity onPress={event => this.props.randomiseSeed()} style={{ paddingBottom: height / 80 }}>
            <View style={styles.generateButton} >
              <Image style={styles.generateImage} source={require('../images/plus.png')} />
              <Text style={styles.generateText}>GENERATE NEW SEED</Text>
            </View>
          </TouchableOpacity>
          <Text style={styles.infoText}>
                          Press individual letters to randomise them.
                       </Text>
        </View>
        <View style={ styles.midContainer }>
          <ListView
            contentContainerStyle={styles.list}
            dataSource={ds.cloneWithRows(this.props.iota.seed)}
            renderRow={(rowData, rowID, sectionID) =>
                             (<TouchableHighlight  key={sectionID} onPress={event => this.onItemClick(sectionID)} underlayColor="#F7D002">
                               <View style={styles.tile}>
                                <Text style={styles.item}>{rowData}</Text>
                               </View>
                             </TouchableHighlight>)
                            }
            style={ styles.squareContainer }
            initialListSize={81}
            scrollEnabled={false}
          />
        </View>
        <View style={ styles.bottomContainer }>
          <Text style={styles.infoText}>
                         Seeds are 81 characters long, and contain capital letters A-Z, or the number 9.
                      </Text>
          <Text style={styles.warningText}>
                         NEVER SHARE YOUR SEED WITH ANYONE
                      </Text>
          <View style={styles.buttonsContainer}>
             <View style={styles.backButtonContainer}>
                <TouchableWithoutFeedback onPress={event => this.onBackClick()}>
                  <View style={styles.backButton} >
                    <Text style={styles.backText}>GO BACK</Text>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            <TouchableWithoutFeedback onPress={event => this.onNextClick()}>
                <View style={styles.nextButton} >
                  <Text style={styles.nextText}>NEXT</Text>
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
    alignItems: 'center',
    backgroundColor: '#102e36',
  },
  topContainer: {
    flex: 2.3,
    alignItems: 'center',
    justifyContent: 'flex-start',
    paddingTop: height / 30,
  },
  midContainer: {
    flex: 4.2,
    paddingTop: height / 40
  },
  bottomContainer: {
    flex: 1.5,
    justifyContent: 'flex-end',
    paddingBottom: height / 30,
    paddingHorizontal: width / 5
  },
  squareContainer: {
    flex: 1,
    height: width / 1.1 ,
    width: width / 1.1,

  },
  list: {
    justifyContent: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  item: {
    backgroundColor: 'white',
    width: width / 14,
    height: width / 14,
    color: '#1F4A54',
    fontFamily: 'Lato-Bold',
    fontSize: width / 28.9,
    textAlign: 'center',
    paddingTop: height / 130
  },
  tile: {
    padding: height / 150,
    justifyContent: 'center',
    alignItems: 'center',
  },
  textContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: width / 7,
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
  infoText: {
    color: 'white',
    fontFamily: 'Lato-Light',
    fontSize: width / 33.75,
    textAlign: 'center',
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
  generateButton: {
    flexDirection: 'row',
    borderColor: 'rgba(255,255,255,0.6)',
    borderWidth: 1.5,
    borderRadius: 8,
    width: width / 2.5,
    height: height / 20,
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#009f3f',
  },
  generateText: {
    color: 'white',
    fontFamily: 'Lato-Bold',
    fontSize: width / 40.5,
    backgroundColor: 'transparent',
    paddingRight: 10,
  },
  buttonsContainer: {
    alignItems: 'flex-end',
    justifyContent: 'center',
    flexDirection: 'row'
  },
  nextButton: {
    borderColor: '#9DFFAF',
    borderWidth: 1.5,
    borderRadius: 10,
    width: width / 3,
    height: height / 16,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
  nextText: {
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
  backButtonContainer: {
    paddingRight: width / 16,
    paddingTop: height / 60
  },
  backText: {
    color: '#F7D002',
    fontFamily: 'Lato-Light',
    fontSize: width / 25.3,
    backgroundColor: 'transparent',
  },
  generateImage: {
    height: width / 30,
    width: width / 30,
  },
  iotaLogo: {
    height: width / 6,
    width: width / 6,
  },

});

const mapStateToProps = state => ({
  iota: state.iota,
});

const mapDispatchToProps = dispatch => ({
  setSeed: (seed) => {
    dispatch(setSeed(seed));
  },
  randomiseSeed: () => {
    dispatch(randomiseSeed());
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(NewSeedSetup);
