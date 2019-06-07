describe('Settings language view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('settings/language', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'language.test.jsx',
        });
    }, 10000);
});
