import { bugsnag } from '../index.android';

export const breadcrumbAndroid = (component) => {
    bugsnag.leaveBreadcrumb('Navigated to ' + component, {
        type: 'navigation',
        component: component,
    });
};
