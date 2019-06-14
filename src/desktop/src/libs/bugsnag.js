/* global Electron */
import React from 'react';
import bugsnag from '@bugsnag/js';
import bugsnagReact from '@bugsnag/plugin-react';

import settings from '../../package.json';

const bugsnagKey = process.env.BUGSNAG_KEY;

export const bugsnagClient = bugsnagKey.length
    ? bugsnag({
          apiKey: bugsnagKey,
          appVersion: settings.version,
          interactionBreadcrumbsEnabled: false,
          collectUserIp: false,
          user: { id: typeof Electron === 'object' ? Electron.getUuid() : null },
      })
    : {
          notify: (err) => {
              console.error(err); /* eslint-disable-line no-console */
          },
      };

if (bugsnagKey.length) {
    bugsnagClient.use(bugsnagReact, React);
}

export const ErrorBoundary = bugsnagKey.length ? bugsnagClient.getPlugin('react') : React.Fragment;
