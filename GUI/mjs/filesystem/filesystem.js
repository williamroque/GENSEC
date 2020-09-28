const fs = require('fs');
const path = require('path');

const unzipper = require('unzipper');
const rimraf = require('rimraf');

const Python = require('../python');

class Filesystem {
    constructor(systemPath) {
        this.systemPath = systemPath;

        if (!fs.existsSync(this.systemPath)) {
            fs.mkdirSync(this.systemPath);
        }

        this.system = this.traverse(this.systemPath);
    }

    traverse(currentPath) {
        const items = fs.readdirSync(currentPath);

        let system = { type: 'directory', files: {} };

        for (const item of items) {
            const itemPath = path.join(currentPath, item);

            if (item === 'manifest.json') {
                system = {
                    type: 'package',
                    manifest: JSON.parse(fs.readFileSync(itemPath))
                };
            } else if (/^[A-Za-z_ ]+$/.test(item)) {
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

            fs.createReadStream(packagePath).pipe(
                unzipper.Extract({ path: extractionPath })
            ).on('close', async () => {
                try {
                    const { packageName, programName, requirements } = JSON.parse(
                        fs.readFileSync(
                            path.join(extractionPath, 'dist', 'manifest.json')
                        )
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

module.exports = Filesystem;
