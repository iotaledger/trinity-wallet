// Based on https://stackoverflow.com/a/41597717/3188334
export const sleep = (ms) => {
  return new Promise((res) => setTimeout(res, ms))
};
