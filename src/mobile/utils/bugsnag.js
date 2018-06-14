import { Client, Configuration } from 'bugsnag-react-native';
import packageJson from '../package';

const configuration = new Configuration();
configuration.appVersion = packageJson.version;

const bugsnag = new Client(configuration);

export const leaveNavigationBreadcrumb = (component) => {
    bugsnag.leaveBreadcrumb('Navigated to ' + component, {
        type: 'navigation',
        component: component,
    });
};
