const settings = require('electron-settings');

const { spawn } = require('child_process');

const Window = require('./browser/window');

class Python {
    static run(args, input) {
        const errorWindow = new Window({
            width: 820,
            height: 700,
            minWidth: 400,
            minHeight: 600,
            show: false
        }, '../html/error.html', false);
        errorWindow.createWindow();

        const progressWindow = new Window({
            width: 820,
            height: 700,
            minWidth: 400,
            minHeight: 600
        }, '../html/progress.html', false);
        progressWindow.createWindow();
    
        return new Promise(resolve => {
            progressWindow.addWebListener('did-finish-load', () => {
                const subprocess = spawn('python', args.split(' '));

                if (typeof input !== 'undefined') {
                    subprocess.stdin.write(JSON.stringify(input));
                    subprocess.stdin.end();
                }

                subprocess.stderr.on('data', err => {
                    errorWindow.show();
                    errorWindow.dispatchWebEvent('error', err.toString());
                });

                subprocess.stdout.on('data', data => {
                    progressWindow.dispatchWebEvent('progress', data.toString());
                });

                subprocess.on('close', () => {
                    if (settings.getSync('dataWindowClosesOnFinish')) {
                        progressWindow.window.close();
                    }
                    resolve();
                });
            });
        });
    }

    static pipInstall(packageName) {
        return Python.run(`-m pip install --disable-pip-version-check ${packageName}`)
    }
}

module.exports = Python;
