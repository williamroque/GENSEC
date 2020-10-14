import Manifest from "./manifest";

import fs from 'fs';
import path from 'path';

import unzipper from 'unzipper';
import rimraf from 'rimraf';

import Python from '../python';

export interface SystemFiles {
    [propName: string]: System
}

export interface System {
    type: string,
    manifest?: Manifest,
    files?: SystemFiles
}

export default class Filesystem {
    private readonly systemPath: string;
    private readonly expectedEntry?: [string, any];

    system: System;

    constructor(systemPath: string, expectedEntry?: [string, any]) {
        this.systemPath = systemPath;
        this.expectedEntry = expectedEntry;

        if (!fs.existsSync(this.systemPath)) {
            fs.mkdirSync(this.systemPath);
        }

        this.system = this.traverse(this.systemPath);
    }

    traverse(currentPath: string) {
        const items = fs.readdirSync(currentPath);

        let system: System = { type: 'directory', files: {} };

        for (const item of items) {
            const itemPath = path.join(currentPath, item);

            if (item === 'manifest.json') {
                try {
                    const manifest = JSON.parse(fs.readFileSync(itemPath).toString());

                    if (
                        typeof this.expectedEntry !== 'undefined' && manifest?.[this.expectedEntry[0]] === this.expectedEntry[1]
                        || typeof this.expectedEntry === 'undefined'
                    ) {
                        return {
                            type: 'package',
                            manifest: manifest
                        };
                    }
                } catch(e) {
                    console.log(e);

                    return { type: 'directory', files: {} };
                }
            } else if (/^[A-Za-z_ ]+$/.test(item)) {
                (system.files as SystemFiles)[item] = this.traverse(itemPath);
            }
        }

        return system;
    }

    insertDirectory(directoryPath: [string]) {
        let currentPath = this.system;
        let fullPath = this.systemPath;

        directoryPath.forEach(item => {
            if (typeof currentPath.files !== 'undefined') {
                fullPath = path.join(fullPath, item);

                if (!(item in currentPath.files)) {
                    currentPath.files[item] = { type: 'directory', files: {} };
                    fs.mkdirSync(fullPath);
                }

                currentPath = currentPath.files[item];
            }
        });
    }

    attemptInsertPackage(packagePath: string) {
        return new Promise((resolve, reject) => {
            const extractionPath = path.join(this.systemPath, 'temp');

            if (fs.existsSync(extractionPath)) {
                rimraf.sync(extractionPath);
            }
            this.insertDirectory(['temp']);

            fs.createReadStream(packagePath).pipe(
                unzipper.Extract({ path: extractionPath })
            ).on('close', async () => {
                try {
                    const { packageName, programName, requirements } = JSON.parse(
                        fs.readFileSync(
                            path.join(extractionPath, 'dist', 'manifest.json')
                        ).toString()
                    );
                    const targetPath = path.join(this.systemPath, programName, packageName);

                    this.insertDirectory([programName]);

                    if (fs.existsSync(targetPath)) {
                        rimraf.sync(targetPath);
                    }

                    fs.renameSync(
                        path.join(extractionPath, 'dist'),
                        targetPath
                    );
                    rimraf.sync(extractionPath);

                    for (let i = 0; i < requirements.length; i++) {
                        await Python.pipInstall(requirements[i]);
                    }

                    resolve();
                } catch (error) {
                    reject(error);
                }
            });
        });
    }
}