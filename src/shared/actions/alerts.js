export const ActionTypes = {
    SHOW: 'IOTA/ALERTS/SHOW',
    HIDE: 'IOTA/ALERTS/HIDE',
};

const generate = (category, title, message) => ({
    type: ActionTypes.SHOW,
    category,
    title,
    message,
});

const dispose = () => ({ type: ActionTypes.HIDE });

export const generateAlert = (category, title, message) => dispatch => dispatch(generate(category, title, message));
export const disposeOffAlert = () => dispatch => dispatch(dispose());
