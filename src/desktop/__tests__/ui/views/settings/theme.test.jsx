describe('Settings theme view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/theme', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'theme.test.jsx',
        });
    }, 10000);
});
