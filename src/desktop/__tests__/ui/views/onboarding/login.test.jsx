describe('Onboarding login view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/login', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
                customDiffConfig: { threshold: 1 },
            customSnapshotIdentifier: 'login.test.jsx',
        });
    }, 10000);
});
