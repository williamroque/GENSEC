import { spawn } from 'child_process';

import Window from './browser/window';

export default class Python {
    static run(args: any[], input: object | null, dataWindowClosesOnFinish: boolean) {
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
                const subprocess = spawn('python', args);

                if (input !== null) {
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

                subprocess.on('exit', () => {
                    if (dataWindowClosesOnFinish) {
                        progressWindow.window?.close();
                    }
                    resolve();
                });
            });
        });
    }

    static pipInstall(packageName: string) {
        return Python.run(`-m pip install --disable-pip-version-check ${packageName}`.split(' '), null, true);
    }
}