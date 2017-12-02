import get from 'lodash/get';
import { createSelector } from 'reselect';

export const currentAccountSelector = (seedName, accountInfo) => get(accountInfo, seedName);

export const getSelectedAccount = createSelector(currentAccountSelector, account => account);
