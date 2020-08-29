import React from 'react';
import { shallow, mount } from 'enzyme';

import { ListComponent as List } from 'ui/components/List';
import TransactionRow from 'ui/components/Transaction';

import * as dateLib from 'libs/date';

dateLib.formatTime = () => 'DD/MM/YYYY';

jest.mock('react-virtualized-auto-sizer', () => {
    const width = 100;
    const height = 100;

    return ({ children }) =>
      <div>{children({ width, height })}</div>;
  });
  

const props = {
    isBusy: false,
    mode: 'Standard',
    isLoading: false,
    currentlyPromotingBundleHash: '',
    isRetryingFailedTransaction: false,
    hideEmptyTransactions: false,
    updateAccount: jest.fn(),
    toggleEmptyTransactions: jest.fn(),
    /** Transaction history */
    transactions: [
        {
            attachmentTimestamp: 1546934663241,
            bundle: 'ABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHI',
            incoming: false,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: true,
            timestamp: 1546934661,
            transferValue: 0,
        },
        {
            attachmentTimestamp: 1546934663242,
            bundle: 'BCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJ',
            incoming: true,
            inputs: [],
            message: 'Dolor sit amet',
            persistence: false,
            timestamp: 1546934661,
            transferValue: 500000,
        },
        {
            attachmentTimestamp: 1546934663242,
            bundle: 'CDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJK',
            incoming: true,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: true,
            timestamp: 1546934661,
            transferValue: 500000,
        },
        {
            attachmentTimestamp: 1546934663243,
            bundle: 'DEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKI',
            incoming: false,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: true,
            timestamp: 1546934661,
            transferValue: 0,
        },
        {
            attachmentTimestamp: 1546934663243,
            bundle: 'EFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKIL',
            incoming: false,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: false,
            timestamp: 1546934661,
            transferValue: 100000,
        },
        {
            attachmentTimestamp: 1546934663243,
            bundle: 'FGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKILM',
            incoming: false,
            inputs: [],
            message: 'Lorem ipsum',
            persistence: false,
            timestamp: 1546934661,
            transferValue: 100000,
        },
    ],
    failedHashes: {},
    promoteTransaction: jest.fn(),
    retryFailedTransaction: jest.fn(),
    setItem: jest.fn(),
    t: (str) => str,
    accountMeta: {
        type: 'keychain',
    },
    password: {},
    isRenderingForTray: false
};

describe('List component', () => {
    test('Render the component', () => {
        const wrapper = shallow(<List {...props} />);

        expect(wrapper).toMatchSnapshot();
    });

    test('List all history items', () => {
        const wrapper = mount(<List {...props} />);

        expect(wrapper.find(TransactionRow)).toHaveLength(6);
    });

    test('Filter received items', () => {
        const wrapper = mount(<List {...props} />);

        wrapper.setState({ filter: 'Received' });
        expect(wrapper.find(TransactionRow)).toHaveLength(1);
    });

    test('Filter sent items', () => {
        const wrapper = mount(<List {...props} />);

        wrapper.setState({ filter: 'Sent' });
        expect(wrapper.find(TransactionRow)).toHaveLength(2);
    });

    test('Filter pending items', () => {
        const wrapper = mount(<List {...props} />);

        wrapper.setState({ filter: 'Pending' });
        expect(wrapper.find(TransactionRow)).toHaveLength(3);
    });

    test('Filter items by value search', () => {
        const wrapper = mount(<List {...props} />);

        wrapper.setState({ search: '500000' });
        expect(wrapper.find(TransactionRow)).toHaveLength(2);
    });

    test('Filter items by message search', () => {
        const wrapper = mount(<List {...props} />);

        wrapper.setState({ search: 'dolor' });
        expect(wrapper.find(TransactionRow)).toHaveLength(1);
    });

    test('Display single transaction', () => {
        const mockProps = Object.assign({}, props, {
            currentItem: 'ABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHIJKLMONPRSTUVXYZABCDEFGHI',
        });
        const wrapper = shallow(<List {...mockProps} />);

        expect(wrapper.find('.popup').hasClass('on')).toBeTruthy();
    });
});
