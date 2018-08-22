import { danger, fail, warn } from 'danger';
import path from 'path';
import includes from 'lodash.includes';
import some from 'lodash.some';

const modifiedFiles = danger.git.modified_files;
const prBodyLength = danger.github.pr.body.length;
const packageJson = ['package.json', 'src/mobile/package.json', 'src/desktop/package.json', 'src/shared/package.json'];
const yarnLock = ['yarn.lock', 'src/mobile/yarn.lock', 'src/desktop/yarn.lock', 'src/shared/yarn.lock'];
const mobileTestReport = path.resolve(__dirname, 'src/mobile/test-results.json');

const hasPackageJsonChanges = some(packageJson, (p) => includes(modifiedFiles, p));
const hasLockfileChanges = some(yarnLock, (y) => includes(modifiedFiles, y));

// Ensure that PRs have a description
if (prBodyLength < 10) {
  warn('Please include a description of your PR changes.');
}

// Check for changes to package.json or yarn.lock (e.g. dependency changes)
if (hasPackageJsonChanges || hasLockfileChanges) {
  warn('Detected changes to package.json or yarn.lock. This PR may require more time to review.');
  if (!hasLockfileChanges) {
    warn('Detected changes to package.json with no corresponding changes to yarn.lock. Please update the yarn.lock if necessary.');
  }
}
