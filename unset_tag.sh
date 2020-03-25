#!/bin/sh
if [ "$1x" == "x" ]; then
    echo No semver provided
    exit
fi
git tag -d $1
git push origin --delete $1