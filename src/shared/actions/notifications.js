import { guid } from '../libs/util';

export const ActionTypes = {
    ADD: 'IOTA/NOTIFICATION/ADD',
    REMOVE: 'IOTA/NOTIFICATION/REMOVE',
};

export function showNotification(notification) {
    return (dispatch) => {
        let timeout = 15000;
        const id = guid();

        if (notification.timeout === false) {
            timeout = false;
        } else if (!isNaN(notification.timeout) && notification.timeout > 1000) {
            timeout = notification.timeout;
        }

        const { type = 'info', title, text, translationScope, translate } = notification;

        dispatch({
            type: ActionTypes.ADD,
            payload: {
                id,
                type,
                title,
                text,
                translate,
                translationScope,
            },
        });

        if (timeout) {
            setTimeout(() => dispatch(hideNotification(id)), timeout);
        }
    };
}

export const hideNotification = (id) => {
    return {
        type: ActionTypes.REMOVE,
        payload: id,
    };
};

export const showError = (notification) => {
    return (dispatch) => {
        dispatch(
            showNotification({
                ...notification,
                type: 'error',
            }),
        );
    };
};
