#!/usr/bin/env bash

# Based on https://github.com/instructure/steps-selective-builds/blob/master/step.sh, modified for Buildkite

set -ex

echo "Looking for changes in $DETECT_CHANGES_DIR"

if [[ -z $BUILDKITE_PULL_REQUEST_BASE_BRANCH ]]; then
  echo "No PR detected. Skipping selective builds."
  exit 0
fi

git fetch origin "$BUILDKITE_PULL_REQUEST_BASE_BRANCH" --depth 1

DIFF_FILES="$(git diff --name-only origin/${BUILDKITE_PULL_REQUEST_BASE_BRANCH})"

set +x
PATH_PATTERN=$(ruby -e 'puts ENV["DETECT_CHANGES_DIR"].strip.split("\n").map { |e| e.gsub("/", "\\/") }.join("|") ')

echo "PATH_PATTERN: $PATH_PATTERN"
set -x

check_diff(){
  set +e
    echo $DIFF_FILES | grep -E $1
    exit_status = $?
    if [[ $exit_status = 0 ]]; then
      echo "Changes to $DETECT_CHANGES_DIR detected, triggering pipeline $PIPELINE_SLUG"
      curl -X POST \
      -H "Authorization: Bearer $ACCESS_TOKEN" \
      https://api.buildkite.com/v2/organizations/$BUILDKITE_ORGANIZATION_SLUG/pipelines/$PIPELINE_SLUG/builds \
      -d '{
        "commit": "'"$BUILDKITE_COMMIT"'",
        "branch": "'"$BUILDKITE_BRANCH"'",
        "message": "Created by selective builds: '"$BUILDKITE_MESSAGE"'",
        "author": {
          "name": "'"$BUILDKITE_BUILD_CREATOR"'",
          "email": "'"$BUILDKITE_BUILD_CREATOR_EMAIL"'"
        }
      }'
    else
      echo "No changes to $DETECT_CHANGES_DIR detected"
    fi
  set -e
}

check_diff "$PATH_PATTERN"

exit 0
