/* eslint-disable import/prefer-default-export */

export function setFirstUse(boolean) {
  return {
    type: 'SET_FIRSTUSE',
    payload: boolean,
  };
}
