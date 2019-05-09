describe('Onboarding done view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/done', false, 3000);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
                customDiffConfig: { threshold: 1 },
            customSnapshotIdentifier: 'done.test.jsx',
        });
    }, 10000);
});
