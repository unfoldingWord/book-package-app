const electronInstaller = require('electron-winstaller');

async function createWinInstaller() {
    try {
        await electronInstaller.createWindowsInstaller({
            appDirectory: './electron/book-package-app-win32-x64',
            outputDirectory: './dist',
            authors: 'unfoldingWord',
            exe: 'book-package-app.exe',
            version: '0.1.0'
        });
        console.log('It worked!');
    } catch (e) {
        err = `No dice: ${e.message}`;
        console.log(err);
        throw(err);
    }
}

createWinInstaller();