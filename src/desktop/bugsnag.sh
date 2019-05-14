#!/usr/bin/env bash
# fail if any commands fail
set -e

# Add Bugsnag API key to dist/bundle.js
sed -i".orig" -e "s/fakeAPIkey/$BUGSNAG_KEY/" ./dist/bundle.js && rm ./dist/bundle.js.orig

# Add Bugsnag API key to bugsnag.js
sed -i".orig" -e "s/fakeAPIkey/$BUGSNAG_KEY/" ./bugsnag.js && rm ./bugsnag.js.orig
