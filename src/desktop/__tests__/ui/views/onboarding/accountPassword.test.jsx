describe('Onboarding account password view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/account-password', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'accountPassword.test.jsx',
        });
    });
});
