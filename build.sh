#!/bin/bash

echo "Building desktop"
cd src/desktop
yarn compile:linux
yarn compile:win

rm -rf /dist/*
mv ./out /dist/desktop
