const { MongoClient } = require('mongodb');

class Connection {
    constructor(dbName, host, port, username, password, certificatePath, callback) {
        const url = `mongodb://${username}:${password}@${host}:${port}/?tls=true`;

        this._client = new MongoClient(url, {
            tlsCAFile: certificatePath,
            rejectUnauthorized: false
        });

        this._client.connect((err, res) => {
            this._db = this._client.db(dbName);
            callback(err, res);
        });
    }

    insertDocuments(documents, collectionName, callback) {
        const collection = this._db.collection(collectionName);
        collection.insertMany(documents, callback);
    }

    getAll(collectionName, callback) {
        const collection = this._db.collection(collectionName);
        collection.find({}).toArray(callback);
    }

    get(query, collectionName, callback) {
        const collection = this._db.collection(collectionName);
        collection.find(query).toArray(callback);
    }

    update(query, target, collectionName, callback) {
        const collection = this._db.collection(collectionName);
        collection.updateOne(query, { $set: target }, callback);
    }

    remove(query, collectionName, callback) {
        const collection = this._db.collection(collectionName);
        collection.deleteOne(query, callback);
    }

    close() {
        this._client.close();
    }
}

module.exports = Connection;
