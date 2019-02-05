describe('Onboarding account name view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/account-name', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'accountName.test.jsx',
        });
    });
});
