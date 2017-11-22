import map from 'lodash/map';
import filter from 'lodash/filter';
import size from 'lodash/size';
import React, { Component } from 'react';
import PropTypes from 'prop-types';
import {
    View,
    Text,
    StyleSheet,
    Image,
    TouchableOpacity,
    Dimensions,
    ScrollView,
    TouchableWithoutFeedback,
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

    static propTypes = {
        active: PropTypes.bool.isRequired,
        selectedTitle: PropTypes.string.isRequired,
        selectedSubtitle: PropTypes.string.isRequired,
        currentSeedIndex: PropTypes.number.isRequired,
        titles: PropTypes.array.isRequired,
        currentRoute: PropTypes.string.isRequired,
        toggle: PropTypes.func.isRequired,
        onChange: PropTypes.func.isRequired,
    };

    componentDidMount() {
        if (this.props.active) {
            this.props.toggle(); // Close dropdown in case its opened
        }
    }

    componentWillReceiveProps(newProps) {
        if (this.props.currentRoute !== newProps.currentRoute) {
            // Detects if navigating across screens
            if (this.props.active) {
                // In case the dropdown is active
                this.props.toggle();
            }
        }
    }

    filterSeedTitles(seedNames, currentSeedIndex) {
        return filter(seedNames, (t, i) => i !== currentSeedIndex);
    }

    renderTitles() {
        const { active, selectedTitle, selectedSubtitle, currentSeedIndex, titles, onChange, toggle } = this.props;

        const baseContent = (
            <View style={styles.titleWrapper}>
                <TouchableWithoutFeedback>
                    <View>
                        <Text style={styles.mainTitle}>{selectedTitle}</Text>
                        <Text style={styles.subtitle}>{selectedSubtitle}</Text>
                    </View>
                </TouchableWithoutFeedback>
            </View>
        );

        if (!active) {
            return baseContent;
        }

        const withoutSelectedTitle = this.filterSeedTitles(titles, currentSeedIndex);
        const restContent = map(withoutSelectedTitle, (t, idx) => {
            const isLast = idx === size(withoutSelectedTitle) - 1;
            const children = (
                <TouchableOpacity
                    onPress={() => {
                        toggle(); // Close
                        onChange(t.index);
                    }}
                    key={idx}
                    style={{ width: width, alignItems: 'center' }}
                >
                    <Text style={styles.mainTitle}>{t.title}</Text>
                    <Text style={styles.subtitle}>{t.subtitle}</Text>
                </TouchableOpacity>
            );

            if (isLast) {
                return children;
            }

            return (
                <View key={idx} style={styles.centralView}>
                    {children}
                    <View style={styles.separator} />
                </View>
            );
        });

        return (
            <View style={styles.titleWrapper}>
                {baseContent}
                {size(withoutSelectedTitle) ? <View style={styles.separator} /> : null}
                {restContent}
            </View>
        );
    }

    render() {
        const { titles, currentSeedIndex, active, toggle } = this.props;
        const iconProps = TopBar.getIconPath(active);
        const children = this.renderTitles();
        const hasMultipleSeeds = size(this.filterSeedTitles(titles, currentSeedIndex));

        return (
            <TouchableWithoutFeedback onPress={toggle}>
                <View style={styles.container}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                        <ScrollView style={styles.scrollViewContainer}>{children}</ScrollView>
                        <View style={styles.chevronWrapper}>
                            {hasMultipleSeeds ? (
                                <Image style={styles.chevron} {...iconProps} />
                            ) : (
                                <View style={styles.chevron} />
                            )}
                        </View>
                    </View>
                </View>
            </TouchableWithoutFeedback>
        );
    }
}

const styles = StyleSheet.create({
    container: {
        position: 'absolute',
        width,
        elevation: 7,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        paddingTop: height / 25,
        paddingBottom: height / 50,
        opacity: 0.98,
        backgroundColor: '#071f28',
        paddingLeft: width / 10,
        shadowColor: '#071f28',
        shadowOffset: {
            width: 0,
            height: -1,
        },
        shadowRadius: 4,
        shadowOpacity: 1.0,
    },
    titleWrapper: {
        paddingHorizontal: width / 40,
        alignItems: 'center',
        justifyContent: 'center',
    },
    mainTitle: {
        fontFamily: 'Lato-Regular',
        fontSize: width / 24.4,
        color: '#ffffff',
        paddingBottom: height / 170,
    },
    subtitle: {
        textAlign: 'center',
        fontFamily: 'Lato-Regular',
        fontSize: width / 27.6,
        color: '#d3d3d3',
    },
    centralView: {
        alignItems: 'center',
    },
    chevronWrapper: {
        justifyContent: 'center',
        alignItems: 'center',
    },
    chevron: {
        height: width / 20,
        width: width / 20,
        marginRight: width / 20,
    },
    separator: {
        width: width / 2,
        marginVertical: height / 60,
        height: 1,
        borderBottomWidth: 0.25,
        borderBottomColor: 'white',
    },
    scrollViewContainer: {
        maxHeight: height / 3.5,
    },
});
