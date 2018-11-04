#!/usr/bin/env bash
# fail if any commands fail
set -e

# Add SafetyNet API key to utils/safetynet.js
cat src/libs/safetynet.js | sed -e "s/fakeAPIkey/$SAFETYNET_KEY/" | tee src/libs/safetynet.js
