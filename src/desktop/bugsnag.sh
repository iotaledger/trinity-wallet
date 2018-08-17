#!/usr/bin/env bash
# fail if any commands fail
set -e

# Add Bugsnag API key to src/index.js
cat src/index.js | sed -e "s/fakeAPIkey/$BUGSNAG_KEY/" | tee src/index.js

# Add Bugsnag API key to bugsnag.js
cat bugsnag.js | sed -e "s/fakeAPIkey/$BUGSNAG_KEY/" | tee bugsnag.js
