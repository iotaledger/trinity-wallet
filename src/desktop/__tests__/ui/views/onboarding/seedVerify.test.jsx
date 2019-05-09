describe('Onboarding seed verify view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/seed-verify', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
                customDiffConfig: { threshold: 1 },
            customSnapshotIdentifier: 'seedVerify.test.jsx',
        });
    }, 10000);
});
