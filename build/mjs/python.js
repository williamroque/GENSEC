"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const child_process_1 = require("child_process");
const window_1 = __importDefault(require("./browser/window"));
class Python {
    static run(args, input, dataWindowClosesOnFinish) {
        const errorWindow = new window_1.default({
            width: 820,
            height: 700,
            minWidth: 400,
            minHeight: 600,
            show: false
        }, '../html/error.html', false);
        errorWindow.createWindow();
        const progressWindow = new window_1.default({
            width: 820,
            height: 700,
            minWidth: 400,
            minHeight: 600
        }, '../html/progress.html', false);
        progressWindow.createWindow();
        return new Promise(resolve => {
            progressWindow.addWebListener('did-finish-load', () => {
                const subprocess = child_process_1.spawn('python', args);
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
                    var _a;
                    if (dataWindowClosesOnFinish) {
                        (_a = progressWindow.window) === null || _a === void 0 ? void 0 : _a.close();
                    }
                    resolve();
                });
            });
        });
    }
    static pipInstall(packageName) {
        return Python.run(`-m pip install --disable-pip-version-check ${packageName}`.split(' '), null, true);
    }
}
exports.default = Python;
