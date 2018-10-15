import map from 'lodash/map';
import React, { Component } from 'react';
import { withNamespaces } from 'react-i18next';
import { StyleSheet, View, Text, TouchableOpacity, Image, ScrollView } from 'react-native';
import PropTypes from 'prop-types';
import { Navigation } from 'react-native-navigation';
import whiteCheckboxCheckedImagePath from 'shared-modules/images/checkbox-checked-white.png';
import whiteCheckboxUncheckedImagePath from 'shared-modules/images/checkbox-unchecked-white.png';
import blackCheckboxCheckedImagePath from 'shared-modules/images/checkbox-checked-black.png';
import blackCheckboxUncheckedImagePath from 'shared-modules/images/checkbox-unchecked-black.png';
import { connect } from 'react-redux';
import tinycolor from 'tinycolor2';
import DualFooterButtons from 'ui/components/DualFooterButtons';
import InfoBox from 'ui/components/InfoBox';
import Header from 'ui/components/Header';
import { Styling } from 'ui/theme/general';
import { Icon } from 'ui/theme/icons';
import { isAndroid } from 'libs/device';
import { leaveNavigationBreadcrumb } from 'libs/bugsnag';
import { width, height } from 'libs/dimensions';

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    topContainer: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'flex-start',
        paddingTop: height / 16,
    },
    midContainer: {
        flex: 3,
        alignItems: 'center',
    },
    bottomMidContainer: {
        flex: 1,
        justifyContent: 'flex-start',
    },
    bottomContainer: {
        flex: 0.5,
        alignItems: 'center',
        justifyContent: 'flex-end',
    },
    checkboxContainer: {
        height: height / 15,
        flexDirection: 'row',
        paddingTop: height / 50,
    },
    checkbox: {
        width: width / 20,
        height: width / 20,
    },
    checkboxText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: Styling.fontSize4,
        color: 'white',
        backgroundColor: 'transparent',
        marginLeft: width / 40,
    },
    infoText: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextNormal: {
        fontFamily: 'SourceSansPro-Light',
        fontSize: width / 27.6,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoTextBold: {
        fontFamily: 'SourceSansPro-Bold',
        fontSize: width / 27.6,
        textAlign: 'left',
        backgroundColor: 'transparent',
    },
    infoBox: {
        maxHeight: height / 3.7,
    },
});

/** Seed Seed Confirmation component */
class SaveSeedConfirmation extends Component {
    static propTypes = {
        /** Component ID */
        componentId: PropTypes.string.isRequired,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        t: PropTypes.func.isRequired,
    };

    constructor(props) {
        super(props);

        const checkBoxImagePath = tinycolor(props.theme.body.bg).isDark()
            ? whiteCheckboxUncheckedImagePath
            : blackCheckboxUncheckedImagePath;

        this.state = {
            checkBoxesDetails: [
                {
                    path: checkBoxImagePath,
                    text: this.props.t('saveSeedConfirmation:alreadyHave'),
                },
                {
                    path: checkBoxImagePath,
                    text: this.props.t('global:willNotCopyPasteSeed'),
                },
            ],
            hasSavedSeed: false,
            hasAgreedToNotCopyPaste: !isAndroid,
            showCheckbox: false,
        };
    }

    componentDidMount() {
        leaveNavigationBreadcrumb('SaveSeedConfirmation');
        this.timeout = setTimeout(this.onTimerComplete.bind(this), 3000);
    }

    onTimerComplete() {
        this.setState({ showCheckbox: true });
    }

    onBackPress() {
        Navigation.pop(this.props.componentId);
    }

    onNextPress() {
        const { theme: { body } } = this.props;
        const { hasSavedSeed, hasAgreedToNotCopyPaste } = this.state;
        if (hasSavedSeed && hasAgreedToNotCopyPaste) {
            Navigation.push('appStack', {
                component: {
                    name: 'seedReentry',
                    options: {
                        animations: {
                            push: {
                                enable: false,
                            },
                            pop: {
                                enable: false,
                            },
                        },
                        layout: {
                            backgroundColor: body.bg,
                            orientation: ['portrait'],
                        },
                        topBar: {
                            visible: false,
                            drawBehind: true,
                            elevation: 0,
                        },
                        statusBar: {
                            drawBehind: true,
                            backgroundColor: body.bg,
                        },
                    },
                },
            });
        }
    }

