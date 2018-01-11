// FILE MUST BE NAMED *.worker.js OR OTHERWISE IT'S NOT RECOGNIZED BY WEBPACKS WORKER-LOADER!
import * as tasks from './tasks';

self.onmessage = ({ data }) => {
    const { type, payload } = data;

    if (typeof tasks[type] === 'function') {
        tasks[type](payload);
    }
};
