/* global Electron */
import { PureComponent } from 'react';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';

import { getMarketData, getChartData, getPrice, setTimeframe } from 'actions/marketData';
import { setOnboardingComplete, accountInfoFetchSuccess } from 'actions/accounts';
import { updateTheme } from 'actions/settings';

import { getThemeFromState } from 'selectors/global';
import themes from 'themes/themes';

const routes = [
    '/onboarding',
    '/settings/node',
    '/onboarding/seed-intro',
    '/onboarding/seed-generate',
    '/onboarding/account-password',
    '/onboarding/seed-save',
    '/onboarding/done',
    '/onboarding/login',
    '/wallet',
];

/**
 * Theming style provider component
 */
class Theme extends PureComponent {
    static propTypes = {
        /** @ignore */
        history: PropTypes.object,
        /** @ignore */
        theme: PropTypes.object.isRequired,
        /** @ignore */
        themeName: PropTypes.string.isRequired,
        /** @ignore */
        updateTheme: PropTypes.func.isRequired,
        /** @ignore */
        setOnboardingComplete: PropTypes.func.isRequired,
        /** @ignore */
        accountInfoFetchSuccess: PropTypes.func.isRequired,
        /** @ignore */
        getChartData: PropTypes.func.isRequired,
        /** @ignore */
        getPrice: PropTypes.func.isRequired,
        /** @ignore */
        getMarketData: PropTypes.func.isRequired,
        /** @ignore */
        setTimeframe: PropTypes.func.isRequired,
    };

    state = {
        themeIndex: 0,
        originalTheme: 'Default',
        routeIndex: 0,
    };

    componentDidMount() {
        this.updateTheme(this.props.theme);

        if (Electron.mode === 'puppeteer') {
            this.timeout = setTimeout(this.takeShot.bind(this), 4000);
        }
    }

    componentWillReceiveProps(nextProps) {
        if (this.props.themeName !== nextProps.themeName) {
            this.updateTheme(nextProps.theme);
        }
    }

    componentWillUnmount() {
        if (this.timeout) {
            clearTimeout(this.timeout);
        }
    }

    onKeyDown(e) {
        if ((e.metaKey || e.ctrlKey) && e.key === 'p') {
            this.setState({
                themeIndex: 0,
                originalTheme: this.props.themeName,
            });
            this.takeShot();
        }
    }

    /**
     * Application view screenshot trigger, enabled only in development mode
     * @returns {undefined}
     */
    takeShot() {
        const { originalTheme, themeIndex, routeIndex } = this.state;

        const themeNames = Object.keys(themes);

        if (themeIndex >= themeNames.length) {
            this.props.updateTheme(originalTheme);

            if (routeIndex >= routes.length - 1) {
                Electron.screenshotsDone();
                return;
            }

            if (routeIndex === 0) {
                this.props.getPrice();
                this.props.getChartData();
                this.props.getMarketData();
            }

            if (routes[routeIndex + 1] === '/onboarding/login') {
                this.props.setOnboardingComplete(true);
                this.props.setTimeframe('1h');
            }

            if (routes[routeIndex + 1] === '/wallet') {
                this.props.accountInfoFetchSuccess({
                    accountName: 'Main',
                    balance: 45000000,
                    addresses: [],
                    hashes: [],
                    transfers: {
                        A99999999999999999999999999999999999999999999999999999999999999999999999999999999: {
                            attachmentTimestamp: 1526640939097,
                            bundle: 'B99999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            hash: 'C99999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            incoming: true,
                            inputs: [],
                            message: 'Trinity',
                            outputs: [],
                            persistence: true,
                            tailTransactions: [],
                            timestamp: 1526640178,
                            transferValue: 25000000,
                        },
                        D99999999999999999999999999999999999999999999999999999999999999999999999999999999: {
                            attachmentTimestamp: 1526640939098,
                            bundle: 'E99999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            hash: 'F99999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            incoming: false,
                            inputs: [],
                            message: 'Trinity',
                            outputs: [],
                            persistence: true,
                            tailTransactions: [],
                            timestamp: 1526640178,
                            transferValue: 25000000,
                        },
                        G99999999999999999999999999999999999999999999999999999999999999999999999999999999: {
                            attachmentTimestamp: 1526640939099,
                            bundle: 'H99999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            hash: 'I99999999999999999999999999999999999999999999999999999999999999999999999999999999',
                            incoming: true,
                            inputs: [],
                            message: 'Trinity',
                            outputs: [],
                            persistence: false,
                            tailTransactions: [],
                            timestamp: 1526640178,
                            transferValue: 25000000,
                        },
                    },
                    unconfirmedBundleTails: {},
                });
            }

            return this.setState(
                {
                    routeIndex: routeIndex + 1,
                    themeIndex: 0,
                },
                () => {
                    setTimeout(() => {
                        this.props.history.push(routes[routeIndex + 1]);
                        this.takeShot();
                    }, 5000);
                },
            );
        }

        const themeName = themeNames[themeIndex];
        const fileName = `${routes[routeIndex].substr(1).replace(/\//g, '-')}_${themeName
            .replace(/ /g, '_')
            .toLowerCase()}`;

        this.setState({
            themeIndex: themeIndex + 1,
        });

        this.props.updateTheme(themeName);

        setTimeout(() => {
            Electron.screenshot(fileName);
        }, 500);

        setTimeout(this.takeShot.bind(this), 1000);
    }

    updateTheme(theme) {
        Object.keys(theme).forEach((colorsName) => {
            const colorSet = theme[colorsName];

            Object.keys(colorSet).forEach((colorName) => {
                if (colorName === 'color') {
                    document.documentElement.style.setProperty(`--${colorsName}`, colorSet.color);
                } else {
                    document.documentElement.style.setProperty(`--${colorsName}-${colorName}`, colorSet[colorName]);
                }
            });
        });
    }

    render() {
        return null;
    }
}

const mapStateToProps = (state) => ({
    theme: getThemeFromState(state),
    themeName: state.settings.themeName,
});

const mapDispatchToProps = {
    updateTheme,
    setOnboardingComplete,
    accountInfoFetchSuccess,
    getChartData,
    getPrice,
    getMarketData,
    setTimeframe,
};

export default connect(mapStateToProps, mapDispatchToProps)(Theme);
