describe('Settings mode view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/mode', true);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'mode.test.jsx',
        });
    }, 10000);
});
