describe('Settings account addresses view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/account/addresses/0', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
                customDiffConfig: { threshold: 1 },
            customSnapshotIdentifier: 'addresses.test.jsx',
        });
    }, 10000);
});
