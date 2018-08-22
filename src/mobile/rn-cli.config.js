const path = require('path');

module.exports = {
  getProjectRoots() {
    return [
      __dirname,
      path.join(__dirname, '..'),
      path.join(__dirname, '.'),
    ];
  }
};
