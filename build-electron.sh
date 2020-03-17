#!/bin/sh

##
## This script follows the steps documented in Journal.md
##

CLONETARGET="bpa-electron"

echo 
echo Clone the repo
git clone git@github.com:unfoldingWord/book-package-app.git $CLONETARGET

echo Switch to cloned folder
cd $CLONETARGET 

ROOT=`pwd`
echo Root folder of project is $ROOT

echo Get dependencies with yarn
yarn

echo Add capacitor
yarn add @capacitor/core @capacitor/cli

echo Initialize capacitor
npx cap init --web-dir "build" "book-package-app" "org.unfoldingword.BookPackageApp"

echo Build the react web app with yarn build
yarn build

echo Define target platform with capacitor
npx cap add electron

echo Fix electron package.json
cd $ROOT/electron
sed -e "s/capacitor-app/book-package-app/" -e "s/An Amazing Capacitor App/Book Package App/" < package.json > x && mv x package.json
cd $ROOT

echo Fix electron index.html
cd $ROOT/electron/app 
sed -e "s#/book-package-app/#./#g" < index.html > x && mv x index.html
cd $ROOT 

echo Install electron packager and show version
yarn add electron-packager 
electron-packager --version 

echo Run packager 
cd $ROOT/electron
electron-packager . --all


echo Done!
