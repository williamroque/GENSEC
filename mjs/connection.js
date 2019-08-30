const net = require('net');
const crypto = require('crypto');

const RSA = require('./rsa');

class Connection {
    constructor(host, port, username, password, event, utilPath) {
        this.utilPath = utilPath;

        this.event = event;

        this.host = host;
        this.port = port;

        this.username = username;
        this.password = password;

        this.rsa = new RSA(utilPath);

        this.init = new Promise(resolve => {
            this.generateKeys().then(keys => {
                this.keys = keys;
            }).then(() => {
                return resolve(this.establishConnection());
            });
        });
    }

    generateKeys() {
        return new Promise(resolve => {
            this.rsa.generateKeys().then(keys => {
                resolve(keys);
            }).catch(e => console.log(e));
        });
    }

    establishConnection() {
        return new Promise((resolve, reject) => {
            let phase = 0;

            this.client = net.createConnection({
                host: this.host,
                port: this.port
            }, () => {
                console.log('Initialized socket.');

                this.client.write(this.keys.pub.join('|'));
            });

            this.client.on('error', err => {
                console.log(err);
                this.event.returnValue = 'network_error';
                reject('network_error');
                this.client.end();
            })

            this.client.setTimeout(5000);
            this.client.on('timeout', () => {
                this.event.returnValue = 'network_timeout';
                reject('network_timeout');
                this.client.end();
            });

            this.data = [];
            this.client.on('data', data => {
                data = data.toString();
                if (data === 'ping') {
                    return;
                }
                switch (phase) {
                    case 0:
                        let [ serverKey, sTest ] = data.split(';');
                        this.rsa.decrypt(sTest, this.keys.prv, this.keys.primes).then(sTest => {
                            if (sTest === 'patently-debatable-1208') {
                                this.serverKey = serverKey.split('|');
                                this.sendEncrypted(`${this.username};${this.password}`, this.serverKey, this.keys.prv);
                                resolve();
                            } else {
                                this.client.end();
                                reject('network_error');
                            }
                        });

                        phase++;
                        break;
                    case 1:
                        this.data.push(data);
                }
            });

            this.client.on('end', () => {
                console.log('Disconnected from server.');
                this.client.end();
            });
        });
    }

    createHash(msg) {
        return crypto.createHash('sha256').update(msg).digest('hex');
    }

    sendEncrypted(msg, targetPub, localPrv) {
        this.rsa.encrypt(this.createHash(msg), localPrv).then(hash => {
            this.rsa.encrypt(msg, targetPub).then(body => {
                this.client.write(`${hash}:${body}`);
            });
        });
    }

    recEncrypted(prv, callback) {
        this.data = [];

        return new Promise((resolve, reject) => {
            const iloop = () => {
                let loopCancelled = false;

                if (this.data.length > 0) {
                    if (this.data.slice(-1)[0].slice(-4) === 'exit') {
                        let [ hash, body ] = this.data.join('').slice(0, -4).split(':');

                        this.rsa.decrypt(hash, this.serverKey).then(hash => {
                            this.rsa.decrypt(body, prv, this.keys.primes, callback).then(body => {
                                if (hash === this.createHash(body)) {
                                    resolve(body);
                                } else {
                                    reject('Invalid hash.');
                                }
                            });
                        });

                        loopCancelled = true;
                    }
                }

                if (!loopCancelled) {
                    setTimeout(iloop, 100);
                }
            };
            iloop();
        });
    }

    makeRequest(req, callback) {
        return new Promise((resolve, reject) => {
            this.sendEncrypted(req, this.serverKey, this.keys.prv);

            this.recEncrypted(this.keys.prv, callback)
                .then(body => resolve(body))
                .catch(e => reject(e));
        });
    }

    close() {
        this.client.end();
    }
}

module.exports = Connection;