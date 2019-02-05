describe('Wallet dashboard view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('wallet/dashboard', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'dashboard.test.jsx',
        });
    });
});
