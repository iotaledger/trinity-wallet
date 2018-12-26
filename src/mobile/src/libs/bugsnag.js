import { Client, Configuration } from 'bugsnag-react-native';
import packageJson from '../../package';

const configuration = new Configuration();
configuration.appVersion = packageJson.version;

export const bugsnag = new Client(configuration);

/**
 * Leaves navigation breadcrumbs to help determine what screen an error occurred on
 * If an error occurs, the most recent breadcrumbs are attached along with the crash report
 * @param  {string} component Component name
 */
export const leaveNavigationBreadcrumb = (component) => {
    bugsnag.leaveBreadcrumb('Navigated to ' + component, {
        type: 'navigation',
        component: component,
    });
};
