describe('Onboarding seed intro view', () => {
    test('Render view', async () => {
        const snapshot = await global.__screenshot('onboarding/seed-intro', false);

        expect(snapshot).toMatchImageSnapshot({
            customSnapshotsDir: `${__dirname}/__snapshots__/`,
            customSnapshotIdentifier: 'seedIntro.test.jsx',
        });
    });
});
