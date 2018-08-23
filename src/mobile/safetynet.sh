#!/usr/bin/env bash
# fail if any commands fail
set -e

# Add SafetyNet API key to utils/safetynet.js
cat utils/safetynet.js | sed -e "s/fakeAPIkey/$SAFETYNET_KEY/" | tee utils/safetynet.js
