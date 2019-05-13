#!/usr/bin/env bash
# fail if any commands fail
set -e

# Add Bugsnag API key to src/index.js
sed -i".orig" -e "s/fakeAPIkey/$BUGSNAG_KEY/" ./src/index.js && rm ./src/index.js.orig

# Add Bugsnag API key to bugsnag.js
sed -i".orig" -e "s/fakeAPIkey/$BUGSNAG_KEY/" ./bugsnag.js && rm ./bugsnag.js.orig
