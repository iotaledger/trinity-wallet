describe('Settings advanced view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/advanced', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
                customDiffConfig: { threshold: 1 },
            customSnapshotIdentifier: 'advanced.test.jsx',
        });
    }, 10000);
});
