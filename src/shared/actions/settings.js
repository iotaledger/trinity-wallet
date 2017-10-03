/* eslint-disable import/prefer-default-export */
export const ActionTypes = {
    LOCALE: 'IOTA/SETTINGS/LOCALE',
    FULLNODE: 'IOTA/SETTINGS/FULLNODE',
};

export function setLocale(locale) {
  return {
    type: ActionTypes.LOCALE,
    payload: locale,
  };
}

export function setFullNode(fullNode) {
  return {
    type: ActionTypes.FULLNODE,
    payload: fullNode,
  };
}
