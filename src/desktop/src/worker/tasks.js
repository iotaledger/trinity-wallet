// Executed in worker context
import cloneDeep from 'lodash/cloneDeep';
import size from 'lodash/size';

import { generateNewAddressRequest, generateNewAddressError, generateNewAddressSuccess } from 'actions/tempAccount';

import { updateAddresses } from 'actions/account';
import { iota } from '../../../shared/libs/iota';
import { MAX_SEED_LENGTH } from '../../../shared/libs/util';

// Wrapper to pass the action to dispatch from within the worker to the main thread
const dispatch = (action) => {
    self.postMessage({
        type: 'dispatch',
        action,
    });
};

export const generateNewAddress = async ({ seed, seedName, addresses = [] }) => {
    const index = size(addresses) === 0 ? 0 : size(addresses) - 1;
    const options = { checksum: true, index };

    dispatch(generateNewAddressRequest());

    try {
        const address = await iota.api.getNewAddressAsync(seed, options);

        const updatedAddresses = cloneDeep(addresses);
        const addressNoChecksum = address.substring(0, MAX_SEED_LENGTH);

        // In case the newly created address is not part of the addresses object
        // Add that as a key with a 0 balance.
        if (!(addressNoChecksum in addresses)) {
            updatedAddresses[addressNoChecksum] = { balance: 0, spent: false };
        }

        dispatch(updateAddresses(seedName, updatedAddresses));
        dispatch(generateNewAddressSuccess(address));
    } catch (error) {
        dispatch(generateNewAddressError());
        console.log('ERROR:', error);
    }
};
