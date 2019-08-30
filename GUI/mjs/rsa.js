const { spawn } = require('child_process');

class RSA {
    constructor(utilPath) {
        this.utilPath = utilPath;
    }

    generateKeys() {
        const subprocess = spawn('python3', [`${this.utilPath}/generate_keys.py`]);

        let out = '';

        subprocess.stdout.on('data', data => {
            out += data.toString().trim();
        });

        subprocess.stderr.on('data', data => {
            console.log(data.toString());
        });

        return new Promise(resolve => {
            subprocess.on('close', () => {
                const [ n, keys, primes ] = out.split('|');
                const [ e, d ] = keys.split(';');

                resolve({
                    pub: [e, n],
                    prv: [d, n],
                    primes: primes.split(';')
                });
            });
        });
    }

    encrypt(msg, key) {
        const subprocess = spawn('python3', [`${this.utilPath}/encrypt.py`]);

        subprocess.stdin.write(`${key[0]}:${key[1]}\n${msg}`);
        subprocess.stdin.end();

        let out = '';

        subprocess.stdout.on('data', data => {
            out += data.toString().trim();
        });

        return new Promise(resolve => {
            subprocess.on('close', () => {
                resolve(out);
            });
        });
    }

    decrypt(msg, key, primes, callback=()=>{}) {
        this.out = '';

        const subprocess = spawn('python3', [`${this.utilPath}/decrypt.py`]);

        subprocess.stdin.write(`${key[0]}:${key[1]}${primes ? ';' + primes.join(':') : ''}\n${!primes|0}\n${msg}`);
        subprocess.stdin.end();

        subprocess.stdout.on('data', data => {
            data = data.toString();
            callback(data);

            this.out += data;
        });

        subprocess.stderr.on('data', data => {
            process.stdout.write(data.toString());
        });

        return {
            then: c => {
                subprocess.on('close', () => {
                    c(this.out);
                });
            }
        };
    }
}

module.exports = RSA;
