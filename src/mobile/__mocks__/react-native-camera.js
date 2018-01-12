import React from 'react';

const constants = (constants = {
    Aspect: {},
    BarCodeType: {},
    Type: {},
    CaptureMode: {},
    CaptureTarget: {},
    CaptureQuality: {},
    Orientation: {},
    FlashMode: {},
    TorchMode: {},
});

class Camera extends React.Component {
    static constants = constants;
    render() {
        return null;
    }
}

Camera.constants = constants;

export default Camera;
