import get from 'lodash/get';
import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    TouchableWithoutFeedback,
    Dimensions,
    ScrollView,
} from 'react-native';

const { height, width } = Dimensions.get('window');

export default class TopBar extends Component {
    static getIconPath(isActive) {
        if (isActive) {
            return {
                source: require('../../shared/images/chevron-up.png'),
            };
        }

        return {
            source: require('../../shared/images/chevron-down.png'),
        };
    }

    render() {
        const { active, toggle } = this.props;
        const iconProps = TopBar.getIconPath(active);

        return (
            <View style={styles.container}>
                <ScrollView style={{ maxHeight: height / 3.5 }}>
                    <View style={styles.titleWrapper}>
                        <Text style={styles.mainTitle}>MAIN WALLET</Text>
                        <Text style={styles.subtitle}>7.9+ Gi</Text>
                        {/*<Text style={styles.separator} />*/}
                    </View>
                    {/*<View style={styles.titleWrapper}>*/}
                    {/*<Text style={styles.mainTitle}>SECOND WALLET</Text>*/}
                    {/*<Text style={styles.subtitle}>7.9+ Gi</Text>*/}
                    {/*<Text style={styles.separator} />*/}
                    {/*</View>*/}
                    {/*<View style={styles.titleWrapper}>*/}
                    {/*<Text style={styles.mainTitle}>THIRD WALLET</Text>*/}
                    {/*<Text style={styles.subtitle}>7.9+ Gi</Text>*/}
                    {/*<Text style={styles.separator} />*/}
                    {/*</View>*/}
                    {/*<View style={styles.titleWrapper}>*/}
                    {/*<Text style={styles.mainTitle}>FOURTH WALLET</Text>*/}
                    {/*<Text style={styles.subtitle}>7.9+ Gi</Text>*/}
                    {/*</View>*/}
                </ScrollView>
                <View style={styles.chevronWrapper}>
                    <TouchableOpacity onPress={toggle}>
                        <Image style={styles.chevron} {...iconProps} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width,
        elevation: 100,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingVertical: height / 80,
        opacity: 0.9,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    titleWrapper: {
        paddingHorizontal: width / 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainTitle: {
        fontFamily: 'Lato-Heavy',
        fontSize: width / 20.7,
        color: '#ffffff',
    },
    subtitle: {
        fontFamily: 'Lato-Heavy',
        fontSize: width / 32.7,
        color: '#d3d3d3',
    },
    chevronWrapper: {
        position: 'absolute',
        top: height / 40,
        right: width / 20,
    },
    chevron: {
        height: width / 20,
        width: width / 20,
    },
    separator: {
        borderBottomColor: '#ffffff',
        borderBottomWidth: 0.4,
        borderStyle: 'dotted',
        width: width / 3,
        marginTop: width / 60,
        marginBottom: width / 50,
    },
});
