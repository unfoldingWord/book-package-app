# Journal

## Links

- *Installing Typescript*: https://www.typescriptlang.org/#download-links
- *The docs*: https://www.typescriptlang.org/docs/home.html
- *Using React*: https://www.typescriptlang.org/docs/handbook/react-&-webpack.html
- *Create React App with TS*: https://create-react-app.dev/docs/adding-typescript/
- *Playground*: https://www.typescriptlang.org/play/index.html#
and the beta v2 playground: https://www.typescriptlang.org/v2/en/play
- *React Cheatsheets*: https://github.com/typescript-cheatsheets/react-typescript-cheatsheet#reacttypescript-cheatsheets
- *Netlify*: https://app.netlify.com/teams/unfoldingword-hvaaits/sites

## 2020-01-31

Today, spent time working on unresolved ".json" files. Had to go back and make quite a few small changes to the RCL.

Added this line to scripts section of `package.json`: `    "deploy": "gh-pages -d build"`. Then:
```
$ yarn deploy
yarn run v1.21.1
$ gh-pages -d build
ENOENT: no such file or directory, stat 'C:\Users\mando\Projects\unfoldingWord\book-package-app\build'
error Command failed with exit code 1.
info Visit https://yarnpkg.com/en/docs/cli/run for documentation about this command.

mando@DESKTOP-0V8P6MM MINGW64 ~/Projects/unfoldingWord/book-package-app (master)
$
```

Maybe do build first? Yes... that seems to work:
```
$ yarn deploy
yarn run v1.21.1
$ gh-pages -d build
Published
Done in 30.52s.
```

Still having trouble; the URL returns 404. 
https://unfoldingword.github.io/book-package-app/

Rerun of `yarn build` and `yarn deploy` did not help...

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


