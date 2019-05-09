describe('Settings theme view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/theme', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
                customDiffConfig: { threshold: 1 },
            customSnapshotIdentifier: 'theme.test.jsx',
        });
    }, 10000);
});
