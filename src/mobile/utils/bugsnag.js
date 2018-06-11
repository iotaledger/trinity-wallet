import { isIOS } from './device';
import { breadcrumbIOS } from './bugsnagIOS';
import { breadcrumbAndroid } from './bugsnagAndroid';

export const leaveNavigationBreadcrumb = (component) => {
    let breadcrumbFn = null;
    if (isIOS) {
        breadcrumbFn = breadcrumbIOS;
    } else {
        breadcrumbFn = breadcrumbAndroid;
    }

    breadcrumbFn(component);
};