    onCheckboxPress(checkboxIndex) {
        const isFirstCheckbox = checkboxIndex === 0;
        const setCheckboxImagePath = (checkBoxDetail, idx) => ({
            ...checkBoxDetail,
            path: idx === checkboxIndex ? this.getCheckboxImagePath(checkboxIndex) : checkBoxDetail.path,
        });

        this.setState({
            checkBoxesDetails: map(this.state.checkBoxesDetails, setCheckboxImagePath),
            ...(isFirstCheckbox
                ? { hasSavedSeed: !this.state.hasSavedSeed }
                : { hasAgreedToNotCopyPaste: !this.state.hasAgreedToNotCopyPaste }),
        });
    }

    getCheckboxImagePath(checkboxIndex) {
        const { theme: { body } } = this.props;
        const checkboxUncheckedImagePath = tinycolor(body.bg).isDark()
            ? whiteCheckboxUncheckedImagePath
            : blackCheckboxUncheckedImagePath;
        const checkboxCheckedImagePath = tinycolor(body.bg).isDark()
            ? whiteCheckboxCheckedImagePath
            : blackCheckboxCheckedImagePath;

        return this.state.checkBoxesDetails[checkboxIndex].path === checkboxCheckedImagePath
            ? checkboxUncheckedImagePath
            : checkboxCheckedImagePath;
    }

    renderInfoBoxContent() {
        const { t, theme: { body } } = this.props;
        const textColor = { color: body.color };

        return (
            <ScrollView style={styles.infoBox} scrollEnabled={isAndroid}>
                <Text style={[styles.infoText, textColor, { paddingTop: height / 80 }]}>
                    <Text style={styles.infoTextBold}>{t('reenterSeed')}</Text>
                </Text>
                <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                    <Text style={styles.infoTextNormal}>{t('reenterSeedWarning')}</Text>
                </Text>
                {isAndroid && (
                    <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>
                        <Text style={styles.infoTextNormal}>{t('global:androidInsecureClipboardWarning')} </Text>
                        <Text style={styles.infoTextBold}>{t('global:androidCopyPasteWarning')}</Text>
                    </Text>
                )}
                <Text style={[styles.infoText, textColor, { paddingTop: height / 50 }]}>{t('pleaseConfirm')}</Text>
            </ScrollView>
        );
    }

    render() {
        const { t, theme: { body } } = this.props;
        const { hasSavedSeed, hasAgreedToNotCopyPaste } = this.state;
        const textColor = { color: body.color };
        const opacity = hasSavedSeed && hasAgreedToNotCopyPaste ? 1 : 0.4;
        const isSecondCheckbox = (idx) => idx === 1;

        return (
            <View style={[styles.container, { backgroundColor: body.bg }]}>
                <View style={styles.topContainer}>
                    <Icon name="iota" size={width / 8} color={body.color} />
                    <View style={{ flex: 0.7 }} />
                    <Header textColor={body.color}>{t('didSaveSeed')}</Header>
                </View>
                <View style={styles.midContainer}>
                    <View style={{ flex: 0.3 }} />
                    <InfoBox body={body} width={width / 1.1} text={this.renderInfoBoxContent()} />
                    <View style={{ flex: 0.3 }} />
                    <View style={styles.bottomMidContainer}>
                        {this.state.showCheckbox ? (
                            <View>
                                {map(this.state.checkBoxesDetails, (detail, idx) => {
                                    if (!isAndroid && isSecondCheckbox(idx)) {
                                        return null;
                                    }

                                    return (
                                        <TouchableOpacity
                                            key={idx}
                                            style={styles.checkboxContainer}
                                            onPress={() => this.onCheckboxPress(idx)}
                                        >
                                            <Image source={detail.path} style={styles.checkbox} />
                                            <Text style={[styles.checkboxText, textColor]}>{detail.text}</Text>
                                        </TouchableOpacity>
                                    );
                                })}
                            </View>
                        ) : (
                            <View style={{ flex: 1.2 }} />
                        )}
                    </View>
                </View>
                <View style={styles.bottomContainer}>
                    <DualFooterButtons
                        onLeftButtonPress={() => this.onBackPress()}
                        onRightButtonPress={() => this.onNextPress()}
                        leftButtonText={t('global:goBack')}
                        rightButtonText={t('global:continue')}
                        rightButtonStyle={{ wrapper: { opacity } }}
                    />
                </View>
            </View>
        );
    }
}

const mapStateToProps = (state) => ({
    theme: state.settings.theme,
});

export default withNamespaces(['saveSeedConfirmation', 'global'])(connect(mapStateToProps)(SaveSeedConfirmation));
