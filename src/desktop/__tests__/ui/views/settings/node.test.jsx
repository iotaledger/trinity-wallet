describe('Settings node view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/node', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'node.test.jsx',
        });
    }, 10000);
});
