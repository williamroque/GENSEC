"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = __importDefault(require("fs"));
const mongodb_1 = require("mongodb");
const ipcr_1 = __importDefault(require("../../rjs/communication/ipcr"));
class Connection {
    constructor(dbName, collectionName, dataHeaders, host, port, username, password, certificatePath) {
        const url = `mongodb://${username}:${password}@${host}:${port}/?tls=true`;
        this.dbName = dbName;
        this.collectionName = collectionName;
        this.dataHeaders = dataHeaders;
        this.client = new mongodb_1.MongoClient(url, {
            tlsCAFile: certificatePath,
            rejectUnauthorized: false
        });
    }
    connect() {
        return new Promise((resolve, reject) => {
            this.client.connect((err, res) => {
                if (err) {
                    reject(err);
                }
                else {
                    this.db = this.client.db(this.dbName);
                    resolve(res);
                }
            });
        });
    }
    insertDocument(document) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(this.collectionName);
        collection === null || collection === void 0 ? void 0 : collection.insertOne(document);
    }
    getAll(callback) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(this.collectionName);
        collection === null || collection === void 0 ? void 0 : collection.find({}).toArray(callback);
    }
    get(query, callback) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(this.collectionName);
        collection === null || collection === void 0 ? void 0 : collection.find(query).toArray(callback);
    }
    update(query, target, callback) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(this.collectionName);
        collection === null || collection === void 0 ? void 0 : collection.updateOne(query, { $set: target }, callback);
    }
    remove(query, callback) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(this.collectionName);
        collection === null || collection === void 0 ? void 0 : collection.deleteOne(query, callback);
    }
    attemptImportData() {
        const filePath = ipcr_1.default.requestOpenDialog([{ name: 'CSV File', extensions: ['csv', 'txt'] }]);
        if (typeof filePath !== 'undefined') {
            try {
                const data = fs_1.default.readFileSync(filePath[0]).toString();
                const rows = data.split('\n'), rowLength = rows.length;
                for (let i = 0; i < rowLength; i++) {
                    let rowData = {};
                    const cols = rows[i].split(';');
                    for (let j = 0; j < cols.length; j++) {
                        rowData[this.dataHeaders[j].replace(/\./g, '')] = cols[j];
                    }
                    if (Object.keys(rowData).length === this.dataHeaders.length) {
                        this.insertDocument(rowData);
                    }
                }
            }
            catch (error) {
                ipcr_1.default.requestDisplayErrorWindow(error);
            }
        }
    }
    close() {
        this.client.close();
    }
}
exports.default = Connection;
