import fs from 'fs';
import { Db, DeleteWriteOpResultObject, FilterQuery, MongoCallback, MongoClient, UpdateWriteOpResult } from 'mongodb';
import Communication from '../../rjs/communication/ipcr';

export default class Connection {
    private readonly dbName: string;
    private readonly collectionName: string;
    private readonly dataHeaders: string[];
    private readonly client: MongoClient;

    private db?: Db;

    constructor(dbName: string, collectionName: string, dataHeaders: string[], host: string, port: string, username: string, password: string, certificatePath: string) {
        const url = `mongodb://${username}:${password}@${host}:${port}/?tls=true`;

        this.dbName = dbName;
        this.collectionName = collectionName;
        this.dataHeaders = dataHeaders;

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

    insertDocument(document: any) {
        const collection = this.db?.collection(this.collectionName);
        collection?.insertOne(document);
    }

    getAll(callback: MongoCallback<any[]>) {
        const collection = this.db?.collection(this.collectionName);
        collection?.find({}).toArray(callback);
    }

    get(query: FilterQuery<any> | undefined, callback: MongoCallback<any[]>) {
        const collection = this.db?.collection(this.collectionName);
        collection?.find(query).toArray(callback);
    }

    update(query: FilterQuery<any>, target: any, callback: MongoCallback<UpdateWriteOpResult>) {
        const collection = this.db?.collection(this.collectionName);
        collection?.updateOne(query, { $set: target }, callback);
    }

    remove(query: FilterQuery<any>, callback: MongoCallback<DeleteWriteOpResultObject>) {
        const collection = this.db?.collection(this.collectionName);
        collection?.deleteOne(query, callback);
    }

    attemptImportData() {
        const filePath = Communication.requestOpenDialog([{ name: 'CSV File', extensions: ['csv', 'txt'] }]);

        if (typeof filePath !== 'undefined') {
            try {
                const data = fs.readFileSync(filePath[0]).toString();

                const rows = data.split('\n'), rowLength = rows.length;
                for (let i = 0; i < rowLength; i++) {
                    let rowData: { [propName: string]: string } = {};

                    const cols = rows[i].split(';');
                    for (let j = 0; j < cols.length; j++) {
                        rowData[this.dataHeaders[j].replace(/\./g, '')] = cols[j];
                    }

                    if (Object.keys(rowData).length === this.dataHeaders.length) {
                        this.insertDocument(rowData);
                    }
                }
            } catch (error) {
                Communication.requestDisplayErrorWindow(error);
            }
        }
    }

    close() {
        this.client.close();
    }
}