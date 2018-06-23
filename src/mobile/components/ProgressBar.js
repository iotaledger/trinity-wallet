import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import * as Progress from 'react-native-progress';
import { width, height } from '../utils/dimensions';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: height / 30,
    },
    textWrapper: {
        flex: 0.7,
    },
    text: {
        color: 'white',
        marginBottom: height / 40,
        fontFamily: 'SourceSansPro-Light',
    },
});

const ProgressBar = (props) => {
    return (
        <View style={styles.container}>
            <View style={[styles.textWrapper, props.style.textWrapper]}>
                <Text style={[styles.text, { color: props.textColor }]}>{props.children}</Text>
            </View>
            <Progress.Bar
                indeterminate={props.indeterminate}
                useNativeDriver={true} // eslint-disable-line react/jsx-boolean-value
                progress={props.progress}
                animationType={props.animationType}
                style={{ width: props.width, height: props.height, borderRadius: height / 10 }}
                height={props.height}
                width={props.width}
                color={props.color}
            />
        </View>
    );
};

ProgressBar.propTypes = {
    /** Progress percentage number */
    progress: PropTypes.number.isRequired,
    /** Children content */
    children: PropTypes.node,
    /** Bar color */
    color: PropTypes.string,
    /** When true, progress prop will be ignored */
    indeterminate: PropTypes.bool,
    /** Type of animation for progress bar */
    animationType: PropTypes.string,
    /** Progress bar width */
    width: PropTypes.number,
    /** Progress bar height */
    height: PropTypes.number,
    /** Progress bar text color */
    textColor: PropTypes.string,
    /** Default style object */
    style: PropTypes.object,
};

ProgressBar.defaultProps = {
    animationType: 'timing',
    width: width / 2,
    height: height / 40,
    indeterminate: false,
    color: 'rgba(247, 208, 2, 0.75)',
    textColor: 'rgba(247, 208, 2, 0.75)',
    style: {
        textWrapper: {},
    },
};

export default ProgressBar;
