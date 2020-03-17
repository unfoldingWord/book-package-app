# Journal

## Electron Packaging

This series of instructions are from the very beginning, starting at cloning the repo. This will be close to what a Github Action workflow will need to do.

Once capacitor is configured, the changes will be committed/pushed. So one difference is that capcitor itself will not need to be added to the project as is done below.

Step 1. clone the repo and step into the cloned folder
```
$ git clone git@github.com:unfoldingWord/book-package-app.git
Cloning into 'book-package-app'...
remote: Enumerating objects: 18, done.
remote: Counting objects: 100% (18/18), done.
remote: Compressing objects: 100% (18/18), done.
remote: Total 557 (delta 1), reused 6 (delta 0), pack-reused 539
Receiving objects: 100% (557/557), 8.91 MiB | 654.00 KiB/s, done.
Resolving deltas: 100% (359/359), done.
$ cd book-package-app
$
```

Step 2. get the dependencies
```
$ yarn
yarn install v1.22.4
[1/4] Resolving packages...
[2/4] Fetching packages...
... elided ...
[4/4] Building fresh packages...
Done in 164.84s.
$
```

Step 3. add Capacitor
```
$ yarn add @capacitor/core @capacitor/cli
yarn add v1.22.4
[1/4] Resolving packages...
[2/4] Fetching packages...
... elided ... 
[4/4] Building fresh packages...

success Saved lockfile.
success Saved 9 new dependencies.
info Direct dependencies
├─ @capacitor/cli@1.5.1
└─ @capacitor/core@1.5.1
info All dependencies
├─ @capacitor/cli@1.5.1
├─ @capacitor/core@1.5.1
├─ cli-spinners@1.3.1
├─ compare-versions@3.6.0
├─ ora@1.4.0
├─ plist@3.0.1
├─ xml2js@0.4.23
├─ xmlbuilder@9.0.7
└─ xmldom@0.1.31
Done in 33.67s.
$
```

Step 4. Initialize capacitor
```
$ npx cap init --web-dir "build" "book-package-app" "org.unfoldingword.BookPackageApp"


*   Your Capacitor project is ready to go!  *

Add platforms using "npx cap add":

  npx cap add android
  npx cap add ios
  npx cap add electron

Follow the Developer Workflow guide to get building:
https://capacitor.ionicframework.com/docs/basics/workflow

$
```

Step 5. Removed

Step 6. Build the app (could be done before Step 5)
```
$ yarn build
yarn run v1.22.4
$ react-scripts build
Creating an optimized production build...
Compiled successfully.

File sizes after gzip:

  513.62 KB  build\static\js\2.f8631465.chunk.js
  10.63 KB   build\static\js\main.06ac67eb.chunk.js
  782 B      build\static\js\runtime-main.d8cbb9cd.js
  284 B      build\static\css\main.2f6ca397.chunk.css

The project was built assuming it is hosted at /book-package-app/.
You can control this with the homepage field in your package.json.

The build folder is ready to be deployed.
To publish it at https://unfoldingword.github.io/book-package-app/ , run:

  yarn run deploy

Find out more about deployment here:

  bit.ly/CRA-deploy

Done in 124.73s.
$
```

Step 7. Add electron as a target platform
```
$ npx cap add electron
$ # note no output, but does create folder "electron"
```

Step 8. Update the `package.json` file in the electron folder:
- update app name and description
- from:
```
  "name": "capacitor-app",
  "version": "1.0.0",
  "description": "An Amazing Capacitor App",
```
- to:
```
  "name": "book-package-app",
  "version": "1.0.0",
  "description": "Book Package App",
```
- using this:
```
cd electron
sed -e "s/capacitor-app/book-package-app/" -e "s/An Amazing Capacitor App/Book Package App/" < package.json > x && mv x package.json
```

Step 9. Copy the build folder to the platform target(s). In this case only 'electron'.
```
$ npx cap copy
$ # note no output
```

Step 10. The web app has an `index.html` file that has references that will not work with electron. In particular, all references that begin with "/book-package-app/" must be altered to "./".
```
$ cd electron/app
$ sed -e "s#/book-package-app/#./#g" < index.html > x && mv x index.html
```

Step 11. Install the packager for electron and verify:
```
$ npm install electron-packager
$ electron-packager --version
Electron Packager 14.2.1
Node v10.16.3
Host Operating system: win32 10.0.18362 (x64)
$
```

