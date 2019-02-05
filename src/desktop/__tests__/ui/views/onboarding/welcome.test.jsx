describe('Onboarding index view', () => {
    test('Render Welcome ciew', async () => {
        const snapshot = await global.__screenshot('onboarding', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'welcome-unauth.test.jsx',
        });
    });

    test('Render Login view', async () => {
        const snapshot = await global.__screenshot('onboarding', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'welcome-auth.test.jsx',
        });
    });
});
