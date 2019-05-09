describe('Wallet receive view', () => {
   test('Render view', async () => {
       const snapshot = await global.__screenshot('wallet/receive', true, 600);

       expect(snapshot).toMatchImageSnapshot({
           customSnapshotsDir: `${__dirname}/__snapshots__/`,
                customDiffConfig: { threshold: 1 },
           customSnapshotIdentifier: 'receive.test.jsx',
       });
   }, 10000);
});
