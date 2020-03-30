# Journal

## 2020-03-30 Issue #20: To be version 1.0.6

When code is running as standalone Electron app, the copy link button does not work in a reasonable way. To fix, examine link before putting on clipboard and if it begins with "file", then substitute the default base (origin and path).

At this point, make app and electron have the same version: 1.0.6. By updating
- `package.json` 
- `./public/electron-package.json`

Now, commit, tag, and push:
```
$ git commit -a -m "issue 20, version 1.0.6"
$ git tag v1.0.6
$ git push && git push --tags
```

## 2020-03-28 Caching of node modules with Github Actions

Decided to try partial key matching with a new patch release. Turns out there is an issue:
https://github.com/actions/cache/issues/231

## 2020-03-27 Cut Electron Release 1.0.4 

1. Update version in `./public/electron-package.json` (in this case 1.0.4).
2. No changes needed. This patch release is to test whether caching is working in the Github Actions Workflow.
3. Commit `git commit -a -m "bump to v1.0.4"`
4. Tag: `git tag v1.0.4`
5. Push changes and tags: `git push && git push --tags`

NOTE: Caching still not working... not sure why

## 2020-03-26 Cut a new release

1. Update version in `./public/electron-package.json` (in this case 1.0.3).
2. [optional if had to fix something] Unset the tag: `sh unset_tag.sh v1.0.3`
3. make changes as needed
4. commit the the changes: `git commit -a -m "blah"`
5. tag the changes: `git tag v1.0.3`
6. push changes and tags: `git push origin --tags`

Once everything is happy, do a push to master: `git push`

## 2020-03-25 MacOS

- Made minimum changes to `./public/electron-package.json` per https://www.electron.build/configuration/mac; the below, plus bumped version `1.0.1`.
```
    "mac": {
      "category": "public.app-category.utilities",
      "target": "default",
      "icon": "app/apple-touch-icon.png"
    }
```
- Made changes to Github Actions (GA) workflow, adding entries for `macos`
- Commit, tag, and push
```
$ git commit -a -m "support for macos"
[master 13472e6] support for macos
 4 files changed, 47 insertions(+), 5 deletions(-)
 create mode 100644 archive/Create-Release.yml
$ git tag v1.0.1
$ git push origin --tags
Counting objects: 10, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (8/8), done.
Writing objects: 100% (10/10), 1.56 KiB | 532.00 KiB/s, done.
Total 10 (delta 5), reused 0 (delta 0)
remote: Resolving deltas: 100% (5/5), completed with 5 local objects.
To github.com:unfoldingWord/book-package-app.git
 * [new tag]         v1.0.1 -> v1.0.1
$
```

## Release and Assets

This workflow captures the essentials of what I need to include:
https://github.com/DragonComputer/Dragonfire/blob/d0962866a5c589edc0d45fd2c07204ec3747500b/.github/workflows/release.yml

Note these lines which create a release.

1. Here is the action I need: https://github.com/marketplace/actions/create-a-release

2. Here is the way to upload assets: https://github.com/actions/upload-release-asset

*notes*
- made edits to workflow; let's push with no tag and see what happens. 
  - Expect: it will not start because no tag is provided.
  - Actual: it worked as expected. No workflow initiated.
- next set a tag and push it. The tag will be v1.0.0 to match semver in `./public/electron-package.json`. So after above push:
```
git tag          # lists all existing tags
git tag v1.0.0   # tag for the current commit
git push --tags  # push the new tag
```
For completeness, to remove the existing tags (which I think I needed to do because of a syntax error in the workflow yaml):
```
$ git tag -d v1.0
Deleted tag 'v1.0' (was 25a247c)
$ git tag -d v1.0.0
Deleted tag 'v1.0.0' (was 7effb1c)
$ git push origin --delete v1.0
To github.com:unfoldingWord/book-package-app.git
 - [deleted]         v1.0
$ git push origin --delete v1.0.0
To github.com:unfoldingWord/book-package-app.git
 - [deleted]         v1.0.0
$
```
Fixed problem, committed, added tag, and pushed.
```
$ git commit -a -m "fixes to wf"
[master 7fad4fb] fixes to wf
 2 files changed, 23 insertions(+), 2 deletions(-)
$ git tag v1.0.0
$ git push origin --tags
Counting objects: 6, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (4/4), done.  
Writing objects: 100% (6/6), 908 bytes | 302.00 KiB/s, done.
Total 6 (delta 3), reused 0 (delta 0)
remote: Resolving deltas: 100% (3/3), completed with 3 local objects.
To github.com:unfoldingWord/book-package-app.git
 * [new tag]         v1.0.0 -> v1.0.0
$ 
```
  - Expect: workflow to run
  - Actual: yes, it runs

3. Problem: file path was wrong for asset, so here is clean up process:
  - delete the release draft on Github itself
  - delete the tag locally `git tag -d v1.0.0`
  - delete the tag remotely `git push origin --delete v1.0.0`
  - correct the file path problem in workflow yaml
  - commit/push changes without a tag
  - tag the commit locally `git tag v1.0.0`
  - push tag `git push origin --tags`
  - note in above the tag was pushed separately from the code. **This may not work. The workflow is running, but it shows "master" instead of v1.0.0 as it did before. It also shows my commit message as the name of workflow instead of the one in the yaml workflow file.**

4. Problem: since the workflow splits per platform, I ended up with two "Release v1.0.0" releases. Surprised that is allowed. Oh well. Found this link used by a Rust app that does what I need:
https://github.com/marketplace/actions/upload-files-to-a-github-release
  - So do the cleanup per step 3 above. Note: must delete binaries before the release may be deleted.
  - correct the yaml per the Rust example
  - Commit, tag, and push
```
$ git commit -a -m "fixes to wf (3)"
[master f9cbc3a] fixes to wf (3)
 2 files changed, 28 insertions(+), 20 deletions(-)
$ git tag v1.0.0
$ git push origin --tags
Counting objects: 6, done.
Delta compression using up to 4 threads.
Compressing objects: 100% (4/4), done.
Writing objects: 100% (6/6), 1.06 KiB | 362.00 KiB/s, done.
Total 6 (delta 3), reused 0 (delta 0)
remote: Resolving deltas: 100% (3/3), completed with 3 local objects.
To github.com:unfoldingWord/book-package-app.git
 * [new tag]         v1.0.0 -> v1.0.0
$ 
```

5. Solution in #4 above did not work as expected. Next plan is:
  - make two workflows, both triggered the same
  - new one will just create the release, nothing else... should take seconds
  - the existing one is modified to remove the create release, but will retain uploading the assets.
  - First cleanup: 
    - delete the release draft on Github itself
    - delete the tag locally `git tag -d v1.0.0`
    - delete the tag remotely `git push origin --delete v1.0.0`
  - Expect: uploading will always be to the open, draft release
  - Actual: the action (svenstaro/upload-release-action@v1-release) uploaded the assets to the tag, not the release. hmmm.

6. By uploading assets to the tag, I can then manually create the release based on that tag and assets. Did this for release v1.0.0.




## Electron Packaging

The process is captured in script `build-electron.sh`. I have annotated the script to explain it.

The process is replicated in the Github Actions workflow. This is in `.github/workflows/build-electron.yml`.

## Electron Installers

- Linux Debian: https://github.com/electron-userland/electron-installer-debian
- Zip installer: https://github.com/electron-userland/electron-installer-zip
- Windows: https://github.com/electron/windows-installer
- MacOS: https://github.com/electron-userland/electron-installer-dmg



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


