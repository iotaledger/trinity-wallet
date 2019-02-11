import assign from 'lodash/assign';
import noop from 'lodash/noop';
import React from 'react';
import { shallow } from 'enzyme';
import { SnapshotTransition as SnapshotTransitionComponent } from 'ui/views/wallet/SnapshotTransition';

jest.mock('react-native-is-device-rooted', () => ({
    isDeviceRooted: () => true,
    isDeviceLocked: () => false,
}));

jest.mock('bugsnag-react-native', () => ({
    Configuration: jest.fn(),
    Client: jest.fn(() => ({ leaveBreadcrumb: jest.fn() })),
}));

const getProps = (overrides) =>
    assign(
        {},
        {
            isTransitioning: false,
            t: () => '',
            transitionForSnapshot: noop,
            transitionBalance: 0,
            balanceCheckFlag: false,
            theme: { body: {}, primary: { color: '#862888', body: '#FFFFFF' } },
            generateAddressesAndGetBalance: noop,
            transitionAddresses: [],
            completeSnapshotTransition: noop,
            selectedAccountName: 'foo',
            selectedAccountMeta: {},
            generateAlert: noop,
            setSetting: noop,
            addresses: [],
            shouldPreventAction: false,
            isAttachingToTangle: false,
            password: {},
            activeStepIndex: -1,
            activeSteps: [],
            setBalanceCheckFlag: noop,
            cancelSnapshotTransition: noop,
        },
        overrides,
    );

describe('Testing SnapshotTransition component', () => {
    describe('when mounts', () => {
        it('should call prop method cancelSnapshotTransition', () => {
            const props = getProps({
                cancelSnapshotTransition: jest.fn(),
            });

            shallow(<SnapshotTransitionComponent {...props} />);

            expect(props.cancelSnapshotTransition).toHaveBeenCalled();
        });
    });
});
