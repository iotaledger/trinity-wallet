describe('Settings theme view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/theme', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'theme.test.jsx',
        });
    });
});
