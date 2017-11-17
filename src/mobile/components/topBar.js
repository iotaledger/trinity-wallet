import map from 'lodash/map';
import size from 'lodash/size';
import React, { Component } from 'react';
import {
    View,
    Text,
    StyleSheet,
    Image,
    Modal,
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

    renderTitles() {
        const { active, selectedTitle, selectedSubtitle, titles, onChange, toggle } = this.props;

        console.log(titles);
        if (active) {
            return (
                <View style={styles.titleWrapper}>
                    <Text style={styles.mainTitle}>{selectedTitle}</Text>
                    <Text style={styles.subtitle}>{selectedSubtitle}</Text>
                </View>
            );
        }

        return map(titles, (t, idx) => {
            const isLastTitle = idx === size(titles) - 1;
            return (
                <View style={styles.titleWrapper} key={idx}>
                    <TouchableOpacity
                        onPress={() => {
                            toggle(); // CLose
                            onChange(t.index);
                        }}
                    >
                        <Text style={styles.mainTitle}>{t.title}</Text>
                        <Text style={styles.subtitle}>{t.subtitle}</Text>
                    </TouchableOpacity>
                    {!isLastTitle && <Text style={styles.separator} />}
                </View>
            );
        });
    }

    render() {
        const { active, toggle } = this.props;
        const iconProps = TopBar.getIconPath(active);

        const children = this.renderTitles();
        return (
            <View style={styles.container}>
                <ScrollView style={{ maxHeight: height / 3.5 }}>{children}</ScrollView>
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
        zIndex: 1,
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
        fontFamily: 'Lato-Regular',
        fontSize: width / 20.7,
        color: '#ffffff',
    },
    subtitle: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 22.7,
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
