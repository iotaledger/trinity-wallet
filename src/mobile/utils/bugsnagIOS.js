import { bugsnag } from '../index.ios';

export const breadcrumbIOS = (component) => {
    bugsnag.leaveBreadcrumb('Navigated to ' + component, {
        type: 'navigation',
        component: component,
    });
};
