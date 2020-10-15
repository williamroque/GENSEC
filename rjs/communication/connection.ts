import { Db, DeleteWriteOpResultObject, FilterQuery, InsertWriteOpResult, MongoCallback, MongoClient, UpdateWriteOpResult } from 'mongodb';

export default class Connection {
    private readonly dbName: string;
    private readonly client: MongoClient;

    private db?: Db;

    constructor(dbName: string, host: string, port: string, username: string, password: string, certificatePath: string) {
        const url = `mongodb://${username}:${password}@${host}:${port}/?tls=true`;

        this.dbName = dbName;

        this.client = new MongoClient(url, {
            tlsCAFile: certificatePath,
            rejectUnauthorized: false
        });
    }

    connect() {
        return new Promise((resolve, reject) => {
            this.client.connect((err, res) => {
                if (err) {
                    reject(err);
                } else {
                    this.db = this.client.db(this.dbName);
                    resolve(res);
                }
            });
        });
    }

    insertDocuments(documents: any[], collectionName: string, callback: MongoCallback<InsertWriteOpResult<any>>) {
        const collection = this.db?.collection(collectionName);
        collection?.insertMany(documents, callback);
    }

    getAll(collectionName: string, callback: MongoCallback<any[]>) {
        const collection = this.db?.collection(collectionName);
        collection?.find({}).toArray(callback);
    }

    get(query: FilterQuery<any> | undefined, collectionName: string, callback: MongoCallback<any[]>) {
        const collection = this.db?.collection(collectionName);
        collection?.find(query).toArray(callback);
    }

    update(query: FilterQuery<any>, target: any, collectionName: string, callback: MongoCallback<UpdateWriteOpResult>) {
        const collection = this.db?.collection(collectionName);
        collection?.updateOne(query, { $set: target }, callback);
    }

    remove(query: FilterQuery<any>, collectionName: string, callback: MongoCallback<DeleteWriteOpResultObject>) {
        const collection = this.db?.collection(collectionName);
        collection?.deleteOne(query, callback);
    }

    close() {
        this.client.close();
    }
}