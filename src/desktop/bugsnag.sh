#!/usr/bin/env bash
# fail if any commands fail
set -e

# Add Bugsnag API key to dist/bundle.js
cat dist/bundle.js | sed -e "s/fakeAPIkey/$BUGSNAG_KEY/" | tee dist/bundle.js

# Add Bugsnag API key to bugsnag.js
cat bugsnag.js | sed -e "s/fakeAPIkey/$BUGSNAG_KEY/" | tee bugsnag.js
