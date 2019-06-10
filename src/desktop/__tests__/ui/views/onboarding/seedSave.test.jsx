describe('Onboarding seed save view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/seed-save', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.05',
            failureThresholdType: 'percent',
            customSnapshotIdentifier: 'seedSave.test.jsx',
        });
    }, 10000);
});
