"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
const fs = require('fs');
const path = require('path');
const unzipper = require('unzipper');
const rimraf = require('rimraf');
const Python = require('../python');
class Filesystem {
    constructor(systemPath, expectedEntry) {
        this.systemPath = systemPath;
        this.expectedEntry = expectedEntry;
        if (!fs.existsSync(this.systemPath)) {
            fs.mkdirSync(this.systemPath);
        }
        this.system = this.traverse(this.systemPath);
    }
    traverse(currentPath) {
        var _a, _b;
        const items = fs.readdirSync(currentPath);
        let system = { type: 'directory', files: {} };
        for (const item of items) {
            const itemPath = path.join(currentPath, item);
            if (item === 'manifest.json') {
                try {
                    const manifest = JSON.parse(fs.readFileSync(itemPath));
                    if ((manifest === null || manifest === void 0 ? void 0 : manifest[(_a = this.expectedEntry) === null || _a === void 0 ? void 0 : _a[0]]) === ((_b = this.expectedEntry) === null || _b === void 0 ? void 0 : _b[1])) {
                        system = {
                            type: 'package',
                            manifest: JSON.parse(fs.readFileSync(itemPath))
                        };
                    }
                }
                catch (e) {
                    console.log(e);
                    return { type: 'directory', files: {} };
                }
            }
            else if (/^[A-Za-z_ ]+$/.test(item)) {
                system.files[item] = this.traverse(itemPath);
            }
        }
        return system;
    }
    insertDirectory(directoryPath) {
        let currentPath = this.system;
        let fullPath = this.systemPath;
        directoryPath.forEach(item => {
            fullPath = path.join(fullPath, item);
            if (!(item in currentPath.files)) {
                currentPath.files[item] = { type: 'directory', files: {} };
                fs.mkdirSync(fullPath);
            }
            currentPath = currentPath.files[item];
        });
    }
    attemptInsertPackage(packagePath) {
        return new Promise((resolve, reject) => {
            const extractionPath = path.join(this.systemPath, 'temp');
            if (fs.existsSync(extractionPath)) {
                rimraf.sync(extractionPath);
            }
            this.insertDirectory(['temp']);
            fs.createReadStream(packagePath).pipe(unzipper.Extract({ path: extractionPath })).on('close', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { packageName, programName, requirements } = JSON.parse(fs.readFileSync(path.join(extractionPath, 'dist', 'manifest.json')));
                    const targetPath = path.join(this.systemPath, programName, packageName);
                    this.insertDirectory([programName]);
                    if (fs.existsSync(targetPath)) {
                        rimraf.sync(targetPath);
                    }
                    fs.renameSync(path.join(extractionPath, 'dist'), targetPath);
                    rimraf.sync(extractionPath);
                    for (let i = 0; i < requirements.length; i++) {
                        yield Python.pipInstall(requirements[i]);
                    }
                    resolve();
                }
                catch (error) {
                    reject(error);
                }
            }));
        });
    }
}
module.exports = Filesystem;
