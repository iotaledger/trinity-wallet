#!/usr/bin/env bash

# Fail if any commands fail
set -e

# Install shared dependencies
echo ":yarn: Install shared dependencies"
yarn
cd src/shared && yarn && cd ../..

# Install desktop dependencies
echo ":yarn: Install desktop dependencies"
cd src/desktop && yarn && cd ../..

# Dependency audit
echo ":mag: Audit shared and desktop dependencies"
cd src/shared && yarn audit && cd ../desktop && yarn audit && cd ../..

# ESLint
echo ":eslint: Run ESLint for shared and desktop"
yarn lint:shared && yarn lint:desktop

# Bundle
echo ":react: Bundle"
cd src/desktop && yarn build
