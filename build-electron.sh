#!/bin/sh

##
## This script follows the steps documented in Journal.md
##

CLONETARGET="bpa-electron"

if [ "$1x" != "x" ] 
then
	CLONETARGET=$1
fi

if [ -d "$CLONETARGET" ]; then
	echo +-------------------------------------------------------------+
	echo The clone target  $CLONETARGET already exits 
	echo Fatal Error!                                 
	echo +-------------------------------------------------------------+
	exit
fi

echo +-------------------------------------------------------------+
echo The clone target is $CLONETARGET 
echo Clone the repo
echo Start at `date`
echo +-------------------------------------------------------------+

git clone git@github.com:unfoldingWord/book-package-app.git $CLONETARGET

echo +-------------------------------------------------------------+
echo Switch to cloned folder

cd $CLONETARGET 

ROOT=`pwd`
echo Root folder of project is $ROOT
echo Get dependencies with yarn
echo +-------------------------------------------------------------+

yarn install

echo +-------------------------------------------------------------+
echo Build the react web app with yarn build
echo +-------------------------------------------------------------+

yarn build

echo +-------------------------------------------------------------+
echo Add capacitor
echo +-------------------------------------------------------------+

yarn add --dev @capacitor/core @capacitor/cli

echo +-------------------------------------------------------------+
echo Initialize capacitor
echo +-------------------------------------------------------------+

npx cap init --web-dir "build" "book-package-app" "org.unfoldingword.BookPackageApp"

echo +-------------------------------------------------------------+
echo Define target platform with capacitor
echo +-------------------------------------------------------------+

npx cap add electron

echo +-------------------------------------------------------------+
echo Fix electron package.json, from public/electron-package.json
echo a. change name
echo b. change description
echo c. supply author

cd $ROOT
cp ./public/electron-package.json ./electron/package.json

echo +-------------------------------------------------------------+
echo Fix electron index.html
echo +-------------------------------------------------------------+

cd $ROOT/electron/app 
sed -e "s#/book-package-app/#./#g" < index.html > x && mv x index.html
cd $ROOT 

echo +-------------------------------------------------------------+
echo Copy index.js to app folder
echo +-------------------------------------------------------------+

cd $ROOT/electron/
cp index.js app
cd $ROOT 



echo +-------------------------------------------------------------+
echo Key Concepts
echo 1. At this point, the electron app is in the electron folder.
echo 2. It is completely separated, divorced from the web React app.
echo 3. It has its own package.json file
echo 4. You can start it: yarn electron:start
echo 5. All packaging work needs to be done inside this folder!
echo +-------------------------------------------------------------+


echo +-------------------------------------------------------------+
echo Install electron builder
echo +-------------------------------------------------------------+

cd $ROOT/electron
yarn add --dev electron
yarn add --dev electron-builder 

echo +-------------------------------------------------------------+
echo Run packager 
echo +-------------------------------------------------------------+

electron-builder

echo +-------------------------------------------------------------+
echo Done at `date`
echo +-------------------------------------------------------------+
