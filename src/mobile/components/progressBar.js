import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import * as Progress from 'react-native-progress';
import { height } from '../util/dimensions';

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        marginTop: height / 50,
    },
    text: {
        color: 'white',
        marginTop: height / 50,
        fontFamily: 'Lato-Light',
    },
});

const ProgressBar = (props) => {
    return (
        <View style={styles.container}>
            <Progress.Bar
                indeterminate={props.indeterminate}
                useNativeDriver={true} // eslint-disable-line react/jsx-boolean-value
                progress={props.progress}
                animationType={props.animationType}
                width={props.width}
                color={props.color}
            />
            <Text style={[styles.text, { color: props.color }]}>{props.children}</Text>
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
};

ProgressBar.defaultProps = {
    animationType: 'timing',
    width: 200,
    indeterminate: false,
    color: 'rgba(247, 208, 2, 0.75)',
};

export default ProgressBar;
