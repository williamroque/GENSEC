"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongodb_1 = require("mongodb");
class Connection {
    constructor(dbName, host, port, username, password, certificatePath) {
        const url = `mongodb://${username}:${password}@${host}:${port}/?tls=true`;
        this.dbName = dbName;
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
    insertDocuments(documents, collectionName, callback) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(collectionName);
        collection === null || collection === void 0 ? void 0 : collection.insertMany(documents, callback);
    }
    getAll(collectionName, callback) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(collectionName);
        collection === null || collection === void 0 ? void 0 : collection.find({}).toArray(callback);
    }
    get(query, collectionName, callback) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(collectionName);
        collection === null || collection === void 0 ? void 0 : collection.find(query).toArray(callback);
    }
    update(query, target, collectionName, callback) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(collectionName);
        collection === null || collection === void 0 ? void 0 : collection.updateOne(query, { $set: target }, callback);
    }
    remove(query, collectionName, callback) {
        var _a;
        const collection = (_a = this.db) === null || _a === void 0 ? void 0 : _a.collection(collectionName);
        collection === null || collection === void 0 ? void 0 : collection.deleteOne(query, callback);
    }
    close() {
        this.client.close();
    }
}
exports.default = Connection;
