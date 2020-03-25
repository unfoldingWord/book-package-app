#!/bin/sh
if [ "$1x" == "x" ]; then
    echo No semver provided
    exit
fi
git tag $1
git push origin  $1