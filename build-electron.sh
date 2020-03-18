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

yarn

echo +-------------------------------------------------------------+
echo Add capacitor
echo +-------------------------------------------------------------+

yarn add @capacitor/core @capacitor/cli

echo +-------------------------------------------------------------+
echo Initialize capacitor
echo +-------------------------------------------------------------+

npx cap init --web-dir "build" "book-package-app" "org.unfoldingword.BookPackageApp"

echo +-------------------------------------------------------------+
echo Build the react web app with yarn build
echo +-------------------------------------------------------------+

yarn build
echo +-------------------------------------------------------------+
echo Define target platform with capacitor
echo +-------------------------------------------------------------+

npx cap add electron

echo +-------------------------------------------------------------+
echo Fix electron package.json

cd $ROOT/electron
sed -e "s/capacitor-app/book-package-app/" -e "s/An Amazing Capacitor App/Book Package App/" < package.json > x && mv x package.json
cd $ROOT

echo Fix electron index.html

cd $ROOT/electron/app 
sed -e "s#/book-package-app/#./#g" < index.html > x && mv x index.html
cd $ROOT 

echo +-------------------------------------------------------------+
echo Install electron packager and show version
echo +-------------------------------------------------------------+

yarn add electron-packager 
electron-packager --version 

echo +-------------------------------------------------------------+
echo Run packager 
echo +-------------------------------------------------------------+

cd $ROOT/electron
electron-packager . --all


echo +-------------------------------------------------------------+
echo Done at `date`
echo +-------------------------------------------------------------+
