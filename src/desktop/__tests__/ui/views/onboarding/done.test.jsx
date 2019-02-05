describe('Onboarding done view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/done', false, 2000);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'done.test.jsx',
        });
    });
});