Step 12. Run the packager. Note that when run on a local computer, it can only generate OS/Arch combinations compatible with the local computer. Suppose you have a Win10 computer, then it can generate Windows and Linux OS (even for different architecture, since there no "assembly" code involved)
```
$ cd electron/
$ pwd
/c/Users/mando/Projects/cecil.new/book-package-app/electron
$ electron-packager . --all
Packaging app for platform linux ia32 using electron v7.1.14
Packaging app for platform win32 ia32 using electron v7.1.14
Packaging app for platform linux x64 using electron v7.1.14
Skipping win32 x64 (output dir already exists, use --overwrite to force)
Packaging app for platform linux armv7l using electron v7.1.14
Packaging app for platform linux arm64 using electron v7.1.14
Packaging app for platform win32 arm64 using electron v7.1.14
Cannot create symlinks (on Windows hosts, it requires admin privileges); skipping darwin platform        
Cannot create symlinks (on Windows hosts, it requires admin privileges); skipping mas platform
Wrote new apps to:
C:\Users\mando\Projects\cecil.new\book-package-app\electron\book-package-app-linux-ia32
C:\Users\mando\Projects\cecil.new\book-package-app\electron\book-package-app-win32-ia32
C:\Users\mando\Projects\cecil.new\book-package-app\electron\book-package-app-linux-x64
true
C:\Users\mando\Projects\cecil.new\book-package-app\electron\book-package-app-linux-armv7l
C:\Users\mando\Projects\cecil.new\book-package-app\electron\book-package-app-linux-arm64
C:\Users\mando\Projects\cecil.new\book-package-app\electron\book-package-app-win32-arm64
$
```


## Links

- *Installing Typescript*: https://www.typescriptlang.org/#download-links
- *The docs*: https://www.typescriptlang.org/docs/home.html
- *Using React*: https://www.typescriptlang.org/docs/handbook/react-&-webpack.html
- *Create React App with TS*: https://create-react-app.dev/docs/adding-typescript/
- *Playground*: https://www.typescriptlang.org/play/index.html#
and the beta v2 playground: https://www.typescriptlang.org/v2/en/play
- *React Cheatsheets*: https://github.com/typescript-cheatsheets/react-typescript-cheatsheet#reacttypescript-cheatsheets
- *Netlify*: https://app.netlify.com/teams/unfoldingword-hvaaits/sites https://app.netlify.com/teams/mandolyte/sites

## 2020-02-12

First cut at optimization is done and working well. Is quite plain looking and will be working on the UI/UX next.

Two tools used for the favicon:
- https://onlinepngtools.com/create-transparent-png
- https://favicon.io/favicon-converter/

## 2020-02-04

Found solution to track two dimensions for a single book (array of booleans). Also added text about what will happen if one wants to optimize the flow.

*NOTE*: updated `package.json` with:
```
    "deploy": "react-scripts build && gh-pages -d build"
```
This is needed because unless the `build` folder is updated, the commit/push to the `gh-pages` branch will not find anything to udpate and does nothing.

## 2020-02-03

Need to fix/think about how properly output the book package results so the user can mark some of them as being completed. This impacts how optimization is done.

## 2020-01-31

Today, spent time working on unresolved ".json" files. Had to go back and make quite a few small changes to the RCL. Never did figure this out. It appears that JSON files cannot be exported and exposed in an NPM package.

First cut of app completed... needs cleanup and some bug fixes.


## 2020-01-30

Today I'm back at work on this. I spent time refactoring `book-package-rcl` so that it can be re-used by this app (or by another). It is now published in NPM as version 1.0.0. And prior to that I extracted the word count logic into its own component as well, namely, `uw-word-count` and this is also published on NPM. The RCL used the word count component.

I have decided to write the app in Typescript. I will document my journey here!

1. get the latest version of typescript: `npm install -g typescript`
```
$ npm install -g typescript
C:\Users\mando\AppData\Roaming\npm\tsserver -> C:\Users\mando\AppData\Roaming\npm\node_modules\typescript\bin\tsserver
C:\Users\mando\AppData\Roaming\npm\tsc -> C:\Users\mando\AppData\Roaming\npm\node_modules\typescript\bin\tsc
+ typescript@3.7.5
updated 1 package in 11.613s
$ tsc -v
Version 3.7.5
$
```
2. Remove all the artifacts created earlier; and committed; Note per the `adding-typescript` page, I could also have run: 
```
npm uninstall -g create-react-app
```
3. Now run command to start up a TS React (see links):
```
$ yarn create react-app book-package-app --template typescript
```
4. Tested as recommended and it worked fine. Note that it used port 3000
```
We suggest that you begin by typing:

  cd book-package-app
  yarn start

Happy hacking!
Done in 104.98s.
```
5. Put back some of the files I moved for safety.
6. Next added typescript support:
```
yarn add typescript @types/node @types/react @types/react-dom @types/jest
```
7. Noted that `yarn start` will actually launch a Chrome tab to run in... nice.
8. Added to compiler options in `tsconfig.json`: `"downlevelIteration": true`; see https://stackoverflow.com/questions/49218765/typescript-and-iterator-type-iterableiteratort-is-not-an-array-type



## 2020-01-09

Today I began documenting the design specification in `DesignSpec.md`

## 2020-01-08

Today I cloned the repo from `unfoldingWord` and ran:
`npx create-react-app book-package-app`. 
The command renamed my `README.md` to `README.old.md`. So I combined them into one and removed the renamed one. I then committed and pushed to initialize the project in Github with *just* the React artifacts.

I then ran `yarn start` and the application started a new tab in my Chrome browser with this in the address bar: `http://localhost:3000/`. Worked fine.


