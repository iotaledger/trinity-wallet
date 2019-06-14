describe('Onboarding seed generate view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/seed-generate', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            failureThreshold: '0.5',
           failureThresholdType: 'percent',
            customSnapshotIdentifier: 'seedGenerate.test.jsx',
        });
    }, 10000);
});
