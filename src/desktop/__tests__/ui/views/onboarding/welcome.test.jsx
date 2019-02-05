describe('Onboarding welcome view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'welcome.test.jsx',
        });
    });
});
