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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const path_1 = __importDefault(require("path"));
const unzipper_1 = __importDefault(require("unzipper"));
const rimraf_1 = __importDefault(require("rimraf"));
const python_1 = __importDefault(require("../python"));
class Filesystem {
    constructor(systemPath, expectedEntry) {
        this.systemPath = systemPath;
        this.expectedEntry = expectedEntry;
        if (!fs_1.default.existsSync(this.systemPath)) {
            fs_1.default.mkdirSync(this.systemPath);
        }
        this.system = this.traverse(this.systemPath) || { type: 'directory', files: {} };
    }
    traverse(currentPath) {
        const items = fs_1.default.readdirSync(currentPath);
        let system = { type: 'directory', files: {} };
        for (const item of items) {
            const itemPath = path_1.default.join(currentPath, item);
            if (item === 'manifest.json') {
                try {
                    const manifest = JSON.parse(fs_1.default.readFileSync(itemPath).toString());
                    if (typeof this.expectedEntry !== 'undefined' && (manifest === null || manifest === void 0 ? void 0 : manifest[this.expectedEntry[0]]) === this.expectedEntry[1]
                        || typeof this.expectedEntry === 'undefined') {
                        return {
                            type: 'package',
                            manifest: manifest
                        };
                    }
                    return;
                }
                catch (e) {
                    console.log(e);
                    return;
                }
            }
            else if (/^[A-Za-z_ ]+$/.test(item)) {
                const directory = this.traverse(itemPath);
                if (typeof directory !== 'undefined') {
                    system.files[item] = directory;
                }
            }
        }
        return system;
    }
    insertDirectory(directoryPath) {
        let currentPath = this.system;
        let fullPath = this.systemPath;
        directoryPath.forEach(item => {
            if (typeof currentPath.files !== 'undefined') {
                fullPath = path_1.default.join(fullPath, item);
                if (!(item in currentPath.files)) {
                    currentPath.files[item] = { type: 'directory', files: {} };
                    fs_1.default.mkdirSync(fullPath);
                }
                currentPath = currentPath.files[item];
            }
        });
    }
    attemptInsertPackage(packagePath) {
        return new Promise((resolve, reject) => {
            const extractionPath = path_1.default.join(this.systemPath, 'temp');
            if (fs_1.default.existsSync(extractionPath)) {
                rimraf_1.default.sync(extractionPath);
            }
            this.insertDirectory(['temp']);
            fs_1.default.createReadStream(packagePath).pipe(unzipper_1.default.Extract({ path: extractionPath })).on('close', () => __awaiter(this, void 0, void 0, function* () {
                try {
                    const { packageName, programName, requirements } = JSON.parse(fs_1.default.readFileSync(path_1.default.join(extractionPath, 'dist', 'manifest.json')).toString());
                    const targetPath = path_1.default.join(this.systemPath, programName, packageName);
                    this.insertDirectory([programName]);
                    if (fs_1.default.existsSync(targetPath)) {
                        rimraf_1.default.sync(targetPath);
                    }
                    fs_1.default.renameSync(path_1.default.join(extractionPath, 'dist'), targetPath);
                    rimraf_1.default.sync(extractionPath);
                    for (let i = 0; i < requirements.length; i++) {
                        yield python_1.default.pipInstall(requirements[i]);
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
exports.default = Filesystem;
