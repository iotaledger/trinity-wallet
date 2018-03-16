import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import * as Progress from 'react-native-progress';
import { width, height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginBottom: height / 30,
    },
    text: {
        color: 'white',
        marginBottom: height / 40,
        fontFamily: 'Lato-Light',
    },
});

const ProgressBar = (props) => {
    return (
        <View style={styles.container}>
            <Text style={[styles.text, { color: props.textColor }]}>{props.children}</Text>
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
    progress: PropTypes.number.isRequired,
    children: PropTypes.node,
    color: PropTypes.string,
    indeterminate: PropTypes.bool,
    animationType: PropTypes.string,
    width: PropTypes.number,
    height: PropTypes.number,
    textColor: PropTypes.string,
};

ProgressBar.defaultProps = {
    animationType: 'timing',
    width: width / 2,
    height: height / 40,
    indeterminate: false,
    color: 'rgba(247, 208, 2, 0.75)',
    textColor: 'rgba(247, 208, 2, 0.75)',
};

export default ProgressBar;
