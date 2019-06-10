describe('Wallet send view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('wallet/send', true, 600);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'send.test.jsx',
        });
    }, 10000);
});
